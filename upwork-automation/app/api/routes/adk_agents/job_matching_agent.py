"""
Job Matching ADK Agent
IBM watsonx ADK agent for intelligent job-to-company matching
Replaces the RAG relevance analysis with ADK architecture
"""
import json
import logging
from typing import Dict, Any, List, Optional
from .base_agent import BaseWatsonxAgent, AgentState
from app.api.routes.rag_relevance import FAISSIndexManager, GLOBAL_FAISS_MANAGER

logger = logging.getLogger(__name__)


class JobMatchingAgent(BaseWatsonxAgent):
    """
    ADK Agent for analyzing job relevance using watsonx.ai and RAG
    
    This agent:
    1. Retrieves relevant context from FAISS vector store
    2. Analyzes job description using watsonx.ai
    3. Scores job relevance (0.0-1.0)
    4. Categorizes as Strong/Medium/Low/Irrelevant
    5. Provides detailed reasoning
    """
    
    def __init__(self, faiss_manager: Optional[FAISSIndexManager] = None):
        super().__init__(
            agent_name="JobMatchingAgent",
            description="Analyzes Upwork jobs for relevance to company profile using IBM watsonx.ai",
            model_id="ibm/granite-3-3-8b-instruct"  # Latest IBM Granite model (hackathon approved)
        )
        self.faiss_manager = faiss_manager or GLOBAL_FAISS_MANAGER
        
        if self.faiss_manager is None:
            logger.warning("FAISS manager not initialized. RAG context will be limited.")
    
    def get_capabilities(self) -> List[str]:
        """Return agent capabilities"""
        return [
            "job_relevance_analysis",
            "rag_context_retrieval",
            "technology_matching",
            "portfolio_matching",
            "location_analysis",
            "agency_detection"
        ]
    
    def execute(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute job matching analysis
        
        Args:
            input_data: Must contain:
                - job_id: str
                - job_title: str
                - job_description: str
                - client_country: Optional[str]
                - category_label: Optional[str]
                - subcategory_label: Optional[str]
        
        Returns:
            Dictionary with:
                - relevance_score: float
                - relevance_category: str
                - reasoning: str
                - technology_match: str
                - portfolio_match: str
                - project_match: str
                - location_match: str
                - closest_profile_name: str
                - tags: List[str]
        """
        logger.info(f"JobMatchingAgent executing for job: {input_data.get('job_id')}")
        
        # Step 1: Retrieve context using RAG
        retrieved_context = self._retrieve_context(
            job_title=input_data.get('job_title', ''),
            job_description=input_data.get('job_description', '')
        )
        
        # Step 2: Build prompt for watsonx.ai
        prompt = self._build_analysis_prompt(input_data, retrieved_context)
        
        # Step 3: Generate analysis using watsonx.ai
        try:
            analysis_text = self.generate(
                prompt=prompt,
                temperature=0.1,  # Low temperature for consistent analysis
                max_tokens=1500
            )
            
            # Step 4: Parse the response
            analysis_result = self._parse_analysis(analysis_text, input_data.get('job_id'))
            
            logger.info(f"Job {input_data.get('job_id')} analyzed: {analysis_result.get('relevance_category')} ({analysis_result.get('relevance_score')})")
            
            return analysis_result
            
        except Exception as e:
            logger.error(f"Error in job matching analysis: {e}", exc_info=True)
            return self._get_error_result(input_data.get('job_id'), str(e))
    
    def _retrieve_context(self, job_title: str, job_description: str, k: int = 9) -> str:
        """
        Retrieve relevant context from FAISS vector store
        
        Args:
            job_title: Job title
            job_description: Job description
            k: Number of chunks to retrieve
        
        Returns:
            Formatted context string
        """
        if not self.faiss_manager:
            return "No company context available."
        
        query_text = f"{job_title}\n{job_description}"
        
        try:
            retrieved_chunks = self.faiss_manager.query(query_text, k=k)
            
            if not retrieved_chunks:
                return "No specifically relevant company information found."
            
            context_parts = ["=== COMPANY CONTEXT (Retrieved via RAG) ===\n"]
            
            for i, chunk in enumerate(retrieved_chunks, 1):
                source = chunk.get('source', 'unknown')
                text = chunk.get('text', '')
                context_parts.append(f"\n[Context {i} - Source: {source}]\n{text}\n")
            
            context_parts.append("=== END OF COMPANY CONTEXT ===")
            
            return "\n".join(context_parts)
            
        except Exception as e:
            logger.error(f"Error retrieving context: {e}")
            return "Error retrieving company context."
    
    def _build_analysis_prompt(self, job_data: Dict[str, Any], context: str) -> str:
        """
        Build the analysis prompt for watsonx.ai
        
        Args:
            job_data: Job information
            context: Retrieved RAG context
        
        Returns:
            Formatted prompt
        """
        prompt = f"""You are an expert job matching AI agent powered by IBM watsonx.ai. Your task is to analyze an Upwork job posting and determine its relevance to our company.

{context}

=== JOB POSTING TO ANALYZE ===
Job ID: {job_data.get('job_id')}
Title: {job_data.get('job_title', 'N/A')}
Description: {job_data.get('job_description', 'N/A')}
Client Country: {job_data.get('client_country', 'Not specified')}
Category: {job_data.get('category_label', 'Not specified')}
Subcategory: {job_data.get('subcategory_label', 'Not specified')}
=== END OF JOB POSTING ===

ANALYSIS INSTRUCTIONS:
1. Carefully review the COMPANY CONTEXT and JOB POSTING
2. Score the match from 0.0 to 1.0:
   - 0.0-0.29: Irrelevant (no relevant skills/experience)
   - 0.3-0.49: Low match (some relevant skills, limited experience)
   - 0.5-0.79: Medium match (good fit, some strengths)
   - 0.8-1.0: Strong match (excellent fit across criteria)

3. Provide detailed analysis for:
   - Technology Match: How job tech requirements align with our capabilities
   - Portfolio Match: Which portfolio items demonstrate relevant experience
   - Project Match: Which past projects are most relevant
   - Location Match: Whether client location is suitable
   - Closest Profile: Which team member is most relevant (or "General Company Profile")

4. Check for agency restrictions:
   - If job says "no agencies", "agencies don't apply", "individual freelancers only", etc.
   - AND initial score would be < 0.8: Set score to 0.2, category to "Irrelevant"
   - BUT if initial score >= 0.8: Keep score, add "Agencies disallowed" to tags

5. Location preferences:
   - US, UK, Canada, Australia, EU: Higher preference
   - Other regions: Lower preference (unless context shows specific strength)

REQUIRED OUTPUT FORMAT (JSON):
{{
    "score": 0.75,
    "category": "Medium",
    "reasoning": "Overall assessment...",
    "technology_match": "Technology analysis...",
    "portfolio_match": "Portfolio analysis...",
    "project_match": "Past project analysis...",
    "location_match": "Location analysis...",
    "closest_profile_name": "Name or 'General Company Profile'",
    "tags": ["tag1", "tag2"] or []
}}

Provide ONLY the JSON output, no additional text.
"""
        return prompt
    
    def _parse_analysis(self, analysis_text: str, job_id: str) -> Dict[str, Any]:
        """
        Parse the watsonx.ai analysis response
        
        Args:
            analysis_text: Raw response from watsonx.ai
            job_id: Job ID for error reporting
        
        Returns:
            Parsed analysis dictionary
        """
        try:
            # Try to extract JSON from response
            import re
            json_match = re.search(r'\{.*\}', analysis_text, re.DOTALL)
            
            if json_match:
                json_str = json_match.group(0)
                analysis = json.loads(json_str)
            else:
                # If no JSON found, try parsing the whole response
                analysis = json.loads(analysis_text)
            
            # Validate and normalize
            return {
                "relevance_score": float(analysis.get("score", 0.0)),
                "relevance_category": analysis.get("category", "Irrelevant"),
                "reasoning": analysis.get("reasoning", "No reasoning provided"),
                "technology_match": analysis.get("technology_match", ""),
                "portfolio_match": analysis.get("portfolio_match", ""),
                "project_match": analysis.get("project_match", ""),
                "location_match": analysis.get("location_match", ""),
                "closest_profile_name": analysis.get("closest_profile_name", "General Company Profile"),
                "tags": analysis.get("tags", [])
            }
            
        except (json.JSONDecodeError, ValueError) as e:
            logger.error(f"Error parsing analysis for job {job_id}: {e}")
            logger.debug(f"Raw response: {analysis_text[:500]}")
            
            # Return default low-relevance result
            return {
                "relevance_score": 0.1,
                "relevance_category": "Irrelevant",
                "reasoning": "Failed to parse AI analysis response",
                "technology_match": "Analysis failed",
                "portfolio_match": "Analysis failed",
                "project_match": "Analysis failed",
                "location_match": "Analysis failed",
                "closest_profile_name": "General Company Profile",
                "tags": ["parse_error"]
            }
    
    def _get_error_result(self, job_id: str, error_msg: str) -> Dict[str, Any]:
        """Return error result structure"""
        return {
            "relevance_score": 0.0,
            "relevance_category": "Irrelevant",
            "reasoning": f"Error during analysis: {error_msg}",
            "technology_match": "Error",
            "portfolio_match": "Error",
            "project_match": "Error",
            "location_match": "Error",
            "closest_profile_name": "General Company Profile",
            "tags": ["error"]
        }


class BatchJobMatchingAgent(BaseWatsonxAgent):
    """
    ADK Agent for batch job matching
    Processes multiple jobs efficiently
    """
    
    def __init__(self, faiss_manager: Optional[FAISSIndexManager] = None):
        super().__init__(
            agent_name="BatchJobMatchingAgent",
            description="Batch processes multiple Upwork jobs for relevance analysis",
            model_id="ibm/granite-3-3-8b-instruct"  # Latest IBM Granite model (hackathon approved)
        )
        self.single_agent = JobMatchingAgent(faiss_manager)
    
    def get_capabilities(self) -> List[str]:
        return ["batch_job_analysis", "parallel_processing"] + self.single_agent.get_capabilities()
    
    def execute(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute batch job matching
        
        Args:
            input_data: Must contain:
                - jobs: List of job dictionaries
        
        Returns:
            Dictionary with:
                - results: List of analysis results
                - total_processed: int
                - successful: int
                - failed: int
        """
        jobs = input_data.get('jobs', [])
        logger.info(f"BatchJobMatchingAgent processing {len(jobs)} jobs")
        
        results = []
        successful = 0
        failed = 0
        
        for job in jobs:
            try:
                result = self.single_agent.execute(job)
                result['job_id'] = job.get('job_id')
                results.append(result)
                successful += 1
            except Exception as e:
                logger.error(f"Error processing job {job.get('job_id')}: {e}")
                results.append({
                    'job_id': job.get('job_id'),
                    'error': str(e),
                    'relevance_category': 'Error'
                })
                failed += 1
        
        return {
            "results": results,
            "total_processed": len(jobs),
            "successful": successful,
            "failed": failed
        }

