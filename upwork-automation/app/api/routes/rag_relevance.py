import os
import json
import time
import asyncio
import logging
import random
from typing import List, Dict, Any, Tuple, Optional, Literal
from enum import Enum
import datetime
from fastapi import APIRouter, Depends, HTTPException
from pydantic import Field, BaseModel
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session, joinedload
from .agents.structures import JobData, MatchScore, CompanyProfile, RelevanceCategory # Ensure this path is correct
from sqlalchemy.orm import Session
from app.db.database import get_db # Ensure this path is correct
from app.models.jobs import Job, JobRelevance # Ensure this path is correct
from app.schemas.jobs import JobResponse as JobSchema # Ensure this path is correct
import re
import openai
import hashlib
import faiss
import numpy as np
from langchain_text_splitters import RecursiveCharacterTextSplitter
from pydantic import BaseModel

class ToggleRequest(BaseModel):
    enabled: bool

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

try:
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
except NameError:
    logger.warning("__file__ not defined, using current working directory for BASE_DIR. This might be incorrect if not run as a module.")
    BASE_DIR = os.getcwd()

COMPANY_PROFILE_MD_PATH = os.path.join(BASE_DIR, "agents", "company_profile.md")
COMPANY_DETAILS_MD_PATH = os.path.join(BASE_DIR, "agents", "company_details.md")

RAG_DATA_DIR = os.path.join(BASE_DIR, "rag_data")
FAISS_INDEX_FILE_NAME = "vector_store.faiss"
FAISS_METADATA_FILE_NAME = "metadata.json"
FILE_HASHES_FILE_NAME = "file_hashes.json"
OPENAI_EMBEDDING_MODEL = "text-embedding-3-small"
EMBEDDING_DIM = 1536
NUM_RETRIEVED_CHUNKS = 9

# Global variable to store the ISO formatted string of the publishedDateTime
# of the most recent job processed by the cron.
LAST_CRON_PROCESSED_PUBLISHED_DATETIME_ISO: Optional[str] = None


def is_within_schedule() -> bool:
    """Check if current time is within the scheduled window (6:30 PM to 3:30 AM Pakistan time)"""
    from datetime import datetime
    import pytz

    pakistan_tz = pytz.timezone("Asia/Karachi")
    current_time = datetime.now(pakistan_tz)
    current_time_str = current_time.strftime("%H:%M")

    start_time = datetime.strptime("18:30", "%H:%M").time()
    end_time = datetime.strptime("03:30", "%H:%M").time()
    current_time_obj = datetime.strptime(current_time_str, "%H:%M").time()

    if start_time > end_time:
        return current_time_obj >= start_time or current_time_obj <= end_time
    else:
        return start_time <= current_time_obj <= end_time

def is_relevance_check_enabled() -> bool:
    """Check if relevance check is enabled based on manual override and schedule"""
    env_var = os.getenv("ENABLE_JOB_RELEVANCE")
    if env_var is not None: 
        if env_var.lower() == "false":
            return False 
        elif env_var.lower() == "true":
            return True 
    return is_within_schedule()

def get_openai_client():
    """Initialize and return an OpenAI client."""
    api_key = os.getenv("OPEN_AI_KEY")
    if not api_key:
        raise ValueError("No OpenAI API key found in environment variables (OPEN_AI_KEY).")
    return openai.OpenAI(api_key=api_key)

def load_markdown_content(file_path: str) -> str:
    """Load content from a markdown file."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()
    except FileNotFoundError:
        logger.error(f"Markdown file not found: {file_path}")
        return ""
    except Exception as e:
        logger.error(f"Error reading markdown file {file_path}: {str(e)}")
        return ""

class FAISSIndexManager:
    def __init__(self, openai_client: openai.OpenAI,
                 profile_md_path: str, details_md_path: str,
                 rag_data_dir: str = RAG_DATA_DIR,
                 index_file_name: str = FAISS_INDEX_FILE_NAME,
                 metadata_file_name: str = FAISS_METADATA_FILE_NAME,
                 hashes_file_name: str = FILE_HASHES_FILE_NAME):
        self.openai_client = openai_client
        self.profile_md_path = profile_md_path
        self.details_md_path = details_md_path

        os.makedirs(rag_data_dir, exist_ok=True)
        self.index_path = os.path.join(rag_data_dir, index_file_name)
        self.metadata_path = os.path.join(rag_data_dir, metadata_file_name)
        self.hashes_path = os.path.join(rag_data_dir, hashes_file_name)

        self.index: Optional[faiss.Index] = None
        self.chunks_metadata: List[Dict[str, str]] = []

        self._load_or_build_index()

    def _get_file_hash(self, file_path: str) -> Optional[str]:
        if not os.path.exists(file_path):
            return None
        hasher = hashlib.md5()
        with open(file_path, 'rb') as f:
            buf = f.read()
            hasher.update(buf)
        return hasher.hexdigest()

    def _load_stored_hashes(self) -> Dict[str, str]:
        if os.path.exists(self.hashes_path):
            try:
                with open(self.hashes_path, 'r') as f:
                    return json.load(f)
            except json.JSONDecodeError:
                logger.error(f"Error decoding {self.hashes_path}. Will rebuild index.")
                return {}
        return {}

    def _save_current_hashes(self, current_hashes: Dict[str, str]):
        with open(self.hashes_path, 'w') as f:
            json.dump(current_hashes, f)

    def _check_if_rebuild_needed(self) -> bool:
        if not os.path.exists(self.index_path) or \
           not os.path.exists(self.metadata_path) or \
           not os.path.exists(self.hashes_path):
            logger.info("Index, metadata or hashes file not found. Rebuilding index.")
            return True

        stored_hashes = self._load_stored_hashes()
        current_hashes = {
            "profile": self._get_file_hash(self.profile_md_path),
            "details": self._get_file_hash(self.details_md_path)
        }

        if stored_hashes.get("profile") != current_hashes["profile"] or \
           stored_hashes.get("details") != current_hashes["details"]:
            logger.info("Markdown file content has changed. Rebuilding index.")
            return True

        if current_hashes["profile"] is None and stored_hashes.get("profile") is not None:
            logger.info(f"{self.profile_md_path} removed. Rebuilding index.")
            return True
        if current_hashes["details"] is None and stored_hashes.get("details") is not None:
            logger.info(f"{self.details_md_path} removed. Rebuilding index.")
            return True

        return False

    def _chunk_text(self, text: str, source_name: str,
                    chunk_size: int = 800, chunk_overlap: int = 100) -> List[Dict[str, str]]:

        chunks = []

        if source_name == "individual_profiles":
            profile_blocks = re.split(r'\n- name:', text)
            for i, block_content in enumerate(profile_blocks):
                if not block_content.strip():
                    continue
                full_profile_text = f"- name:{block_content.strip()}" if i > 0 else block_content.strip()
                sub_splitter = RecursiveCharacterTextSplitter(
                    separators=["\n\n", "\n", " ", ""],
                    chunk_size=chunk_size,
                    chunk_overlap=chunk_overlap,
                    length_function=len,
                )
                sub_docs = sub_splitter.create_documents([full_profile_text])
                for j, doc in enumerate(sub_docs):
                    chunks.append({
                        "text": doc.page_content,
                        "source": source_name,
                        "id": f"{source_name}_{i}_{j}"
                    })

        elif source_name == "company_profile":
            splitter = RecursiveCharacterTextSplitter(
                separators=["\n# ", "\n## ", "\n### ", "\n#### ", "\n\n", "\n", " ", ""],
                chunk_size=chunk_size,
                chunk_overlap=chunk_overlap,
                length_function=len,
                is_separator_regex=False,
            )
            docs = splitter.create_documents([text])
            for i, doc in enumerate(docs):
                chunks.append({
                    "text": doc.page_content,
                    "source": source_name,
                    "id": f"{source_name}_{i}"
                })
        else:
            logger.warning(f"Unknown source_name '{source_name}'. Using default chunking strategy.")
            splitter = RecursiveCharacterTextSplitter(
                separators=["\n\n", "\n", " ", ""],
                chunk_size=chunk_size,
                chunk_overlap=chunk_overlap,
                length_function=len,
            )
            docs = splitter.create_documents([text])
            for i, doc in enumerate(docs):
                chunks.append({
                    "text": doc.page_content,
                    "source": source_name,
                    "id": f"{source_name}_{i}"
                })
        return chunks

    def _get_embeddings(self, texts: List[str]) -> np.ndarray:
        embeddings_list = []
        try:
            response = self.openai_client.embeddings.create(
                input=texts,
                model=OPENAI_EMBEDDING_MODEL
            )
            embeddings_list = [item.embedding for item in response.data]
        except Exception as e:
            logger.error(f"Error getting embeddings from OpenAI: {e}")
            raise
        return np.array(embeddings_list).astype('float32')


    def _build_index(self):
        logger.info("Building new FAISS index...")
        all_raw_chunks: List[Dict[str, str]] = []

        company_profile_content = load_markdown_content(self.profile_md_path)
        if company_profile_content:
            all_raw_chunks.extend(self._chunk_text(company_profile_content, "company_profile"))
        else:
            logger.warning(f"Company profile markdown not found or empty: {self.profile_md_path}")


        individual_profiles_content = load_markdown_content(self.details_md_path)
        if individual_profiles_content:
            all_raw_chunks.extend(self._chunk_text(individual_profiles_content, "individual_profiles"))
        else:
            logger.warning(f"Individual details markdown not found or empty: {self.details_md_path}")

        if not all_raw_chunks:
            logger.error("No content to index. FAISS index will be empty.")
            self.chunks_metadata = []
            self.index = None
            # Create an empty index file if one doesn't exist to prevent errors on load
            if not os.path.exists(self.index_path):
                empty_index = faiss.IndexFlatL2(EMBEDDING_DIM)
                faiss.write_index(empty_index, self.index_path)
            with open(self.metadata_path, 'w') as f: json.dump([], f)
            self._save_current_hashes({
                "profile": self._get_file_hash(self.profile_md_path),
                "details": self._get_file_hash(self.details_md_path)
            })
            return

        self.chunks_metadata = all_raw_chunks
        chunk_texts = [chunk["text"] for chunk in self.chunks_metadata]

        try:
            embeddings_np = self._get_embeddings(chunk_texts)
        except Exception as e:
            logger.error(f"Failed to generate embeddings during index build: {e}")
            if os.path.exists(self.index_path): os.remove(self.index_path)
            if os.path.exists(self.metadata_path): os.remove(self.metadata_path)
            if os.path.exists(self.hashes_path): os.remove(self.hashes_path)
            self.index = None
            return


        self.index = faiss.IndexFlatL2(EMBEDDING_DIM)
        self.index.add(embeddings_np)

        faiss.write_index(self.index, self.index_path)
        with open(self.metadata_path, 'w') as f:
            json.dump(self.chunks_metadata, f)

        current_hashes = {
            "profile": self._get_file_hash(self.profile_md_path),
            "details": self._get_file_hash(self.details_md_path)
        }
        self._save_current_hashes(current_hashes)
        logger.info(f"FAISS index built and saved with {len(self.chunks_metadata)} chunks.")

    def _load_index(self) -> bool:
        try:
            self.index = faiss.read_index(self.index_path)
            with open(self.metadata_path, 'r') as f:
                self.chunks_metadata = json.load(f)
            logger.info(f"FAISS index and metadata loaded successfully with {len(self.chunks_metadata)} chunks.")
            return True
        except Exception as e:
            logger.error(f"Failed to load FAISS index or metadata: {e}")
            return False

    def _load_or_build_index(self):
        if self._check_if_rebuild_needed():
            self._build_index()
        elif not self._load_index():
            logger.warning("Failed to load existing index. Attempting rebuild.")
            self._build_index()

        if self.index is None and not self.chunks_metadata :
             logger.warning("Index is not available and no content was found to build it. RAG queries will return empty.")
             # Ensure a dummy index exists if building failed or no data was found
             self.index = faiss.IndexFlatL2(EMBEDDING_DIM)
             self.chunks_metadata = []


    def query(self, query_text: str, k: int = NUM_RETRIEVED_CHUNKS) -> List[Dict[str, Any]]:
        if not self.index or self.index.ntotal == 0 or not self.chunks_metadata:
            logger.warning("FAISS index is not initialized or empty. Cannot perform query.")
            return []
        try:
            query_embedding = self._get_embeddings([query_text])
            distances, indices = self.index.search(query_embedding, k=min(k, self.index.ntotal))

            results = []
            for i in range(len(indices[0])):
                idx = indices[0][i]
                if 0 <= idx < len(self.chunks_metadata):
                    results.append({
                        "text": self.chunks_metadata[idx]["text"],
                        "source": self.chunks_metadata[idx]["source"],
                        "id": self.chunks_metadata[idx]["id"],
                        "distance": float(distances[0][i])
                    })
            return results
        except Exception as e:
            logger.error(f"Error during FAISS query: {e}")
            return []

GLOBAL_FAISS_MANAGER: Optional[FAISSIndexManager] = None
try:
    logger.info(f"Attempting to initialize FAISSIndexManager...")
    logger.info(f"RAG Data Directory: {RAG_DATA_DIR}")
    logger.info(f"Company Profile MD Path: {COMPANY_PROFILE_MD_PATH}")
    logger.info(f"Company Details MD Path: {COMPANY_DETAILS_MD_PATH}")

    os.makedirs(RAG_DATA_DIR, exist_ok=True)
    _openai_client_for_rag = get_openai_client()
    GLOBAL_FAISS_MANAGER = FAISSIndexManager(
        openai_client=_openai_client_for_rag,
        profile_md_path=COMPANY_PROFILE_MD_PATH,
        details_md_path=COMPANY_DETAILS_MD_PATH
    )
    logger.info("FAISSIndexManager initialized successfully.")
except ValueError as ve:
    logger.critical(f"CRITICAL: Failed to initialize FAISSIndexManager due to missing OpenAI key: {ve}")
    GLOBAL_FAISS_MANAGER = None
except Exception as e:
    logger.error(f"Failed to initialize FAISSIndexManager globally: {e}", exc_info=True)
    GLOBAL_FAISS_MANAGER = None


def load_job_by_id(job_id: str, db: Session) -> Optional[JobData]:
    """Load a single job from the database by ID and map to JobData Pydantic model."""
    try:
        # Query using the primary key 'id' (which is Text type in Job model)
        job = db.query(Job).filter(Job.id == job_id).first()
        if not job:
            logger.warning(f"Job with ID {job_id} not found in database.")
            return None

        # Instantiate JobData Pydantic model, ensuring all fields are correctly mapped
        # and optional fields are handled.
        try:
            # Determine job_link: If Job.ciphertext is the link, use it. Otherwise, None or placeholder.
            # For this example, assuming no direct job_link field in DB or it's derived elsewhere.
            # If job.ciphertext is the link, you'd use: job_link_value = job.ciphertext
            job_link_value = None # Placeholder if no direct mapping

            # Determine job_posted_on_date:
            job_posted_date_str = None
            if job.publishedDateTime:
                try:
                    job_posted_date_str = job.publishedDateTime.date().isoformat()
                except AttributeError: # Handle if publishedDateTime is not a datetime object
                    logger.warning(f"Job {job.id} has invalid publishedDateTime format: {job.publishedDateTime}")


            job_data_instance = JobData(
                job_id=str(job.id),  # Ensure it's a string, though Job.id is Text
                job_title=job.title if job.title is not None else "N/A", # Handle potential None
                job_description=job.description if job.description is not None else "N/A", # Handle potential None
                
                job_link=job_link_value, # Uses the determined value or None
                
                team_name=job.team_name, # Directly pass, JobData.team_name is Optional
                
                client_country=job.client_country, # Directly pass, JobData.client_country is Optional
                category_label=job.category_label, # Directly pass, JobData.category_label is Optional
                subcategory_label=job.subcategory_label, # Directly pass, JobData.subcategory_label is Optional
                job_posted_on_date=job_posted_date_str # Use the derived date string
            )
            return job_data_instance
        except Exception as pydantic_exc: # Catch Pydantic ValidationError or other model instantiation issues
            logger.error(f"Error creating JobData Pydantic model for job {job_id}: {pydantic_exc}", exc_info=True)
            return None # Return None if Pydantic model creation fails

    except Exception as e:
        logger.error(f"Error loading job {job_id} from database: {e}", exc_info=True)
        return None

def update_database_for_single_job(db: Session, match_data: MatchScore):
    """Update the job record in the database with the relevance score and reasoning for a single job."""
    try:
        match_score_dict = match_data.model_dump()
    except AttributeError:
        match_score_dict = match_data.dict()
    logger.debug(f"Attempting DB update for job {match_data.job_id} with data: {match_score_dict}")
    try:
        # Job.id is Text, match_data.job_id is str, direct comparison is fine.
        job = db.query(Job).options(joinedload(Job.relevance)).filter(Job.id == match_data.job_id).first()

        if not job:
            logger.error(f"Job with ID {match_data.job_id} not found in database during update.")
            return

        relevance_obj = job.relevance

        if relevance_obj:
            logger.debug(f"Updating existing JobRelevance for job {job.id}")
            relevance_obj.score = match_data.score
            relevance_obj.category = match_data.category.value # Use .value for Enum
            relevance_obj.reasoning = match_data.reasoning
            relevance_obj.technology_match = match_data.technology_match
            relevance_obj.portfolio_match = match_data.portfolio_match
            relevance_obj.project_match = match_data.project_match
            relevance_obj.location_match = match_data.location_match
            relevance_obj.closest_profile_name = match_data.closest_profile_name
            relevance_obj.tags = json.dumps(match_data.tags) if match_data.tags is not None else None # Store list as JSON string
        else:
            logger.debug(f"Creating new JobRelevance for job {job.id}")
            relevance_obj = JobRelevance(
                id=job.id, # JobRelevance.id is Text, matches Job.id
                score=match_data.score,
                category=match_data.category.value, # Use .value for Enum
                reasoning=match_data.reasoning,
                technology_match=match_data.technology_match,
                portfolio_match=match_data.portfolio_match,
                project_match=match_data.project_match,
                location_match=match_data.location_match,
                closest_profile_name=match_data.closest_profile_name,
                tags=json.dumps(match_data.tags) if match_data.tags is not None else None # Store list as JSON string
            )
            job.relevance = relevance_obj

        db.commit()
        logger.debug(f"Successfully committed update for job {job.id}")

    except Exception as e:
        logger.error(f"Database ORM error during update for job {match_data.job_id}: {e}", exc_info=True)
        logger.info(f"Rolling back transaction for job {match_data.job_id} due to error.")
        db.rollback()
        raise

def analyze_jobs_in_batch(jobs: List[JobData], openai_client: openai.OpenAI) -> List[Dict[str, Any]]:
    """Analyzes a batch of jobs using OpenAI API and RAG, returns a list of analysis results."""

    if GLOBAL_FAISS_MANAGER is None:
        logger.error("GLOBAL_FAISS_MANAGER is not initialized. Cannot perform RAG-based analysis.")
        return [{"id": job.job_id, "error": "RAG system not available."} for job in jobs]


    logger.info(f"--- RAG + OpenAI API Call Start - {len(jobs)} jobs ---")

    system_prompt = """
    You are an expert job matching agent. Your task is to analyze job descriptions to determine
    if they are a good fit for our company, helping us apply only to relevant jobs.

    For each job in the batch, you will be provided with:
    1.  RETRIEVED CONTEXT: Relevant excerpts retrieved from our company profile and individual team member profiles, specifically tailored to the job.
    2.  JOB DETAILS: The job's title, description, client country, etc.

    Analyze each job individually based PRIMARILY on the provided RETRIEVED CONTEXT and the JOB DETAILS for THAT SPECIFIC JOB.

    Pay special attention to how the job requirements match with:
    - The company's tools and technologies mentioned in the RETRIEVED CONTEXT.
    - The company's past projects and portfolio items mentioned in the RETRIEVED CONTEXT.
    - Location requirements or preferences in the job description.

    NOTE: IF RELEVANT TOOLS, TECHNOLOGY, OR COMPANY EXPERIENCE LISTING IS NOT MENTIONED IN THE RETRIEVED CONTEXT OR JOB DETAILS, MARK IT AS IRRELEVANT or score lower.

    Score the match from 0.0 to 1.0 where:
    - 0.0-0.29: Irrelevant match (no relevant skills or experience based on context, no direct experience with tools)
    - 0.3-0.49: Low match (some relevant skills and little experience based on context)
    - 0.5-0.79: Medium match (good fit with some areas of strength, similar technologies or tools listed in context)
    - 0.8-1.0: Strong match (excellent fit across multiple criteria based on context)

    **IMPORTANT AGENCY CHECK:**
    *   First, determine the score and category based *only* on the skill/experience match (using RETRIEVED CONTEXT and JOB DETAILS).
    *   Then, check the job description for phrases like "no agencies", "agencies do not apply", "individual freelancers only", "not for agencies", etc. (case-insensitive).
    *   If such a phrase is found:
        *   Override the final `score` to 0.2.
        *   Override the final `category` to "Irrelevant".
        *   However, if your initial assessment (before this agency check) resulted in a "Strong" category, add the string "Agencies disallowed" to the `tags` list AND DO NOT override the final 'score' or 'category'.
        *   Otherwise (not initially "Strong" but agency disallowed), leave `tags` as an empty list or null.

    Jobs from US, UK, Canada, Australia, EU should generally be given a higher location preference score. Middle Eastern, African, Asian, and South American countries should generally be given a lower location preference score, unless RETRIEVED CONTEXT indicates specific strengths or interest there.

    From the RETRIEVED CONTEXT for each job, also identify which team member's profile (if mentioned in the excerpts) is the MOST relevant to that job description.
    Include their name in the `closest_profile_name` field. If no specific team member is clearly most relevant based on the RETRIEVED CONTEXT, or if individual profiles were not significantly retrieved/relevant, state 'General Company Profile'.

    Provide your response as a JSON array (list) of objects. Each object in the array should correspond to one job from the input batch and must include the `id`. The format for each object:
    {
        "id": "the_job_id",
        "score": 0.75,
        "category": "Medium|Low|Strong|Irrelevant",
        "reasoning": "Detailed explanation of the overall match based on retrieved context and job details",
        "technology_match": "Analysis of technology match based on retrieved context",
        "portfolio_match": "Analysis of portfolio match based on retrieved context",
        "project_match": "Analysis of past project match based on retrieved context",
        "location_match": "Analysis of location suitability",
        "closest_profile_name": "Name of the most relevant team member (from context) or 'General Company Profile'",
        "tags": ["Agencies disallowed"] | [] | null
    }

    STRICTLY RETURN ONLY THE JSON ARRAY (LIST) OF OBJECTS WITH NO OTHER TEXT.
    """

    human_prompt_parts = ["Based on the following information, analyze the jobs:\n"]
    for i, job_data_item in enumerate(jobs): # Renamed 'job' to 'job_data_item' to avoid confusion with SQLAlchemy Job model
        job_query_text = f"{job_data_item.job_title}\n{job_data_item.job_description}"
        retrieved_chunks = GLOBAL_FAISS_MANAGER.query(job_query_text, k=NUM_RETRIEVED_CHUNKS)

        context_for_job_str = f"--- Retrieved Context for Job {job_data_item.job_id} ---\n"
        if retrieved_chunks:
            for chunk_idx, chunk_data in enumerate(retrieved_chunks):
                context_for_job_str += f"Context Snippet {chunk_idx+1} (Source: {chunk_data['source']}):\n{chunk_data['text']}\n---\n"
        else:
            context_for_job_str += "No specific context snippets retrieved for this job. Analyze based on general knowledge if applicable, or indicate lack of specific company fit.\n"
        context_for_job_str += f"--- End of Retrieved Context for Job {job_data_item.job_id} ---\n"

        human_prompt_parts.append(f"\n--- Job {i+1} ---\n")
        human_prompt_parts.append(f"JOB ID: {job_data_item.job_id}\n")
        human_prompt_parts.append(context_for_job_str)
        human_prompt_parts.append("JOB DETAILS:\n")
        human_prompt_parts.append(f"  Title: {job_data_item.job_title}\n")
        human_prompt_parts.append(f"  Description: {job_data_item.job_description}\n")
        human_prompt_parts.append(f"  Client Country: {job_data_item.client_country or 'Not specified'}\n")
        human_prompt_parts.append(f"  Category: {job_data_item.category_label or 'Not specified'}\n")
        human_prompt_parts.append(f"  Subcategory: {job_data_item.subcategory_label or 'Not specified'}\n")
        human_prompt_parts.append(f"  Job Posted On: {job_data_item.job_posted_on_date or 'Not specified'}\n") # Added posted date

    human_prompt = "".join(human_prompt_parts)

    model_name = "gpt-5-2025-08-07"
    logger.info(f"Using OpenAI model: {model_name}")

    logger.debug("Calling OpenAI API with batch RAG prompt...")
    try:
        response = openai_client.chat.completions.create(
            model=model_name,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": human_prompt}
            ],
            temperature=0.1,
            max_tokens=4096,
            response_format={"type": "json_object"}
        )
        analysis_text = response.choices[0].message.content
        logger.debug(f"Raw response from OpenAI API (batch RAG): {analysis_text}")

        if not analysis_text:
            logger.warning("No response content received for batch RAG analysis")
            return [{"id": job.job_id, "error": "OpenAI returned empty response."} for job in jobs]


        try:
            analysis_results = json.loads(analysis_text)
            if not isinstance(analysis_results, list):
                if isinstance(analysis_results, dict) and "results" in analysis_results and isinstance(analysis_results["results"], list):
                     analysis_results = analysis_results["results"]
                else:
                    logger.error(f"Expected a JSON list (array) but got type {type(analysis_results)}. Response: {analysis_text[:200]}")
                    json_match = re.search(r'\[.*\]', analysis_text, re.DOTALL)
                    if json_match:
                        json_content = json_match.group(0)
                        analysis_results = json.loads(json_content)
                        if not isinstance(analysis_results, list):
                            raise json.JSONDecodeError("Regex extracted content is not a list", json_content, 0)
                    else:
                        raise json.JSONDecodeError("No JSON array found in response", analysis_text, 0)

            logger.debug(f"Successfully parsed {len(analysis_results)} results from batch RAG JSON response.")
            return analysis_results
        except json.JSONDecodeError as e:
            logger.error(f"Error decoding JSON from batch RAG response: {e}. Response: {analysis_text[:500]}")
            json_match = re.search(r'\[.*\]', analysis_text, re.DOTALL)
            if json_match:
                json_content = json_match.group(0)
                try:
                    analysis_results = json.loads(json_content)
                    if not isinstance(analysis_results, list):
                         logger.error(f"Regex extracted content is not a list, but {type(analysis_results)}")
                         return [{"id": job.job_id, "error": f"JSON parsing failed, regex found non-list: {e}"} for job in jobs]
                    logger.info(f"Successfully parsed JSON array via regex fallback: {len(analysis_results)} results.")
                    return analysis_results
                except json.JSONDecodeError as e_regex:
                    logger.error(f"Error decoding extracted JSON array (regex) from batch RAG response: {e_regex}")
                    return [{"id": job.job_id, "error": f"JSON parsing failed after regex: {e_regex}"} for job in jobs]
            else:
                logger.error("No JSON array structure found via regex in batch RAG response.")
                return [{"id": job.job_id, "error": "JSON parsing failed, no array structure found."} for job in jobs]


    except Exception as e:
        logger.error(f"Error calling OpenAI API for batch RAG analysis: {e}", exc_info=True)
        return [{"id": job.job_id, "error": f"OpenAI API call failed: {e}"} for job in jobs]


@router.post("/analyze_batch_rag")
async def analyze_job_batch_rag(job_ids: List[str], db: Session = Depends(get_db)):
    """Analyze a batch of jobs by their IDs using RAG and return relevance scores."""

    if not is_relevance_check_enabled():
        raise HTTPException(
            status_code=403,
            detail="Relevance check is currently disabled."
        )

    if not job_ids or not (1 <= len(job_ids) <= 3) :
        raise HTTPException(status_code=400, detail="Please provide a list of 1 to 3 job IDs.")

    logger.info(f"--- Batch Analysis (RAG) Start - Job IDs: {job_ids} ---")

    if GLOBAL_FAISS_MANAGER is None:
        logger.critical("RAG system (GLOBAL_FAISS_MANAGER) is not available. Cannot process request.")
        raise HTTPException(status_code=503, detail="Job analysis service is temporarily unavailable due to RAG system error.")

    try:
        llm_openai_client = get_openai_client()

        jobs_data_pydantic: List[JobData] = [] # Changed name to avoid confusion with SQLAlchemy Job
        for job_id_str in job_ids:
            job_pydantic = load_job_by_id(str(job_id_str), db) # load_job_by_id now returns JobData or None
            if job_pydantic:
                jobs_data_pydantic.append(job_pydantic)
            else:
                # load_job_by_id already logs the warning or error
                # We will handle missing jobs later when constructing the response
                pass

        if not jobs_data_pydantic: # If NO jobs could be loaded into JobData Pydantic model
            # Return a result indicating all specified job IDs were not found or failed to load
            results_for_client = []
            for j_id in job_ids:
                 # Check if load_job_by_id failed because DB query returned None or Pydantic model creation failed
                 # This check needs to happen BEFORE this block if you want to distinguish.
                 # For now, if jobs_data_pydantic is empty, we assume they all effectively failed to load.
                 results_for_client.append({"id": j_id, "status": "Load Failed", "detail": "Job ID not found in database or failed Pydantic model creation."})
            return results_for_client

        batch_analysis_results = analyze_jobs_in_batch(jobs_data_pydantic, llm_openai_client)

        processed_results = []
        successful_analyses = 0

        analysis_map = {str(res.get("id")): res for res in batch_analysis_results if "id" in res}

        for requested_job_id_str in job_ids:
            # First, check if this job_id was successfully loaded into a JobData object
            original_job_data = next((jd for jd in jobs_data_pydantic if jd.job_id == requested_job_id_str), None)

            if not original_job_data:
                processed_results.append({"id": requested_job_id_str, "status": "Load Failed", "detail": "Job ID not found in database or failed Pydantic model creation prior to analysis."})
                continue

            # Now, get the analysis result for this successfully loaded job
            analysis_result_item = analysis_map.get(requested_job_id_str)

            if not analysis_result_item:
                logger.warning(f"No analysis result returned for job ID {requested_job_id_str} from LLM.")
                processed_results.append({"id": requested_job_id_str, "status": "Analysis Missing", "detail": "LLM did not return analysis for this job."})
                continue

            if "error" in analysis_result_item:
                logger.warning(f"Error in analysis for job {requested_job_id_str}: {analysis_result_item.get('error')}")
                processed_results.append(analysis_result_item)
                continue

            try:
                category_str = analysis_result_item.get("category", "Irrelevant")
                try:
                    category_val = RelevanceCategory(category_str)
                except ValueError:
                    logger.warning(f"Invalid category '{category_str}' from LLM for job {requested_job_id_str}. Defaulting to Irrelevant.")
                    category_val = RelevanceCategory.IRRELEVANT

                match_score = MatchScore(
                    job_id=requested_job_id_str,
                    score=float(analysis_result_item.get("score", 0.0)),
                    category=category_val,
                    reasoning=analysis_result_item.get("reasoning", "No reasoning provided"),
                    technology_match=analysis_result_item.get("technology_match", ""),
                    portfolio_match=analysis_result_item.get("portfolio_match", ""),
                    project_match=analysis_result_item.get("project_match", ""),
                    location_match=analysis_result_item.get("location_match", ""),
                    closest_profile_name=analysis_result_item.get("closest_profile_name", "Analysis Incomplete"),
                    tags=analysis_result_item.get("tags")
                )

                update_database_for_single_job(db, match_score)
                analysis_result_item["status"] = "Success"
                processed_results.append(analysis_result_item)
                successful_analyses +=1
            except Exception as e:
                logger.error(f"Error processing analysis result or updating DB for job {requested_job_id_str}: {e}", exc_info=True)
                processed_results.append({"id": requested_job_id_str, "status": "Processing Error", "detail": str(e)})

        if successful_analyses == 0 and jobs_data_pydantic:
             logger.warning(f"No jobs were successfully analyzed and updated in DB for job_ids: {job_ids}")

        logger.info(f"Completed batch analysis for {job_ids}. Processed {len(processed_results)} results ({successful_analyses} successful DB updates).")
        return processed_results

    except HTTPException:
        raise
    except ValueError as ve:
        logger.error(f"Configuration or Value error in analyze_job_batch_rag: {ve}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Configuration error: {ve}")
    except Exception as e:
        logger.error(f"Unhandled exception in analyze_job_batch_rag for IDs {job_ids}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")


@router.post("/relevance/toggle")
async def toggle_relevance_check(request: ToggleRequest):
    """Toggle the relevance check on/off"""
    try:
        os.environ["ENABLE_JOB_RELEVANCE"] = str(request.enabled).lower()
        logger.info(f"Job relevance check explicitly set to: {request.enabled}")
        return {
            "is_enabled_override": request.enabled,
            "is_within_schedule": is_within_schedule(),
            "effective_status": is_relevance_check_enabled()
        }
    except Exception as e:
        logger.error(f"Error toggling relevance check: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/relevance/status")
async def get_relevance_status():
    """Get the current status of the relevance check"""
    try:
        override_enabled = os.getenv("ENABLE_JOB_RELEVANCE", "true").lower() == "true"
        schedule_active = is_within_schedule()
        effective_status = is_relevance_check_enabled()
        return {
            "is_enabled_override": override_enabled,
            "is_within_schedule": schedule_active,
            "effective_status": effective_status
        }
    except Exception as e:
        logger.error(f"Error getting relevance status: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/process_new_jobs_cron")
async def process_new_jobs_cron(db: Session = Depends(get_db)):
    """
    Cron job endpoint to fetch latest jobs by publishedDateTime,
    identify new ones, batch them, and send for relevance analysis IN PARALLEL.
    """
    global LAST_CRON_PROCESSED_PUBLISHED_DATETIME_ISO
    logger.info("Cron job /process_new_jobs_cron triggered (parallel processing).")

    if not is_relevance_check_enabled():
        logger.info("Relevance check is disabled. Cron job skipping processing.")
        return {"status": "skipped", "message": "Relevance check disabled."}

    try:
        try:
            latest_jobs_from_db = db.query(Job).order_by(Job.publishedDateTime.desc()).limit(30).all()
        except AttributeError:
            logger.error("Job model does not have 'publishedDateTime' attribute. Cannot process cron.")
            raise HTTPException(status_code=500, detail="Server configuration error: Job model missing 'publishedDateTime'.")

        if not latest_jobs_from_db:
            logger.info("No jobs found in the database.")
            return {"status": "success", "message": "No jobs found in DB."}

        new_job_ids_to_process: List[str] = []
        newest_job_datetime_in_this_run: Optional[datetime.datetime] = None

        last_processed_dt_obj: Optional[datetime.datetime] = None
        if LAST_CRON_PROCESSED_PUBLISHED_DATETIME_ISO:
            try:
                last_processed_dt_obj = datetime.datetime.fromisoformat(LAST_CRON_PROCESSED_PUBLISHED_DATETIME_ISO)
            except ValueError:
                logger.error(f"Could not parse LAST_CRON_PROCESSED_PUBLISHED_DATETIME_ISO: {LAST_CRON_PROCESSED_PUBLISHED_DATETIME_ISO}. Treating as first run.")
                LAST_CRON_PROCESSED_PUBLISHED_DATETIME_ISO = None

        if LAST_CRON_PROCESSED_PUBLISHED_DATETIME_ISO is None or last_processed_dt_obj is None:
            logger.info("First cron run or previous datetime was invalid. Processing all fetched jobs as new.")
            for job_in_db in latest_jobs_from_db:
                new_job_ids_to_process.append(str(job_in_db.id))
            if latest_jobs_from_db:
                if latest_jobs_from_db[0].publishedDateTime:
                     newest_job_datetime_in_this_run = latest_jobs_from_db[0].publishedDateTime
        else:
            logger.info(f"Last processed job datetime: {LAST_CRON_PROCESSED_PUBLISHED_DATETIME_ISO}. Identifying newer jobs.")
            for job_in_db in latest_jobs_from_db:
                if not job_in_db.publishedDateTime:
                    logger.warning(f"Job ID {job_in_db.id} has no publishedDateTime. Skipping.")
                    continue

                current_job_dt = job_in_db.publishedDateTime
                if not isinstance(current_job_dt, datetime.datetime):
                    try:
                        current_job_dt = datetime.datetime.fromisoformat(str(current_job_dt))
                    except (ValueError, TypeError):
                        logger.warning(f"Could not parse publishedDateTime for job ID {job_in_db.id}: {job_in_db.publishedDateTime}. Skipping.")
                        continue

                if current_job_dt > last_processed_dt_obj:
                    new_job_ids_to_process.append(str(job_in_db.id))
                    if newest_job_datetime_in_this_run is None or current_job_dt > newest_job_datetime_in_this_run:
                        newest_job_datetime_in_this_run = current_job_dt
                else:
                    break

        if not new_job_ids_to_process:
            logger.info("No new jobs found to process based on publishedDateTime.")
            if LAST_CRON_PROCESSED_PUBLISHED_DATETIME_ISO is None and latest_jobs_from_db and latest_jobs_from_db[0].publishedDateTime:
                LAST_CRON_PROCESSED_PUBLISHED_DATETIME_ISO = latest_jobs_from_db[0].publishedDateTime.isoformat()
                logger.info(f"Initial cron run with existing DB jobs. Set baseline datetime to: {LAST_CRON_PROCESSED_PUBLISHED_DATETIME_ISO}")
            return {"status": "success", "message": "No new jobs to process."}

        logger.info(f"Found {len(new_job_ids_to_process)} new job(s) to process. IDs: {new_job_ids_to_process}")

        batch_size = 3
        tasks = []
        batched_job_ids_for_reporting = [] # To keep track of which jobs were in which task

        for i in range(0, len(new_job_ids_to_process), batch_size):
            batch_job_ids = new_job_ids_to_process[i:i + batch_size]
            batched_job_ids_for_reporting.append(batch_job_ids)
            # Create a task for each batch.
            # WARNING: All these tasks will share the same 'db' session from Depends(get_db)
            # This can lead to issues if not handled carefully within analyze_job_batch_rag
            # or if the DB operations are complex/conflicting.
            tasks.append(analyze_job_batch_rag(job_ids=batch_job_ids, db=db))

        analysis_outcomes = []
        total_jobs_submitted_for_analysis = 0

        if tasks:
            logger.info(f"Cron: Submitting {len(tasks)} batches for parallel analysis.")
            # return_exceptions=True allows us to get exceptions as results instead of stopping all tasks
            results_from_gather = await asyncio.gather(*tasks, return_exceptions=True)
            logger.info(f"Cron: Parallel analysis of {len(tasks)} batches completed.")

            for i, result_or_exc in enumerate(results_from_gather):
                current_batch_ids = batched_job_ids_for_reporting[i]
                total_jobs_submitted_for_analysis += len(current_batch_ids)
                if isinstance(result_or_exc, Exception):
                    logger.error(f"Cron: Error during parallel analysis for batch {current_batch_ids}: {result_or_exc}", exc_info=result_or_exc)
                    analysis_outcomes.append({"batch_ids": current_batch_ids, "error": f"Exception: {str(result_or_exc)}"})
                else:
                    # result_or_exc is the list of dicts returned by analyze_job_batch_rag
                    analysis_outcomes.append({"batch_ids": current_batch_ids, "results_summary": result_or_exc})
        else:
            logger.info("Cron: No tasks created for parallel analysis (e.g., no new jobs).")


        if newest_job_datetime_in_this_run:
            LAST_CRON_PROCESSED_PUBLISHED_DATETIME_ISO = newest_job_datetime_in_this_run.isoformat()
            logger.info(f"Cron: Processed new jobs. Updated LAST_CRON_PROCESSED_PUBLISHED_DATETIME_ISO to: {LAST_CRON_PROCESSED_PUBLISHED_DATETIME_ISO}")

        return {
            "status": "success",
            "message": f"Identified {len(new_job_ids_to_process)} new job(s). Created {len(tasks)} batch(es) for parallel processing. Submitted {total_jobs_submitted_for_analysis} job(s) for analysis.",
            "newest_job_datetime_processed_this_run": newest_job_datetime_in_this_run.isoformat() if newest_job_datetime_in_this_run else None,
            "last_processed_datetime_for_next_run": LAST_CRON_PROCESSED_PUBLISHED_DATETIME_ISO,
            "batch_details": analysis_outcomes
        }

    except Exception as e:
        logger.error(f"Critical error in /process_new_jobs_cron endpoint: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Cron job /process_new_jobs_cron failed: {str(e)}")
