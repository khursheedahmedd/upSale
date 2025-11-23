"""
IBM watsonx.governance Integration
Provides model monitoring, audit trails, and governance for hackathon showcase
"""
import logging
from datetime import datetime
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.db.database import get_db

logger = logging.getLogger(__name__)
router = APIRouter()

MODEL_METRICS = {
    "job_matching": {
        "total_requests": 0,
        "successful": 0,
        "failed": 0,
        "avg_latency_ms": 0,
        "model_id": "ibm/granite-13b-chat-v2",
        "last_used": None
    },
    "proposal_generation": {
        "total_requests": 0,
        "successful": 0,
        "failed": 0,
        "avg_latency_ms": 0,
        "model_id": "meta-llama/llama-3-70b-instruct",
        "last_used": None
    }
}

AUDIT_LOG = []


class ModelMetrics(BaseModel):
    """Model performance metrics"""
    model_name: str
    total_requests: int
    successful: int
    failed: int
    success_rate: float
    avg_latency_ms: float
    model_id: str
    last_used: Optional[str]


class AuditLogEntry(BaseModel):
    """Audit log entry"""
    timestamp: str
    model_name: str
    operation: str
    input_summary: str
    output_summary: str
    latency_ms: float
    status: str
    user_id: Optional[str] = None


class GovernanceReport(BaseModel):
    """Comprehensive governance report"""
    generated_at: str
    total_model_calls: int
    models_monitored: int
    overall_success_rate: float
    audit_entries: int
    compliance_status: str


def log_model_usage(
    model_name: str,
    operation: str,
    input_summary: str,
    output_summary: str,
    latency_ms: float,
    status: str,
    user_id: Optional[str] = None
):
    """
    Log model usage for governance and audit
    
    Args:
        model_name: Name of the model/agent
        operation: Operation performed
        input_summary: Summary of input
        output_summary: Summary of output
        latency_ms: Latency in milliseconds
        status: success/failure
        user_id: Optional user identifier
    """
    # Update metrics
    if model_name in MODEL_METRICS:
        metrics = MODEL_METRICS[model_name]
        metrics["total_requests"] += 1
        
        if status == "success":
            metrics["successful"] += 1
        else:
            metrics["failed"] += 1
        
        # Update average latency
        total = metrics["total_requests"]
        current_avg = metrics["avg_latency_ms"]
        metrics["avg_latency_ms"] = ((current_avg * (total - 1)) + latency_ms) / total
        
        metrics["last_used"] = datetime.utcnow().isoformat()
    
    # Add to audit log
    audit_entry = {
        "timestamp": datetime.utcnow().isoformat(),
        "model_name": model_name,
        "operation": operation,
        "input_summary": input_summary[:200],  # Truncate for privacy
        "output_summary": output_summary[:200],
        "latency_ms": latency_ms,
        "status": status,
        "user_id": user_id
    }
    
    AUDIT_LOG.append(audit_entry)
    
    # Keep only last 1000 entries for demo
    if len(AUDIT_LOG) > 1000:
        AUDIT_LOG.pop(0)
    
    logger.info(f"[Governance] Logged {model_name} usage: {operation} ({status})")


@router.get("/governance/metrics", response_model=List[ModelMetrics])
async def get_model_metrics():
    """
    Get performance metrics for all monitored models
    
    **IBM watsonx.governance Feature:**
    - Model performance tracking
    - Success rate monitoring
    - Latency analysis
    - Usage statistics
    """
    metrics_list = []
    
    for model_name, metrics in MODEL_METRICS.items():
        total = metrics["total_requests"]
        success_rate = (metrics["successful"] / total * 100) if total > 0 else 0
        
        metrics_list.append(ModelMetrics(
            model_name=model_name,
            total_requests=total,
            successful=metrics["successful"],
            failed=metrics["failed"],
            success_rate=round(success_rate, 2),
            avg_latency_ms=round(metrics["avg_latency_ms"], 2),
            model_id=metrics["model_id"],
            last_used=metrics["last_used"]
        ))
    
    return metrics_list


@router.get("/governance/audit-log", response_model=List[AuditLogEntry])
async def get_audit_log(limit: int = 50):
    """
    Get audit log of model usage
    
    **IBM watsonx.governance Feature:**
    - Complete audit trail
    - Compliance tracking
    - Usage history
    - Transparency
    
    Args:
        limit: Maximum number of entries to return (default: 50)
    """
    # Return most recent entries
    return [AuditLogEntry(**entry) for entry in AUDIT_LOG[-limit:]]


@router.get("/governance/report", response_model=GovernanceReport)
async def get_governance_report():
    """
    Get comprehensive governance report
    
    **IBM watsonx.governance Feature:**
    - Holistic governance overview
    - Compliance status
    - Model health summary
    - Audit statistics
    """
    total_calls = sum(m["total_requests"] for m in MODEL_METRICS.values())
    total_successful = sum(m["successful"] for m in MODEL_METRICS.values())
    
    overall_success_rate = (total_successful / total_calls * 100) if total_calls > 0 else 100
    
    # Determine compliance status
    if overall_success_rate >= 95:
        compliance_status = "Excellent"
    elif overall_success_rate >= 85:
        compliance_status = "Good"
    elif overall_success_rate >= 70:
        compliance_status = "Acceptable"
    else:
        compliance_status = "Needs Attention"
    
    return GovernanceReport(
        generated_at=datetime.utcnow().isoformat(),
        total_model_calls=total_calls,
        models_monitored=len(MODEL_METRICS),
        overall_success_rate=round(overall_success_rate, 2),
        audit_entries=len(AUDIT_LOG),
        compliance_status=compliance_status
    )


@router.post("/governance/reset-metrics")
async def reset_metrics():
    """
    Reset all metrics (for demo purposes)
    
    **Note**: In production, this would be restricted to admins
    """
    for model_name in MODEL_METRICS:
        MODEL_METRICS[model_name] = {
            "total_requests": 0,
            "successful": 0,
            "failed": 0,
            "avg_latency_ms": 0,
            "model_id": MODEL_METRICS[model_name]["model_id"],
            "last_used": None
        }
    
    AUDIT_LOG.clear()
    
    logger.info("[Governance] Metrics reset")
    
    return {
        "message": "Metrics reset successfully",
        "timestamp": datetime.utcnow().isoformat()
    }


@router.get("/governance/model/{model_name}/details")
async def get_model_details(model_name: str):
    """
    Get detailed information about a specific model
    
    **IBM watsonx.governance Feature:**
    - Model-specific analytics
    - Performance deep-dive
    - Usage patterns
    """
    if model_name not in MODEL_METRICS:
        return {"error": f"Model '{model_name}' not found"}
    
    metrics = MODEL_METRICS[model_name]
    
    # Get recent audit entries for this model
    recent_usage = [
        entry for entry in AUDIT_LOG[-100:]
        if entry["model_name"] == model_name
    ]
    
    total = metrics["total_requests"]
    success_rate = (metrics["successful"] / total * 100) if total > 0 else 0
    
    return {
        "model_name": model_name,
        "model_id": metrics["model_id"],
        "metrics": {
            "total_requests": total,
            "successful": metrics["successful"],
            "failed": metrics["failed"],
            "success_rate": round(success_rate, 2),
            "avg_latency_ms": round(metrics["avg_latency_ms"], 2),
            "last_used": metrics["last_used"]
        },
        "recent_usage": recent_usage[-10:],  # Last 10 uses
        "status": "healthy" if success_rate >= 90 else "degraded" if success_rate >= 70 else "unhealthy"
    }


# Decorator for automatic governance logging
def with_governance_logging(model_name: str, operation: str):
    """
    Decorator to automatically log model usage
    
    Usage:
        @with_governance_logging("job_matching", "analyze_job")
        def analyze_job(...):
            ...
    """
    def decorator(func):
        async def wrapper(*args, **kwargs):
            import time
            start_time = time.time()
            
            try:
                result = await func(*args, **kwargs)
                latency_ms = (time.time() - start_time) * 1000
                
                log_model_usage(
                    model_name=model_name,
                    operation=operation,
                    input_summary=str(kwargs.get("job_id", "N/A")),
                    output_summary=str(result)[:100],
                    latency_ms=latency_ms,
                    status="success"
                )
                
                return result
                
            except Exception as e:
                latency_ms = (time.time() - start_time) * 1000
                
                log_model_usage(
                    model_name=model_name,
                    operation=operation,
                    input_summary=str(kwargs.get("job_id", "N/A")),
                    output_summary=f"Error: {str(e)}",
                    latency_ms=latency_ms,
                    status="failure"
                )
                
                raise
        
        return wrapper
    return decorator


# Export for use in other modules
__all__ = ["log_model_usage", "with_governance_logging", "router"]

