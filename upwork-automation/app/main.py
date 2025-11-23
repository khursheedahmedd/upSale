from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import job_listings, rag_relevance, template_routes, dashboard_stats
from app.api.routes import watsonx_adk_routes, watsonx_governance  # IBM watsonx routes
from app.db.database import Base, engine
import logging

logger = logging.getLogger(__name__)

try:
    Base.metadata.create_all(bind=engine)
    logger.info("✓ Database tables created/verified successfully")
except Exception as e:
    logger.warning(f"⚠️  Database connection failed: {e}")
    logger.warning("⚠️  Application will start but database operations will fail")
    logger.warning("⚠️  Please configure your database in .env file")

app = FastAPI(
    title="Upwork Automation Tool API - IBM watsonx Edition",
    description="AI-powered Upwork job automation using IBM watsonx.ai and ADK",
    version="2.0.0-watsonx"
)

origins = ["*"] 

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Core API routes
app.include_router(job_listings.router, prefix="/api/job-listings", tags=["job-listings"])
app.include_router(rag_relevance.router, prefix="/api", tags=["jobs"])
app.include_router(template_routes.router, prefix="/api/template", tags=["template"])
app.include_router(dashboard_stats.router, prefix="/api/job-listings", tags=["dashboard"])

# IBM watsonx ADK routes (primary proposal generation)
app.include_router(watsonx_adk_routes.router, prefix="/api/watsonx", tags=["watsonx-adk"])

# IBM watsonx.governance routes (monitoring & compliance)
app.include_router(watsonx_governance.router, prefix="/api/watsonx", tags=["watsonx-governance"])

logger.info("✓ IBM watsonx ADK routes registered at /api/watsonx/*")
logger.info("✓ IBM watsonx.governance routes registered at /api/watsonx/governance/*")


@app.get("/")
async def root():
    return {
        "message": "Welcome to Upwork Automation Tool API - IBM watsonx Edition",
        "powered_by": "IBM watsonx.ai & ADK",
        "version": "2.0.0-watsonx",
        "features": [
            "AI-powered job matching with watsonx.ai",
            "ADK agent orchestration",
            "RAG-enhanced analysis",
            "Automated proposal generation"
        ],
        "endpoints": {
            "core": {
                "job_listings": "/api/job-listings",
                "relevance": "/api",
                "templates": "/api/template"
            },
            "watsonx_adk": {
                "analyze_job": "/api/watsonx/adk/analyze-job/{job_id}",
                "batch_analyze": "/api/watsonx/adk/analyze-jobs-batch",
                "generate_proposal": "/api/watsonx/adk/generate-proposal/{job_id}",
                "save_proposal": "/api/watsonx/adk/save-proposal/{job_id}",
                "agents_metadata": "/api/watsonx/adk/agents/metadata",
                "health": "/api/watsonx/adk/health"
            },
            "watsonx_governance": {
                "metrics": "/api/watsonx/governance/metrics",
                "audit_log": "/api/watsonx/governance/audit-log",
                "report": "/api/watsonx/governance/report",
                "model_details": "/api/watsonx/governance/model/{model_name}/details"
            }
        },
        "docs": "/docs",
        "hackathon": "IBM watsonx Agents Hackathon 2025"
    }
