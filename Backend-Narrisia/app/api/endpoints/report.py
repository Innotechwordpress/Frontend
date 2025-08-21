from fastapi import APIRouter, Depends
from app.models.schemas import ResearchReport
from app.services.research_engine import ResearchEngine
from app.api.deps import get_settings
from app.utils.report_generator import generate_markdown_report

router = APIRouter()

@router.get("/{report_id}")
async def get_report(report_id: str, settings=Depends(get_settings)):
    engine = ResearchEngine(
        openai_api_key=settings.OPENAI_API_KEY,
        serper_api_key=settings.SERPER_API_KEY,
        model=settings.MODEL
    )
    report: ResearchReport = await engine.get_report(report_id)
    if not report:
        return {"error": "Report not found"}
    md_report = generate_markdown_report(report)
    return {"json_report": report, "markdown_report": md_report}
