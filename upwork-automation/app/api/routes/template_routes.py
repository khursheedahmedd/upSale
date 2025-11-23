from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os

router = APIRouter()

TEMPLATE_FILE_PATH = os.path.join(os.path.dirname(__file__), "agents", "proposal_template.md")

class TemplateContent(BaseModel):
    content: str

@router.get("/proposal-template")
async def get_proposal_template():
    """
    Reads and returns the content of the proposal template file.
    """
    try:
        with open(TEMPLATE_FILE_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        return {"content": content}
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Proposal template file not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading template file: {e}")

@router.put("/proposal-template")
async def update_proposal_template(template_content: TemplateContent):
    """
    Updates the content of the proposal template file.
    """
    try:
        with open(TEMPLATE_FILE_PATH, "w", encoding="utf-8") as f:
            f.write(template_content.content)
        return {"message": "Proposal template updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error writing to template file: {e}")
