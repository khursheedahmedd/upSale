# models.py - SQLAlchemy ORM Models
from sqlalchemy import (
    Column, Integer, String, Text, DateTime, Date, BigInteger, ForeignKey, Float, Identity,
    UniqueConstraint, Index # Added UniqueConstraint and Index
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import DOUBLE_PRECISION, REAL # Added REAL

Base = declarative_base()

class Data(Base):
    __tablename__ = "data"

    id = Column(Integer, primary_key=True, index=True) # Keeping index=True is generally fine
    campaign = Column(String)
    cost = Column(String)
    cpm = Column(String)
    impressions = Column(String)
    ctr = Column(String)
    cpc = Column(String)
    purchase = Column(String)
    cost_per_action = Column(String)
    scraped_at = Column(DateTime, nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)

    __table_args__ = (
        UniqueConstraint('campaign', 'start_date', 'end_date', name='data_campaign_start_date_end_date_key'),
    )


class JobToken(Base):
    __tablename__ = "job_tokens"
    id = Column(Integer, primary_key=True, index=True) # Keeping index=True
    token = Column(String)

class Job(Base):
    __tablename__ = "jobs"

    id = Column(Text, primary_key=True, index=True) # Keeping index=True
    title = Column(Text)
    description = Column(Text)
    createdDateTime = Column(DateTime)
    publishedDateTime = Column(DateTime)
    renewedDateTime = Column(DateTime)
    duration = Column(Text)
    durationLabel = Column(Text)
    engagement = Column(Text)
    recordNumber = Column(Text)
    experienceLevel = Column(Text)
    freelancersToHire = Column(Integer)
    enterprise = Column(Text)
    totalApplicants = Column(Integer)
    preferredFreelancerLocation = Column(Text)
    preferredFreelancerLocationMandatory = Column(Text)
    premium = Column(Text)
    client_country = Column(Text)
    client_total_hires = Column(Integer)
    client_total_posted_jobs = Column(Integer)
    client_total_spent = Column(DOUBLE_PRECISION)
    client_verification_status = Column(Text)
    client_location_city = Column(Text)
    client_location_state = Column(Text)
    client_location_timezone = Column(Text)
    client_location_offsetToUTC = Column(Text)
    client_total_reviews = Column(Integer)
    client_total_feedback = Column(DOUBLE_PRECISION)
    amount = Column(DOUBLE_PRECISION)
    currency = Column(Text)
    team_name = Column(Text)
    team_rid = Column(Text)
    team_id = Column(Text)
    team_photoUrl = Column(Text)
    status = Column(Text)
    category_id = Column(Text)
    category_label = Column(Text)
    subcategory_id = Column(Text)
    subcategory_label = Column(Text)
    city = Column(Text)
    state = Column(Text)
    country = Column(Text)
    threeLetterAbbreviation = Column(Text)
    phoneCode = Column(Text)
    avg_rate_bid = Column(DOUBLE_PRECISION)
    min_rate_bid = Column(DOUBLE_PRECISION)
    max_rate_bid = Column(DOUBLE_PRECISION)
    last_client_activity = Column(DateTime)
    invites_sent = Column(Integer)
    total_invited_to_interview = Column(Integer)
    total_hired = Column(Integer)
    total_unanswered_invites = Column(Integer)
    total_offered = Column(Integer)
    total_recommended = Column(Integer)
    skills = Column(Text)
    ciphertext = Column(Text)
    JobUpdatedDateTime = Column(DateTime)
    JobFirstFetchedDateTime = Column(DateTime, server_default=func.now())
    contractor_selection = Column(Text)
    relevance = relationship("JobRelevance", uselist=False, back_populates="job")

    __table_args__ = (
        Index('idx_jobs_engagement', 'engagement'),
        Index('idx_jobs_publisheddatetime', 'publishedDateTime'),
    )


class Metrics(Base):
    __tablename__ = "metrics"

    id = Column(Integer, primary_key=True, index=True) # Keeping index=True
    scraped_at = Column(DateTime, nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    cost = Column(String)
    cpm = Column(String)
    impressions = Column(String)
    ctr = Column(String)
    clicks = Column(String)
    cpc = Column(String)

    __table_args__ = (
        UniqueConstraint('start_date', 'end_date', name='metrics_start_date_end_date_key'),
    )

class ProposalSetting(Base):
    __tablename__ = "proposal_settings"

    id = Column(BigInteger, Identity(always=True), primary_key=True, index=True)
    user_id = Column(BigInteger)
    prompt = Column(Text)
    created_at = Column(DateTime, server_default=func.now())

    __table_args__ = (
        Index('idx_proposal_settings_user_id', 'user_id'),
    )

class Proposal(Base):
    __tablename__ = "proposals"

    id = Column(BigInteger, Identity(always=True), primary_key=True, index=True)
    job_id = Column(Text, ForeignKey("jobs.id"))
    user_id = Column(BigInteger)
    proposal_text = Column(Text)
    applied_at = Column(DateTime, server_default=func.now())
    status = Column(Text, server_default="applied")
    setting_id = Column(BigInteger, ForeignKey("proposal_settings.id"))

    __table_args__ = (
        Index('idx_proposals_job_id', 'job_id'),
        Index('idx_proposals_user_id', 'user_id'),
    )

class JobRelevance(Base):
    __tablename__ = "job_relevance"
    id = Column(Text, ForeignKey("jobs.id"), primary_key=True, index=True) 
    score = Column(REAL, nullable=False) 
    category = Column(Text, nullable=False)
    reasoning = Column(Text)
    technology_match = Column(Text)
    portfolio_match = Column(Text)
    project_match = Column(Text)
    location_match = Column(Text)
    closest_profile_name = Column(Text)
    tags = Column(Text)
    job = relationship("Job", back_populates="relevance")