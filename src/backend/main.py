import json
from fastapi import FastAPI, UploadFile, File, Form, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

from database import engine, get_db
import models, schemas, analyzer

# Auto-create database tables if they do not exist
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Resume Analyzer API", version="1.0.0")

# Enable CORS for the React local development environment
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify actual frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def infer_job_title(jd_text: str) -> str:
    """
    Attempts to parse a meaningful job title from the job description text.
    If no title is found, returns a neat snippet of the first few words.
    """
    lines = [line.strip() for line in jd_text.split("\n") if line.strip()]
    if not lines:
        return "Software Role"
        
    # Check if first line contains common intro phrases or is very short (likely a title)
    first_line = lines[0]
    if len(first_line) < 60:
        # Clean potential headers like "Job Description:" or "Role:"
        clean_title = re.sub(r'^(job title|role|position|description|we are looking for a|wanted:)\s*:\s*', '', first_line, flags=re.IGNORECASE)
        return clean_title.strip()
        
    # Extract first 4-5 words
    words = first_line.split()
    title_snippet = " ".join(words[:4])
    if len(words) > 4:
        title_snippet += "..."
    return title_snippet

import re # needed in infer_job_title

@app.post("/api/analyze", response_model=schemas.ResumeScanResponse)
async def analyze_resume_endpoint(
    resume: UploadFile = File(...),
    job_description: str = Form(...),
    db: Session = Depends(get_db)
):
    # Verify file is a PDF
    if not resume.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file format. Please upload a PDF resume."
        )
        
    try:
        contents = await resume.read()
        resume_text = analyzer.extract_text_from_pdf(contents)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to read the PDF file: {str(e)}"
        )
        
    if not resume_text or len(resume_text.strip()) < 10:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The uploaded PDF contains no readable text. Ensure it is not a scanned image PDF."
        )
        
    # Perform NLP analysis
    analysis = analyzer.analyze_resume(resume_text, job_description)
    job_title = infer_job_title(job_description)
    
    # Save the scan history
    db_scan = models.ResumeScan(
        filename=resume.filename,
        job_title=job_title,
        ats_score=analysis["ats_score"],
        text_similarity=analysis["text_similarity"],
        keyword_score=analysis["keyword_score"],
        structure_score=analysis["structure_score"],
        skills_matched=json.dumps(analysis["skills_matched"]),
        skills_missing=json.dumps(analysis["skills_missing"]),
        resume_text=resume_text,
        job_description=job_description
    )
    
    db.add(db_scan)
    db.commit()
    db.refresh(db_scan)
    
    # Map model attributes to match schemas
    return schemas.ResumeScanResponse(
        id=db_scan.id,
        filename=db_scan.filename,
        job_title=db_scan.job_title,
        ats_score=db_scan.ats_score,
        text_similarity=db_scan.text_similarity,
        keyword_score=db_scan.keyword_score,
        structure_score=db_scan.structure_score,
        skills_matched=analysis["skills_matched"],
        skills_missing=analysis["skills_missing"],
        resume_text=db_scan.resume_text,
        job_description=db_scan.job_description,
        created_at=db_scan.created_at
    )

@app.get("/api/history", response_model=List[schemas.ResumeScanBrief])
def get_history(db: Session = Depends(get_db)):
    scans = db.query(models.ResumeScan).order_by(models.ResumeScan.created_at.desc()).all()
    return scans

@app.get("/api/history/{scan_id}", response_model=schemas.ResumeScanResponse)
def get_scan_details(scan_id: int, db: Session = Depends(get_db)):
    scan = db.query(models.ResumeScan).filter(models.ResumeScan.id == scan_id).first()
    if not scan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scan history record not found."
        )
        
    return schemas.ResumeScanResponse(
        id=scan.id,
        filename=scan.filename,
        job_title=scan.job_title,
        ats_score=scan.ats_score,
        text_similarity=scan.text_similarity,
        keyword_score=scan.keyword_score,
        structure_score=scan.structure_score,
        skills_matched=json.loads(scan.skills_matched),
        skills_missing=json.loads(scan.skills_missing),
        resume_text=scan.resume_text,
        job_description=scan.job_description,
        created_at=scan.created_at
    )

@app.delete("/api/history/{scan_id}", status_code=status.HTTP_200_OK)
def delete_scan(scan_id: int, db: Session = Depends(get_db)):
    scan = db.query(models.ResumeScan).filter(models.ResumeScan.id == scan_id).first()
    if not scan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scan history record not found."
        )
        
    db.delete(scan)
    db.commit()
    return {"detail": "Scan history deleted successfully."}
