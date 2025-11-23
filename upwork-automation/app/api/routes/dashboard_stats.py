"""
Dashboard Statistics API Routes
Provides real-time statistics for the admin dashboard
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.database import get_db
from app.models.jobs import Job, Proposal, JobRelevance
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/stats")
async def get_dashboard_stats(db: Session = Depends(get_db)):
    """
    Get dashboard statistics
    
    Returns:
    - total_jobs: Total number of jobs in database
    - relevant_jobs: Number of jobs marked as relevant
    - proposals_generated: Number of proposals created
    - success_rate: Percentage of relevant jobs
    - avg_response_time: Average AI response time (mock for now)
    """
    try:
        # Total jobs
        total_jobs = db.query(func.count(Job.id)).scalar() or 0
        
        # Relevant jobs (Strong or Medium category)
        relevant_jobs = db.query(func.count(JobRelevance.id)).filter(
            JobRelevance.category.in_(['Strong', 'Medium'])
        ).scalar() or 0
        
        # Proposals generated
        proposals_generated = db.query(func.count(Proposal.id)).scalar() or 0
        
        # Success rate
        success_rate = round((relevant_jobs / total_jobs * 100), 1) if total_jobs > 0 else 0
        
        # Mock avg response time (in seconds)
        avg_response_time = 2.3
        
        return {
            "total_jobs": total_jobs,
            "relevant_jobs": relevant_jobs,
            "proposals_generated": proposals_generated,
            "success_rate": success_rate,
            "avg_response_time": avg_response_time,
            "active_agents": 4,
            "status": "operational"
        }
    except Exception as e:
        logger.error(f"Error fetching dashboard stats: {e}")
        return {
            "total_jobs": 0,
            "relevant_jobs": 0,
            "proposals_generated": 0,
            "success_rate": 0,
            "avg_response_time": 0,
            "active_agents": 4,
            "status": "error"
        }

