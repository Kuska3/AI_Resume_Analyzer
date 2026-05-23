from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

class ResumeScanBase(BaseModel):
    filename: str
    job_title: str
    ats_score: float
    text_similarity: float
    keyword_score: float
    structure_score: float
    skills_matched: List[str]
    skills_missing: List[str]
    created_at: datetime

class ResumeScanResponse(ResumeScanBase):
    id: int
    resume_text: str
    job_description: str

    class Config:
        from_attributes = True

class ResumeScanBrief(BaseModel):
    id: int
    filename: str
    job_title: str
    ats_score: float
    created_at: datetime

    class Config:
        from_attributes = True
