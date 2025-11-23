"""
IBM watsonx ADK API Routes
New endpoints showcasing watsonx ADK agents for the hackathon
These routes demonstrate IBM technology integration
"""
import os
import logging
import time
from typing import List, Dict
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.db.database import get_db
from app.models.jobs import Job, Proposal, JobRelevance
from app.api.routes.adk_agents.job_matching_agent import (
    JobMatchingAgent,
    BatchJobMatchingAgent
)
from app.api.routes.adk_agents.proposal_generation_agent import ProposalOrchestrator
from app.api.routes.rag_relevance import GLOBAL_FAISS_MANAGER, load_job_by_id
from app.api.routes.agents.structures import RelevanceCategory
from app.api.routes.watsonx_governance import log_model_usage
import json
import time

logger = logging.getLogger(__name__)
router = APIRouter()

# Initialize ADK agents
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROPOSAL_TEMPLATE_PATH = os.path.join(BASE_DIR, "agents", "proposal_template.md")

try:
    job_matching_agent = JobMatchingAgent(GLOBAL_FAISS_MANAGER)
    batch_job_matching_agent = BatchJobMatchingAgent(GLOBAL_FAISS_MANAGER)
    proposal_orchestrator = ProposalOrchestrator(PROPOSAL_TEMPLATE_PATH)
    logger.info("✓ IBM watsonx ADK agents initialized successfully")
except Exception as e:
    logger.error(f"✗ Error initializing ADK agents: {e}", exc_info=True)
    job_matching_agent = None
    batch_job_matching_agent = None
    proposal_orchestrator = None


# Request/Response Models
class JobAnalysisRequest(BaseModel):
    job_id: str


class BatchJobAnalysisRequest(BaseModel):
    job_ids: List[str]


class ProposalGenerationRequest(BaseModel):
    job_id: str
    overwrite: bool = False


# ============================================================================
# JOB MATCHING ENDPOINTS (Using ADK)
# ============================================================================

@router.post("/adk/analyze-job/{job_id}")
async def analyze_job_with_adk(
    job_id: str,
    db: Session = Depends(get_db)
):
    """
    Analyze a single job using IBM watsonx ADK JobMatchingAgent
    
    **IBM Technologies Used:**
    - watsonx.ai (granite-13b-chat-v2) for job analysis
    - ADK Agent Framework for orchestration
    - FAISS for RAG context retrieval
    
    This endpoint showcases:
    - ADK agent architecture
    - watsonx.ai integration
    - RAG-enhanced analysis
    """
    if not job_matching_agent:
        raise HTTPException(
            status_code=503,
            detail="ADK Job Matching Agent not initialized. Check watsonx configuration."
        )
    
    logger.info(f"[ADK] Analyzing job {job_id} with watsonx ADK agent")
    
    # Load job data
    job_data = load_job_by_id(job_id, db)
    if not job_data:
        raise HTTPException(status_code=404, detail=f"Job {job_id} not found")
    
    # Convert to dict for agent
    job_dict = {
        "job_id": job_data.job_id,
        "job_title": job_data.job_title,
        "job_description": job_data.job_description,
        "client_country": job_data.client_country,
        "category_label": job_data.category_label,
        "subcategory_label": job_data.subcategory_label,
        "job_posted_on_date": job_data.job_posted_on_date
    }
    
    try:
        # Execute ADK agent with timing
        start_time = time.time()
        result = job_matching_agent.execute(job_dict)
        latency_ms = (time.time() - start_time) * 1000
        
        # Save to database
        _save_relevance_to_db(db, job_id, result)
        
        # Log to watsonx.governance
        log_model_usage(
            model_name="job_matching",
            operation="analyze_job",
            input_summary=f"Job: {job_dict['job_title'][:50]}",
            output_summary=f"Category: {result.get('relevance_category')}, Score: {result.get('relevance_score')}",
            latency_ms=latency_ms,
            status="success"
        )
        
        logger.info(f"[ADK] Job {job_id} analyzed: {result.get('relevance_category')}")
        
        return {
            "job_id": job_id,
            "analysis": result,
            "powered_by": "IBM watsonx ADK",
            "model": "ibm/granite-13b-chat-v2",
            "agent": "JobMatchingAgent",
            "latency_ms": round(latency_ms, 2)
        }
        
    except Exception as e:
        # Log failure to governance
        log_model_usage(
            model_name="job_matching",
            operation="analyze_job",
            input_summary=f"Job: {job_id}",
            output_summary=f"Error: {str(e)[:100]}",
            latency_ms=0,
            status="failure"
        )
        
        logger.error(f"[ADK] Error analyzing job {job_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/adk/analyze-jobs-batch")
async def analyze_jobs_batch_with_adk(
    request: BatchJobAnalysisRequest,
    db: Session = Depends(get_db)
):
    """
    Analyze multiple jobs in batch using IBM watsonx ADK
    
    **IBM Technologies Used:**
    - watsonx.ai for parallel job analysis
    - ADK BatchJobMatchingAgent
    - Efficient batch processing
    
    Maximum: 10 jobs per request
    """
    if not batch_job_matching_agent:
        raise HTTPException(
            status_code=503,
            detail="ADK Batch Job Matching Agent not initialized"
        )
    
    job_ids = request.job_ids
    
    if len(job_ids) > 10:
        raise HTTPException(
            status_code=400,
            detail="Maximum 10 jobs per batch request"
        )
    
    logger.info(f"[ADK] Batch analyzing {len(job_ids)} jobs with watsonx ADK")
    
    # Load all jobs
    jobs_data = []
    for job_id in job_ids:
        job_data = load_job_by_id(job_id, db)
        if job_data:
            jobs_data.append({
                "job_id": job_data.job_id,
                "job_title": job_data.job_title,
                "job_description": job_data.job_description,
                "client_country": job_data.client_country,
                "category_label": job_data.category_label,
                "subcategory_label": job_data.subcategory_label
            })
    
    if not jobs_data:
        raise HTTPException(status_code=404, detail="No valid jobs found")
    
    try:
        # Execute batch ADK agent
        batch_result = batch_job_matching_agent.execute({"jobs": jobs_data})
        
        # Save all results to database
        for result in batch_result.get("results", []):
            if "error" not in result:
                _save_relevance_to_db(db, result.get("job_id"), result)
        
        logger.info(f"[ADK] Batch analysis complete: {batch_result.get('successful')} successful")
        
        return {
            "batch_result": batch_result,
            "powered_by": "IBM watsonx ADK",
            "agent": "BatchJobMatchingAgent"
        }
        
    except Exception as e:
        logger.error(f"[ADK] Error in batch analysis: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# PROPOSAL GENERATION ENDPOINTS (Using ADK)
# ============================================================================

@router.post("/adk/generate-proposal/{job_id}")
async def generate_proposal_with_adk(
    job_id: str,
    overwrite: bool = False,
    db: Session = Depends(get_db)
):
    """
    Generate a proposal using IBM watsonx ADK ProposalOrchestrator
    
    **IBM Technologies Used:**
    - watsonx.ai (llama-3-70b-instruct) for proposal generation
    - ADK Agent Orchestration (4-agent workflow)
    - RAG for context retrieval
    
    **Workflow:**
    1. JobDataRetrievalAgent - Fetch job from database
    2. TemplateLoaderAgent - Load proposal template
    3. ContextRetrievalAgent - RAG context retrieval
    4. ProposalGenerationAgent - Generate with watsonx.ai
    
    This showcases ADK's multi-agent orchestration capabilities!
    """
    if not proposal_orchestrator:
        raise HTTPException(
            status_code=503,
            detail="ADK Proposal Orchestrator not initialized"
        )
    
    logger.info(f"[ADK] Generating proposal for job {job_id} with watsonx ADK orchestrator")
    
    # Check for existing proposal
    existing_proposal = db.query(Proposal).filter(Proposal.job_id == job_id).first()
    
    if existing_proposal and not overwrite:
        logger.info(f"[ADK] Returning existing proposal for job {job_id}")
        return {
            "job_id": job_id,
            "proposal": existing_proposal.proposal_text,
            "exists": True,
            "message": "Existing proposal returned. Use overwrite=true to regenerate."
        }
    
    try:
        # Execute ADK orchestrator workflow with timing
        start_time = time.time()
        initial_state = {
            "job_id": job_id,
            "db": db
        }
        
        final_state = proposal_orchestrator.execute(initial_state)
        latency_ms = (time.time() - start_time) * 1000
        
        # Check for errors
        if "error" in final_state:
            # Log failure to governance
            log_model_usage(
                model_name="proposal_generation",
                operation="generate_proposal",
                input_summary=f"Job: {job_id}",
                output_summary=f"Error: {final_state['error'][:100]}",
                latency_ms=latency_ms,
                status="failure"
            )
            
            raise HTTPException(
                status_code=500,
                detail=f"Proposal generation failed: {final_state['error']}"
            )
        
        proposal_text = final_state.get("final_proposal", "")
        
        if not proposal_text:
            raise HTTPException(
                status_code=500,
                detail="Proposal generation returned empty result"
            )
        
        # Save to database
        if existing_proposal:
            logger.info(f"[ADK] Overwriting existing proposal for job {job_id}")
            existing_proposal.proposal_text = proposal_text
        else:
            logger.info(f"[ADK] Creating new proposal for job {job_id}")
            new_proposal = Proposal(
                proposal_text=proposal_text,
                job_id=job_id
            )
            db.add(new_proposal)
        
        db.commit()
        
        # Log success to watsonx.governance
        log_model_usage(
            model_name="proposal_generation",
            operation="generate_proposal",
            input_summary=f"Job: {job_id}",
            output_summary=f"Proposal generated ({len(proposal_text)} chars)",
            latency_ms=latency_ms,
            status="success"
        )
        
        logger.info(f"[ADK] Proposal generated successfully for job {job_id}")
        
        return {
            "job_id": job_id,
            "proposal": proposal_text,
            "powered_by": final_state.get("powered_by", "IBM watsonx.ai"),
            "model": final_state.get("generation_model", "meta-llama/llama-3-70b-instruct"),
            "orchestrator": "ProposalOrchestrator (4-agent ADK workflow)",
            "agents_used": [
                "JobDataRetrievalAgent",
                "TemplateLoaderAgent",
                "ContextRetrievalAgent",
                "ProposalGenerationAgent"
            ],
            "overwritten": existing_proposal is not None,
            "latency_ms": round(latency_ms, 2)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        # Log failure to governance
        log_model_usage(
            model_name="proposal_generation",
            operation="generate_proposal",
            input_summary=f"Job: {job_id}",
            output_summary=f"Error: {str(e)[:100]}",
            latency_ms=0,
            status="failure"
        )
        
        logger.error(f"[ADK] Error generating proposal for job {job_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# AGENT METADATA ENDPOINTS
# ============================================================================

@router.put("/adk/save-proposal/{job_id}")
async def save_proposal_manual(
    job_id: str,
    proposal_data: Dict[str, str],
    db: Session = Depends(get_db)
):
    """
    Manually save/update a proposal for a job
    
    This endpoint allows users to edit and save proposals manually.
    """
    logger.info(f"[ADK] Manual save/update proposal for job {job_id}")
    
    proposal = db.query(Proposal).filter(Proposal.job_id == job_id).first()
    
    if not proposal:
        raise HTTPException(
            status_code=404,
            detail="Proposal not found for this job."
        )
    
    proposal.proposal_text = proposal_data.get("proposal", "")
    db.commit()
    db.refresh(proposal)
    
    # Log to governance
    log_model_usage(
        model_name="manual_edit",
        operation="save_proposal",
        input_summary=f"Job: {job_id}",
        output_summary=f"Proposal updated ({len(proposal.proposal_text)} chars)",
        latency_ms=0,
        status="success"
    )
    
    return {
        "job_id": job_id,
        "proposal": proposal.proposal_text,
        "message": "Proposal updated successfully."
    }


@router.get("/adk/agents/metadata")
async def get_adk_agents_metadata():
    """
    Get metadata about all IBM watsonx ADK agents
    
    Useful for hackathon demo to show agent architecture
    """
    metadata = {
        "platform": "IBM watsonx Orchestrate ADK",
        "agents": []
    }
    
    if job_matching_agent:
        metadata["agents"].append({
            "agent": "JobMatchingAgent",
            "metadata": job_matching_agent.get_metadata(),
            "status": "active"
        })
    
    if batch_job_matching_agent:
        metadata["agents"].append({
            "agent": "BatchJobMatchingAgent",
            "metadata": batch_job_matching_agent.get_metadata(),
            "status": "active"
        })
    
    if proposal_orchestrator:
        metadata["agents"].append({
            "orchestrator": "ProposalOrchestrator",
            "metadata": proposal_orchestrator.get_workflow_metadata(),
            "status": "active"
        })
    
    return metadata


@router.get("/adk/health")
async def adk_health_check():
    """
    Health check for IBM watsonx ADK integration
    """
    from ibm_watsonx_config import WatsonxConfig
    
    return {
        "status": "healthy" if WatsonxConfig.validate_config() else "configuration_error",
        "watsonx_configured": WatsonxConfig.validate_config(),
        "job_matching_agent": job_matching_agent is not None,
        "batch_job_matching_agent": batch_job_matching_agent is not None,
        "proposal_orchestrator": proposal_orchestrator is not None,
        "faiss_manager": GLOBAL_FAISS_MANAGER is not None,
        "model_id": WatsonxConfig.MODEL_ID,
        "watsonx_url": WatsonxConfig.URL
    }


# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def _save_relevance_to_db(db: Session, job_id: str, analysis_result: dict):
    """Save relevance analysis to database"""
    try:
        # Check if relevance already exists
        relevance = db.query(JobRelevance).filter(JobRelevance.id == job_id).first()
        
        category_str = analysis_result.get('relevance_category', 'Irrelevant')
        
        if relevance:
            # Update existing
            relevance.score = analysis_result.get('relevance_score', 0.0)
            relevance.category = category_str
            relevance.reasoning = analysis_result.get('reasoning', '')
            relevance.technology_match = analysis_result.get('technology_match', '')
            relevance.portfolio_match = analysis_result.get('portfolio_match', '')
            relevance.project_match = analysis_result.get('project_match', '')
            relevance.location_match = analysis_result.get('location_match', '')
            relevance.closest_profile_name = analysis_result.get('closest_profile_name', '')
            relevance.tags = json.dumps(analysis_result.get('tags', []))
        else:
            # Create new
            relevance = JobRelevance(
                id=job_id,
                score=analysis_result.get('relevance_score', 0.0),
                category=category_str,
                reasoning=analysis_result.get('reasoning', ''),
                technology_match=analysis_result.get('technology_match', ''),
                portfolio_match=analysis_result.get('portfolio_match', ''),
                project_match=analysis_result.get('project_match', ''),
                location_match=analysis_result.get('location_match', ''),
                closest_profile_name=analysis_result.get('closest_profile_name', ''),
                tags=json.dumps(analysis_result.get('tags', []))
            )
            db.add(relevance)
        
        db.commit()
        logger.debug(f"Saved relevance for job {job_id}")
        
    except Exception as e:
        logger.error(f"Error saving relevance to DB: {e}", exc_info=True)
        db.rollback()

