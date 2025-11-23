from pydantic import BaseModel, Field
from typing import List, Dict, Optional
from enum import Enum

class RelevanceCategory(str, Enum):
    STRONG = "Strong"
    MEDIUM = "Medium"
    LOW = "Low"
    IRRELEVANT = "Irrelevant"

class CompanyProfile(BaseModel):
    name: str = Field(description="Company name")
    tools_technologies: List[str] = Field(description="List of tools and technologies the company uses")
    upwork_profile: str = Field(description="Company's Upwork profile information")
    location: str = Field(description="Company location")
    portfolio: List[Dict[str, str]] = Field(description="Company portfolio/case studies")
    past_projects: List[Dict[str, str]] = Field(description="Company's past projects")

class JobData(BaseModel):
    # Fields expected to be non-null for a job listing
    job_id: str                 # Corresponds to Job.id (Text, Primary Key)
    job_title: str              # Corresponds to Job.title (Text)
    job_description: str        # Corresponds to Job.description (Text)

    # Fields that might not be present or are optional
    job_link: Optional[str] = None  # Job model doesn't have a direct 'job_link'. Made optional.
                                    # If Job.ciphertext or another field represents this,
                                    # the instantiation logic in load_job_by_id would need to map it.

    team_name: Optional[str] = None # Corresponds to Job.team_name (Text), which can be NULL

    client_country: Optional[str] = None # Corresponds to Job.client_country (Text)
    category_label: Optional[str] = None # Corresponds to Job.category_label (Text)
    subcategory_label: Optional[str] = None # Corresponds to Job.subcategory_label (Text)
    
    # Assuming job_posted_on_date is derived from Job.publishedDateTime
    job_posted_on_date: Optional[str] = None 

    # Example of adding other potentially useful fields if needed, mapping from Job model:
    # experienceLevel: Optional[str] = None # From Job.experienceLevel
    # engagement: Optional[str] = None      # From Job.engagement

    class Config:
        # If you were to use this model to create SQLAlchemy objects,
        # orm_mode would be useful. For now, it's just for data validation.
        # orm_mode = True 
        pass

class MatchScore(BaseModel):
    job_id: str
    score: float
    category: RelevanceCategory
    reasoning: str
    technology_match: Optional[str] = None
    portfolio_match: Optional[str] = None
    project_match: Optional[str] = None
    location_match: Optional[str] = None
    closest_profile_name: Optional[str] = None
    tags: Optional[List[str]] = None