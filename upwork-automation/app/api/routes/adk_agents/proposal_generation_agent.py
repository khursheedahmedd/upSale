"""
Proposal Generation ADK Agent
IBM watsonx ADK agent for generating personalized job proposals
Replaces LangGraph-based proposal generation with ADK architecture
"""
import logging
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session, joinedload
from .base_agent import BaseWatsonxAgent, AgentOrchestrator
from app.models.jobs import Job
from app.api.routes.rag_relevance import GLOBAL_FAISS_MANAGER

logger = logging.getLogger(__name__)


class JobDataRetrievalAgent(BaseWatsonxAgent):
    """
    ADK Agent for retrieving job data from database
    Replaces: get_job_details node in LangGraph
    """
    
    def __init__(self):
        super().__init__(
            agent_name="JobDataRetrievalAgent",
            description="Retrieves job details from database including relevance scores"
        )
    
    def get_capabilities(self) -> List[str]:
        return ["database_query", "job_data_retrieval", "relevance_lookup"]
    
    def execute(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Retrieve job data from database
        
        Args:
            input_data: Must contain:
                - job_id: str
                - db: SQLAlchemy Session
        
        Returns:
            Job data including relevance information
        """
        job_id = input_data.get('job_id')
        db: Session = input_data.get('db')
        
        logger.info(f"JobDataRetrievalAgent: Fetching job {job_id}")
        
        if not db:
            raise ValueError("Database session not provided")
        
        job = db.query(Job).options(
            joinedload(Job.relevance)
        ).filter(Job.id == job_id).first()
        
        if not job:
            raise ValueError(f"Job with ID {job_id} not found")
        
        return {
            "job_id": job.id,
            "job_title": job.title or "Untitled Job",
            "job_description": job.description or "",
            "client_name": "Client",  # Generic for privacy
            "client_country": job.client_country,
            "relevance_score": job.relevance.score if job.relevance else None,
            "closest_profile_name": job.relevance.closest_profile_name if job.relevance else None,
            "category": job.category_label,
            "subcategory": job.subcategory_label
        }


class TemplateLoaderAgent(BaseWatsonxAgent):
    """
    ADK Agent for loading proposal templates
    Replaces: load_template_node in LangGraph
    """
    
    def __init__(self, template_path: str):
        super().__init__(
            agent_name="TemplateLoaderAgent",
            description="Loads and manages proposal templates"
        )
        self.template_path = template_path
    
    def get_capabilities(self) -> List[str]:
        return ["template_loading", "template_management"]
    
    def execute(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Load proposal template
        
        Returns:
            Dictionary with template content
        """
        logger.info("TemplateLoaderAgent: Loading proposal template")
        
        try:
            with open(self.template_path, 'r', encoding='utf-8') as f:
                template_content = f.read()
        except FileNotFoundError:
            logger.warning(f"Template file not found: {self.template_path}")
            template_content = self._get_default_template()
        
        return {
            "proposal_template": template_content
        }
    
    @staticmethod
    def _get_default_template() -> str:
        """Return default template if file not found"""
        return """Hi {{client_name}},

Being in the top 1% professionals with 9+ years of experience, I can help you with {{job_title}}.

Here's what you should know about me:
{{relevant_experience}}

Here's what I can bring to your project:
{{project_value}}

Let's schedule a quick 10-minute introduction call to discuss your project in detail.

Questions for the call:
{{questions}}

I look forward to hearing about your project!

Best Regards,
{{profile_name}}"""


class ContextRetrievalAgent(BaseWatsonxAgent):
    """
    ADK Agent for RAG-based context retrieval
    Replaces: retrieve_context node in LangGraph
    """
    
    def __init__(self, faiss_manager=None):
        super().__init__(
            agent_name="ContextRetrievalAgent",
            description="Retrieves relevant company context using RAG (FAISS vector search)"
        )
        self.faiss_manager = faiss_manager or GLOBAL_FAISS_MANAGER
    
    def get_capabilities(self) -> List[str]:
        return ["rag_retrieval", "semantic_search", "context_building"]
    
    def execute(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Retrieve relevant context using RAG
        
        Args:
            input_data: Must contain:
                - job_title: str
                - job_description: str
        
        Returns:
            Dictionary with retrieved_context
        """
        job_title = input_data.get('job_title', '')
        job_description = input_data.get('job_description', '')
        
        logger.info(f"ContextRetrievalAgent: Retrieving context for '{job_title[:50]}...'")
        
        if not self.faiss_manager:
            logger.warning("FAISS manager not available")
            return {"retrieved_context": "No context retrieval system available."}
        
        query_text = f"Job Title: {job_title}. Description: {job_description}"
        
        try:
            retrieved_docs = self.faiss_manager.query(query_text, k=8)
            
            if not retrieved_docs:
                return {"retrieved_context": "No relevant company information found."}
            
            # Separate profiles and projects
            profiles = [d for d in retrieved_docs if d.get("doc_type") == "profile"]
            projects = [d for d in retrieved_docs if d.get("doc_type") == "project"]
            
            context_parts = []
            
            if profiles:
                context_parts.append("=== RELEVANT TEAM PROFILES ===")
                for profile in profiles[:3]:
                    context_parts.append(f"\n- Name: {profile.get('name', 'N/A')}")
                    context_parts.append(f"  Role: {profile.get('role', 'N/A')}")
                    context_parts.append(f"  Expertise: {', '.join(profile.get('core_expertise', []))}")
            
            if projects:
                context_parts.append("\n\n=== RELEVANT PAST PROJECTS ===")
                for project in projects[:3]:
                    context_parts.append(f"\n- Project: {project.get('name', 'N/A')}")
                    context_parts.append(f"  Domain: {', '.join(project.get('domain', []))}")
                    context_parts.append(f"  Description: {project.get('description', 'N/A')}")
                    context_parts.append(f"  Tech Stack: {', '.join(project.get('tech_stack', []))}")
                    if 'ai_capabilities' in project:
                        context_parts.append(f"  AI Capabilities: {', '.join(project.get('ai_capabilities', []))}")
            
            retrieved_context = "\n".join(context_parts)
            
            logger.info(f"Retrieved {len(profiles)} profiles and {len(projects)} projects")
            
            return {"retrieved_context": retrieved_context}
            
        except Exception as e:
            logger.error(f"Error retrieving context: {e}", exc_info=True)
            return {"retrieved_context": f"Error retrieving context: {str(e)}"}


class ProposalGenerationAgent(BaseWatsonxAgent):
    """
    ADK Agent for generating proposals using watsonx.ai
    Replaces: generate_proposal_from_template node in LangGraph
    """
    
    def __init__(self):
        super().__init__(
            agent_name="ProposalGenerationAgent",
            description="Generates personalized job proposals using IBM watsonx.ai",
            model_id="ibm/granite-3-3-8b-instruct"  # Latest IBM Granite model (hackathon approved)
        )
    
    def get_capabilities(self) -> List[str]:
        return [
            "proposal_generation",
            "natural_language_generation",
            "personalization",
            "template_filling"
        ]
    
    def execute(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate proposal using watsonx.ai
        
        Args:
            input_data: Must contain:
                - job_title: str
                - job_description: str
                - retrieved_context: str
                - proposal_template: str
                - relevance_score: Optional[float]
                - closest_profile_name: Optional[str]
        
        Returns:
            Dictionary with final_proposal
        """
        logger.info("ProposalGenerationAgent: Generating proposal with watsonx.ai")
        
        prompt = self._build_generation_prompt(input_data)
        
        try:
            proposal_text = self.generate(
                prompt=prompt,
                temperature=0.7,  # Higher for creative writing
                max_tokens=2048
            )
            
            logger.info("Proposal generated successfully")
            
            return {
                "final_proposal": proposal_text.strip(),
                "generation_model": self.model_id,
                "powered_by": "IBM watsonx.ai"
            }
            
        except Exception as e:
            logger.error(f"Error generating proposal: {e}", exc_info=True)
            return {
                "final_proposal": f"Error generating proposal: {str(e)}",
                "error": str(e)
            }
    
    def _build_generation_prompt(self, input_data: Dict[str, Any]) -> str:
        """Build the proposal generation prompt"""
        
        relevance_info = ""
        if input_data.get('relevance_score') is not None:
            relevance_info += f"Relevance Score: {input_data['relevance_score']:.2f}\n"
        
        if input_data.get('closest_profile_name'):
            profile_name = input_data['closest_profile_name']
            relevance_info += f"Closest Matching Profile: {profile_name}\n"
            
            if profile_name == 'General Company Profile':
                relevance_info += "Guideline: Write from agency perspective, highlight team strength.\n"
            else:
                relevance_info += f"Guideline: Feature {profile_name} as the key expert.\n"
        
        prompt = f"""You are an expert proposal writer powered by IBM watsonx.ai. Generate a compelling, human-like proposal for an Upwork job.

=== JOB DETAILS ===
Title: {input_data.get('job_title', 'N/A')}
Description: {input_data.get('job_description', 'N/A')}

=== INTERNAL CONTEXT ===
{relevance_info}

=== OUR RELEVANT EXPERIENCE (from RAG) ===
{input_data.get('retrieved_context', 'No context available')}

=== PROPOSAL TEMPLATE STRUCTURE ===
{input_data.get('proposal_template', 'No template provided')}

=== YOUR TASK ===
Write a final, human-like proposal that:
1. Integrates relevant projects naturally as concrete examples
2. Explains HOW our experience proves we can handle this job
3. Uses confident, professional, helpful tone
4. Keeps language simple and technical where appropriate
5. Follows the template structure but WITHOUT placeholders like {{variable}}
6. Is ready to send (clean final text only)

CRITICAL: Output ONLY the final proposal text. No meta-commentary, no placeholders, no section titles from template.

Generate the proposal now:
"""
        return prompt


class ProposalOrchestrator(AgentOrchestrator):
    """
    Orchestrator for the complete proposal generation workflow
    Replaces: LangGraph StateGraph for proposals
    """
    
    def __init__(self, template_path: str):
        super().__init__(name="ProposalGenerationWorkflow")
        
        # Initialize all agents
        self.add_agent("job_retrieval", JobDataRetrievalAgent())
        self.add_agent("template_loader", TemplateLoaderAgent(template_path))
        self.add_agent("context_retrieval", ContextRetrievalAgent())
        self.add_agent("proposal_generation", ProposalGenerationAgent())
        
        # Set workflow order
        self.set_workflow([
            "job_retrieval",
            "template_loader",
            "context_retrieval",
            "proposal_generation"
        ])
        
        logger.info("ProposalOrchestrator initialized with 4-agent workflow")

