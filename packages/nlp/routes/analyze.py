import io
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from services.nlp_pipeline import analyze_text
import pypdf
from docx import Document

router = APIRouter()

def extract_text_from_file(file: UploadFile, content: bytes) -> str:
    filename = file.filename.lower()
    text = ""
    if filename.endswith(".txt"):
        text = content.decode("utf-8", errors="ignore")
    elif filename.endswith(".pdf"):
        pdf_reader = pypdf.PdfReader(io.BytesIO(content))
        for page in pdf_reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    elif filename.endswith(".docx"):
        doc = Document(io.BytesIO(content))
        for para in doc.paragraphs:
            text += para.text + "\n"
    else:
        raise HTTPException(status_code=400, detail="Desteklenmeyen dosya formatı. Sadece .txt, .pdf, .docx desteklenir.")
    return text

@router.post("/analyze")
async def analyze_contract(
    file: UploadFile = File(...),
    company_name: str | None = Form(None)
):
    """
    Sözleşme dosyasını (PDF, DOCX, TXT) Legal-BERT (LEDGAR) modeliyle analiz eder
    ve risk raporunu döndürür.
    """
    content = await file.read()
    if not content:
        raise HTTPException(status_code=422, detail="Dosya boş olamaz.")

    text = extract_text_from_file(file, content)
    
    if not text or not text.strip():
        raise HTTPException(status_code=422, detail="Dosyadan okunabilir metin çıkarılamadı.")

    result = analyze_text(text)
    return {
        "filename":        file.filename,
        "company_name":    company_name,
        "risk_score":      result["risk_score"],
        "risk_level":      result["risk_level"],
        "risk_level_label": result["risk_level_label"],
        "summary":         result["summary"],
        "risk_items":      result["risk_items"],
        "model":           result["model"],
    }
