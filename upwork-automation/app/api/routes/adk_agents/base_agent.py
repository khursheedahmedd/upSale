"""
Base ADK Agent Configuration
Provides common functionality for all watsonx ADK agents
"""
import os
import logging
from typing import Dict, Any, Optional, List
from abc import ABC, abstractmethod
from ibm_watsonx_ai.foundation_models import ModelInference
from ibm_watsonx_config import get_watsonx_client, generate_with_watsonx

logger = logging.getLogger(__name__)


class BaseWatsonxAgent(ABC):
    """
    Base class for all watsonx ADK agents
    Provides common functionality and structure
    """
    
    def __init__(
        self,
        agent_name: str,
        description: str,
        model_id: Optional[str] = None
    ):
        """
        Initialize base agent
        
        Args:
            agent_name: Name of the agent
            description: Description of agent capabilities
            model_id: Optional specific watsonx model to use
        """
        self.agent_name = agent_name
        self.description = description
        self.model_id = model_id
        self.watsonx_client = None
        
        logger.info(f"Initializing ADK Agent: {agent_name}")
    
    def _get_client(self) -> ModelInference:
        """Get or create watsonx client"""
        if self.watsonx_client is None:
            self.watsonx_client = get_watsonx_client(self.model_id)
        return self.watsonx_client
    
    def generate(
        self,
        prompt: str,
        temperature: float = 0.5,
        max_tokens: int = 2048,
        **kwargs
    ) -> str:
        """
        Generate text using watsonx.ai
        
        Args:
            prompt: Input prompt
            temperature: Generation temperature
            max_tokens: Maximum tokens to generate
            **kwargs: Additional parameters
        
        Returns:
            Generated text
        """
        try:
            response = generate_with_watsonx(
                prompt=prompt,
                model_id=self.model_id,
                temperature=temperature,
                max_new_tokens=max_tokens,
                **kwargs
            )
            return response
        except Exception as e:
            logger.error(f"Error generating with watsonx: {e}", exc_info=True)
            raise
    
    @abstractmethod
    def execute(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute the agent's main task
        Must be implemented by subclasses
        
        Args:
            input_data: Input data for the agent
        
        Returns:
            Result dictionary
        """
        pass
    
    def get_metadata(self) -> Dict[str, Any]:
        """Get agent metadata for registration"""
        return {
            "name": self.agent_name,
            "description": self.description,
            "model_id": self.model_id,
            "capabilities": self.get_capabilities()
        }
    
    @abstractmethod
    def get_capabilities(self) -> List[str]:
        """
        Return list of agent capabilities
        Must be implemented by subclasses
        """
        pass


class AgentState(Dict[str, Any]):
    """
    State management for ADK agents
    Similar to LangGraph state but ADK-compatible
    """
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self._history: List[Dict[str, Any]] = []
    
    def update_state(self, updates: Dict[str, Any]) -> None:
        """Update state and track history"""
        self._history.append({
            "timestamp": self._get_timestamp(),
            "updates": updates.copy()
        })
        self.update(updates)
    
    def get_history(self) -> List[Dict[str, Any]]:
        """Get state update history"""
        return self._history
    
    @staticmethod
    def _get_timestamp() -> str:
        """Get current timestamp"""
        from datetime import datetime
        return datetime.utcnow().isoformat()


class AgentOrchestrator:
    """
    Orchestrates multiple ADK agents
    Replaces LangGraph's StateGraph functionality
    """
    
    def __init__(self, name: str):
        self.name = name
        self.agents: Dict[str, BaseWatsonxAgent] = {}
        self.workflow: List[str] = []
        
        logger.info(f"Initialized ADK Agent Orchestrator: {name}")
    
    def add_agent(self, agent_id: str, agent: BaseWatsonxAgent) -> None:
        """Add an agent to the orchestrator"""
        self.agents[agent_id] = agent
        logger.info(f"Added agent '{agent_id}' to orchestrator '{self.name}'")
    
    def set_workflow(self, workflow: List[str]) -> None:
        """
        Set the execution workflow
        
        Args:
            workflow: List of agent IDs in execution order
        """
        # Validate all agents exist
        for agent_id in workflow:
            if agent_id not in self.agents:
                raise ValueError(f"Agent '{agent_id}' not found in orchestrator")
        
        self.workflow = workflow
        logger.info(f"Set workflow for '{self.name}': {' → '.join(workflow)}")
    
    def execute(self, initial_state: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute the agent workflow
        
        Args:
            initial_state: Initial state dictionary
        
        Returns:
            Final state after all agents execute
        """
        state = AgentState(**initial_state)
        
        logger.info(f"Starting workflow execution for '{self.name}'")
        
        for agent_id in self.workflow:
            agent = self.agents[agent_id]
            logger.info(f"Executing agent: {agent_id} ({agent.agent_name})")
            
            try:
                result = agent.execute(dict(state))
                state.update_state(result)
                logger.info(f"Agent '{agent_id}' completed successfully")
            except Exception as e:
                logger.error(f"Error executing agent '{agent_id}': {e}", exc_info=True)
                state.update_state({
                    "error": str(e),
                    "failed_agent": agent_id
                })
                break
        
        logger.info(f"Workflow execution completed for '{self.name}'")
        return dict(state)
    
    def get_workflow_metadata(self) -> Dict[str, Any]:
        """Get metadata about the orchestrator and its workflow"""
        return {
            "orchestrator_name": self.name,
            "agents": {
                agent_id: agent.get_metadata()
                for agent_id, agent in self.agents.items()
            },
            "workflow": self.workflow,
            "total_agents": len(self.agents)
        }

