from sqlalchemy import Column, Integer, String, Float, Text, DateTime
import datetime
from database import Base

class ResumeScan(Base):
    __tablename__ = "resume_scans"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, index=True)
    job_title = Column(String, index=True)
    ats_score = Column(Float)
    text_similarity = Column(Float)
    keyword_score = Column(Float)
    structure_score = Column(Float)
    skills_matched = Column(Text)  # JSON-stringified list
    skills_missing = Column(Text)  # JSON-stringified list
    resume_text = Column(Text)
    job_description = Column(Text)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
