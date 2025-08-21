from fastapi import APIRouter, Depends, HTTPException
from app.api.deps import get_settings
from app.services.research_engine import ResearchEngine
from app.models.schemas import ResearchReport
from pydantic import BaseModel

router = APIRouter()

class ResearchRequest(BaseModel):
    company_name: str

@router.post("/")
async def perform_research(request: ResearchRequest, settings=Depends(get_settings)) -> ResearchReport:
    engine = ResearchEngine(
        openai_api_key=settings.OPENAI_API_KEY,
        serper_api_key=settings.SERPER_API_KEY,
        model=settings.MODEL
    )
    report = await engine.research_company(request.company_name)
    if not report:
        raise HTTPException(status_code=404, detail="Research failed")
    return report
