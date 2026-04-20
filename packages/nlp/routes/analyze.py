from fastapi import APIRouter
from pydantic import BaseModel
from services.nlp_pipeline import analyze_text

router = APIRouter()


class AnalyzeRequest(BaseModel):
    text: str
    source_url: str | None = None
    company_name: str | None = None


@router.post("/analyze")
async def analyze_contract(request: AnalyzeRequest):
    """
    Sözleşme metnini analiz eder ve risk raporunu döndürür.
    """
    result = analyze_text(request.text)
    return {
        "company_name": request.company_name,
        "source_url": request.source_url,
        "risk_score": result["risk_score"],
        "risk_level": result["risk_level"],
        "summary": result["summary"],
        "risk_items": result["risk_items"],
    }
