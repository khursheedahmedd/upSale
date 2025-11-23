from fastapi import APIRouter, Depends, HTTPException
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from sqlalchemy import func
from datetime import datetime, timedelta
from app.db.database import get_db
from app.models.jobs import Job, JobRelevance # Import necessary models, updated Relevance, removed Question and Proposal
from app.schemas.jobs import JobResponse as JobSchema, JobRelevanceResponse # Import necessary schemas, updated RelevanceSchema, removed QuestionSchema and ProposalSchema

router = APIRouter()


# List all jobs saved in postgres database
@router.get("/", response_model=List[JobSchema])
def list_all_jobs(db: Session = Depends(get_db), limit: Optional[int] = 200):
    # Query Job and eagerly load relevance
    # Query Job and eagerly load relevance
    # Query Job and eagerly load relevance
    # Removed joinedload for questions and proposals as they are not in the new Job model
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    # Optimized order_by: Removed func.coalesce as an index exists on publishedDateTime.
    # This allows the database to potentially use the index more efficiently for sorting.
    jobs_query = db.query(Job).options(
        joinedload(Job.relevance)
    ).filter(Job.publishedDateTime >= thirty_days_ago).order_by(Job.publishedDateTime.desc()) # Use publishedDateTime as per new schema

    if limit:
        jobs_orm = jobs_query.limit(limit).all()
    else:
        jobs_orm = jobs_query.all()

    # The JobSchema should handle mapping ORM objects to the desired response structure
    # including flattening client details and handling relationships.
    # We can directly pass the ORM objects to model_validate.
    validated_jobs = [JobSchema.model_validate(job) for job in jobs_orm]
    return validated_jobs


@router.get("/relevance/{relevance}", response_model=List[JobSchema])
def list_jobs_by_relevance(relevance: str, db: Session = Depends(get_db), limit: Optional[int] = 150):
    # Ensure relevance value matches the category column in the relevance table
    if relevance.lower() not in ["strong", "medium", "low", "irrelevant"]:
        raise HTTPException(status_code=400, detail="Invalid relevance value. Must be strong, medium, low, or irrelevant.")

    # Join with the JobRelevance table and filter by category
    # Removed joinedload for questions and proposals as they are not in the new Job model
    jobs_query = db.query(Job).join(JobRelevance).filter(JobRelevance.category == relevance.capitalize()).options( # Capitalize for consistency with enum/string values, updated join and filter
        joinedload(Job.relevance)
    ).order_by(Job.publishedDateTime.desc()) # Use publishedDateTime

    if limit:
        jobs_orm = jobs_query.limit(limit).all()
    else:
        jobs_orm = jobs_query.all()

    validated_jobs = [JobSchema.model_validate(job) for job in jobs_orm]
    return validated_jobs


# Get a specific job by ID
@router.get("/{job_id}", response_model=JobSchema)
def get_job(job_id: str, db: Session = Depends(get_db)):
    job = db.query(Job).options(
        joinedload(Job.relevance)
    ).filter(Job.id == job_id).first() 

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return JobSchema.model_validate(job)
