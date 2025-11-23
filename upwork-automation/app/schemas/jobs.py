from pydantic import BaseModel
from datetime import datetime, date
from typing import Optional, List 


class JobRelevanceBase(BaseModel):
    score: float
    category: str
    reasoning: Optional[str] = None
    technology_match: Optional[str] = None
    portfolio_match: Optional[str] = None
    project_match: Optional[str] = None
    location_match: Optional[str] = None
    closest_profile_name: Optional[str] = None
    tags: Optional[str] = None

class JobRelevanceCreate(JobRelevanceBase):
    id: str

class JobRelevanceUpdate(BaseModel):
    score: Optional[float] = None
    category: Optional[str] = None
    reasoning: Optional[str] = None
    technology_match: Optional[str] = None
    portfolio_match: Optional[str] = None
    project_match: Optional[str] = None
    location_match: Optional[str] = None
    closest_profile_name: Optional[str] = None
    tags: Optional[str] = None

class JobRelevanceResponse(JobRelevanceBase):
    id: str 

    class Config:
        from_attributes = True


class DataBase(BaseModel):
    campaign: Optional[str] = None
    cost: Optional[str] = None
    cpm: Optional[str] = None
    impressions: Optional[str] = None
    ctr: Optional[str] = None
    cpc: Optional[str] = None
    purchase: Optional[str] = None
    cost_per_action: Optional[str] = None
    scraped_at: datetime
    start_date: date
    end_date: date

class DataCreate(DataBase):
    pass

class DataUpdate(BaseModel):
    campaign: Optional[str] = None
    cost: Optional[str] = None
    cpm: Optional[str] = None
    impressions: Optional[str] = None
    ctr: Optional[str] = None
    cpc: Optional[str] = None
    purchase: Optional[str] = None
    cost_per_action: Optional[str] = None
    scraped_at: Optional[datetime] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None

class DataResponse(DataBase):
    id: int

    class Config:
        from_attributes = True

class JobTokenBase(BaseModel):
    token: Optional[str] = None

class JobTokenCreate(JobTokenBase):
    pass

class JobTokenUpdate(BaseModel):
    token: Optional[str] = None

class JobTokenResponse(JobTokenBase):
    id: int

    class Config:
        from_attributes = True

class JobBase(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    createdDateTime: Optional[datetime] = None
    publishedDateTime: Optional[datetime] = None
    renewedDateTime: Optional[datetime] = None
    duration: Optional[str] = None
    durationLabel: Optional[str] = None
    engagement: Optional[str] = None
    recordNumber: Optional[str] = None
    experienceLevel: Optional[str] = None
    freelancersToHire: Optional[int] = None
    enterprise: Optional[str] = None
    totalApplicants: Optional[int] = None
    preferredFreelancerLocation: Optional[str] = None
    preferredFreelancerLocationMandatory: Optional[str] = None
    premium: Optional[str] = None
    client_country: Optional[str] = None
    client_total_hires: Optional[int] = None
    client_total_posted_jobs: Optional[int] = None
    client_total_spent: Optional[float] = None
    client_verification_status: Optional[str] = None
    client_location_city: Optional[str] = None
    client_location_state: Optional[str] = None
    client_location_timezone: Optional[str] = None
    client_location_offsetToUTC: Optional[str] = None
    client_total_reviews: Optional[int] = None
    client_total_feedback: Optional[float] = None
    amount: Optional[float] = None
    currency: Optional[str] = None
    team_name: Optional[str] = None
    team_rid: Optional[str] = None
    team_id: Optional[str] = None
    team_photoUrl: Optional[str] = None
    status: Optional[str] = None
    category_id: Optional[str] = None
    category_label: Optional[str] = None
    subcategory_id: Optional[str] = None
    subcategory_label: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    threeLetterAbbreviation: Optional[str] = None
    phoneCode: Optional[str] = None
    avg_rate_bid: Optional[float] = None
    min_rate_bid: Optional[float] = None
    max_rate_bid: Optional[float] = None
    last_client_activity: Optional[datetime] = None
    invites_sent: Optional[int] = None
    total_invited_to_interview: Optional[int] = None
    total_hired: Optional[int] = None
    total_unanswered_invites: Optional[int] = None
    total_offered: Optional[int] = None
    total_recommended: Optional[int] = None
    skills: Optional[str] = None
    ciphertext: Optional[str] = None
    JobUpdatedDateTime: Optional[datetime] = None
    JobFirstFetchedDateTime: Optional[datetime] = None
    contractor_selection: Optional[str] = None
    relevance: Optional[JobRelevanceResponse] = None


class JobCreate(JobBase):
    id: str # ID is required for creation


class JobUpdate(BaseModel):
    # Exclude id as it's the primary key and typically not updated this way
    title: Optional[str] = None
    description: Optional[str] = None
    createdDateTime: Optional[datetime] = None
    publishedDateTime: Optional[datetime] = None
    renewedDateTime: Optional[datetime] = None
    duration: Optional[str] = None
    durationLabel: Optional[str] = None
    engagement: Optional[str] = None
    recordNumber: Optional[str] = None
    experienceLevel: Optional[str] = None
    freelancersToHire: Optional[int] = None
    enterprise: Optional[str] = None
    totalApplicants: Optional[int] = None
    preferredFreelancerLocation: Optional[str] = None
    preferredFreelancerLocationMandatory: Optional[str] = None
    premium: Optional[str] = None
    client_country: Optional[str] = None
    client_total_hires: Optional[int] = None
    client_total_posted_jobs: Optional[int] = None
    client_total_spent: Optional[float] = None
    client_verification_status: Optional[str] = None
    client_location_city: Optional[str] = None
    client_location_state: Optional[str] = None
    client_location_timezone: Optional[str] = None
    client_location_offsetToUTC: Optional[str] = None
    client_total_reviews: Optional[int] = None
    client_total_feedback: Optional[float] = None
    amount: Optional[float] = None
    currency: Optional[str] = None
    team_name: Optional[str] = None
    team_rid: Optional[str] = None
    team_id: Optional[str] = None
    team_photoUrl: Optional[str] = None
    status: Optional[str] = None
    category_id: Optional[str] = None
    category_label: Optional[str] = None
    subcategory_id: Optional[str] = None
    subcategory_label: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    threeLetterAbbreviation: Optional[str] = None
    phoneCode: Optional[str] = None
    avg_rate_bid: Optional[float] = None
    min_rate_bid: Optional[float] = None
    max_rate_bid: Optional[float] = None
    last_client_activity: Optional[datetime] = None
    invites_sent: Optional[int] = None
    total_invited_to_interview: Optional[int] = None
    total_hired: Optional[int] = None
    total_unanswered_invites: Optional[int] = None
    total_offered: Optional[int] = None
    total_recommended: Optional[int] = None
    skills: Optional[str] = None
    ciphertext: Optional[str] = None
    JobUpdatedDateTime: Optional[datetime] = None
    JobFirstFetchedDateTime: Optional[datetime] = None
    contractor_selection: Optional[str] = None

class JobResponse(JobBase):
    id: str 

    class Config:
        from_attributes = True


class MetricsBase(BaseModel):
    scraped_at: datetime
    start_date: date
    end_date: date
    cost: Optional[str] = None
    cpm: Optional[str] = None
    impressions: Optional[str] = None
    ctr: Optional[str] = None
    clicks: Optional[str] = None
    cpc: Optional[str] = None

class MetricsCreate(MetricsBase):
    pass

class MetricsUpdate(BaseModel):
    scraped_at: Optional[datetime] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    cost: Optional[str] = None
    cpm: Optional[str] = None
    impressions: Optional[str] = None
    ctr: Optional[str] = None
    clicks: Optional[str] = None
    cpc: Optional[str] = None

class MetricsResponse(MetricsBase):
    id: int

    class Config:
        from_attributes = True

class ProposalSettingBase(BaseModel):
    user_id: Optional[int] = None
    prompt: Optional[str] = None

class ProposalSettingCreate(ProposalSettingBase):
    pass

class ProposalSettingUpdate(BaseModel):
    user_id: Optional[int] = None
    prompt: Optional[str] = None

class ProposalSettingResponse(ProposalSettingBase):
    id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class ProposalBase(BaseModel):
    job_id: Optional[str] = None
    user_id: Optional[int] = None
    proposal_text: Optional[str] = None
    status: Optional[str] = None
    setting_id: Optional[int] = None

class ProposalCreate(ProposalBase):
    pass

class ProposalUpdate(BaseModel):
    job_id: Optional[str] = None
    user_id: Optional[int] = None
    proposal_text: Optional[str] = None
    status: Optional[str] = None
    setting_id: Optional[int] = None

class ProposalResponse(ProposalBase):
    id: int
    applied_at: Optional[datetime] = None

    class Config:
        from_attributes = True