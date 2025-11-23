"""
IBM watsonx Configuration Module
Centralizes all IBM watsonx.ai and ADK configurations for the hackathon project
"""
import os
from typing import Optional
from dotenv import load_dotenv
from ibm_watsonx_ai import Credentials
from ibm_watsonx_ai.foundation_models import ModelInference
from ibm_watsonx_ai.foundation_models.utils.enums import ModelTypes, DecodingMethods

load_dotenv()


class WatsonxConfig:
    """Configuration class for IBM watsonx services"""
    
    # API Credentials
    API_KEY: str = os.getenv("WATSONX_API_KEY", "")
    PROJECT_ID: str = os.getenv("WATSONX_PROJECT_ID", "")
    SPACE_ID: str = os.getenv("WATSONX_SPACE_ID", "")  # Alternative to PROJECT_ID
    URL: str = os.getenv("WATSONX_URL", "https://us-south.ml.cloud.ibm.com")
    
    # Model Configuration
    MODEL_ID: str = os.getenv("WATSONX_MODEL_ID", "ibm/granite-3-3-8b-instruct")
    
    # Alternative models for different tasks (using IBM Granite 3.3 - latest and best for hackathon!)
    MODELS = {
        "job_matching": "ibm/granite-3-3-8b-instruct",  # Latest IBM Granite model
        "proposal_generation": "ibm/granite-3-3-8b-instruct",  # Latest IBM Granite model
        "embedding": "ibm/slate-125m-english-rtrvr-v2",  # For embeddings
    }
    
    # Generation Parameters
    GENERATION_PARAMS = {
        "decoding_method": "greedy",
        "max_new_tokens": 2048,
        "min_new_tokens": 1,
        "temperature": 0.5,
        "top_k": 50,
        "top_p": 1,
        "repetition_penalty": 1.0,
    }
    
    # Orchestrate Configuration (if available)
    ORCHESTRATE_API_KEY: Optional[str] = os.getenv("WATSONX_ORCHESTRATE_API_KEY")
    ORCHESTRATE_URL: Optional[str] = os.getenv("WATSONX_ORCHESTRATE_URL")
    
    @classmethod
    def get_credentials(cls) -> Credentials:
        """Get watsonx.ai credentials"""
        if not cls.API_KEY:
            raise ValueError("WATSONX_API_KEY not found in environment variables")
        
        return Credentials(
            api_key=cls.API_KEY,
            url=cls.URL
        )
    
    @classmethod
    def get_model_inference(cls, model_id: Optional[str] = None) -> ModelInference:
        """
        Get a watsonx.ai model inference instance
        
        Args:
            model_id: Optional model ID, defaults to configured MODEL_ID
        """
        model = model_id or cls.MODEL_ID
        
        # Support both project_id and space_id
        inference_params = {
            "model_id": model,
            "credentials": cls.get_credentials(),
            "params": cls.GENERATION_PARAMS
        }
        
        # Use project_id if available, otherwise use space_id
        if cls.PROJECT_ID:
            inference_params["project_id"] = cls.PROJECT_ID
        elif cls.SPACE_ID:
            inference_params["space_id"] = cls.SPACE_ID
        else:
            raise ValueError("Either WATSONX_PROJECT_ID or WATSONX_SPACE_ID must be set")
        
        return ModelInference(**inference_params)
    
    @classmethod
    def validate_config(cls) -> bool:
        """Validate that all required configurations are present"""
        # API key is required, and either PROJECT_ID or SPACE_ID must be present
        has_api_key = bool(cls.API_KEY)
        has_id = bool(cls.PROJECT_ID) or bool(cls.SPACE_ID)
        return has_api_key and has_id
    
    @classmethod
    def get_auth_type(cls) -> str:
        """Return the authentication type being used"""
        if cls.PROJECT_ID:
            return "project"
        elif cls.SPACE_ID:
            return "space"
        else:
            return "none"


# Initialize global watsonx client for reuse
def get_watsonx_client(model_id: Optional[str] = None) -> ModelInference:
    """
    Get or create a watsonx.ai client instance
    
    Args:
        model_id: Optional specific model to use
    
    Returns:
        ModelInference instance ready for generation
    """
    if not WatsonxConfig.validate_config():
        raise ValueError(
            "IBM watsonx configuration incomplete. Please set:\n"
            "- WATSONX_API_KEY\n"
            "- WATSONX_PROJECT_ID\n"
            "in your .env file"
        )
    
    return WatsonxConfig.get_model_inference(model_id)


# Utility function for text generation
def generate_with_watsonx(
    prompt: str,
    model_id: Optional[str] = None,
    **kwargs
) -> str:
    """
    Generate text using watsonx.ai
    
    Args:
        prompt: Input prompt
        model_id: Optional model ID
        **kwargs: Additional generation parameters
    
    Returns:
        Generated text
    """
    client = get_watsonx_client(model_id)
    
    # Override default params with kwargs
    if kwargs:
        params = WatsonxConfig.GENERATION_PARAMS.copy()
        params.update(kwargs)
        client.params = params
    
    response = client.generate_text(prompt=prompt)
    return response


if __name__ == "__main__":
    # Test configuration
    print("Testing IBM watsonx Configuration...")
    print(f"API Key present: {'✓' if WatsonxConfig.API_KEY else '✗'}")
    print(f"Project ID present: {'✓' if WatsonxConfig.PROJECT_ID else '✗'}")
    print(f"Space ID present: {'✓' if WatsonxConfig.SPACE_ID else '✗'}")
    print(f"Auth Type: {WatsonxConfig.get_auth_type()}")
    print(f"URL: {WatsonxConfig.URL}")
    print(f"Model: {WatsonxConfig.MODEL_ID}")
    print(f"Config valid: {'✓' if WatsonxConfig.validate_config() else '✗'}")

