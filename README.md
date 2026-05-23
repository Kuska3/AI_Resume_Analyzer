# AI Resume Analyzer

An AI-powered ATS Resume Analyzer that helps users optimize resumes for job applications using NLP, keyword matching, and ATS scoring.

---

## Features

- PDF Resume Upload
- ATS Score Calculation
- Job Description Matching
- Keyword Analysis
- Missing Skill Detection
- Resume Suggestions
- Scan History
- Beautiful Dashboard UI
- FastAPI Backend
- React Frontend

---

## Tech Stack

### Frontend
- React.js
- Vite
- Vanilla CSS
- SVG Animations

### Backend
- FastAPI
- SQLite
- SQLAlchemy
- Scikit-learn
- PyPDF

### NLP Features
- TF-IDF Vectorization
- Cosine Similarity
- Keyword Extraction
- Skill Matching
- Resume Structure Analysis

---

## ATS Score Formula

```math
ATS = 0.4(TextSimilarity) + 0.4(KeywordMatch) + 0.2(StructureScore)
```

---

## Project Structure

```bash
ai-resume-analyzer/
│
├── backend/
│   ├── main.py
│   ├── analyzer.py
│   ├── database.py
│   ├── models.py
│   ├── schemas.py
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
└── README.md
```

---

## Installation

### Backend Setup

```bash
cd backend

pip install -r requirements.txt

uvicorn main:app --reload
```

Backend runs on:

```bash
http://127.0.0.1:8000
```

---

### Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

Frontend runs on:

```bash
http://localhost:5173
```

---

## API Endpoints

### Analyze Resume

```http
POST /api/analyze
```

### Get History

```http
GET /api/history
```

### Get Scan Details

```http
GET /api/history/{id}
```

### Delete Scan

```http
DELETE /api/history/{id}
```

---

## Future Improvements

- AI Resume Rewrite Suggestions
- OpenAI/Gemini Integration
- Authentication System
- Cloud Deployment
- Resume Templates
- Multi-language Support
- Recruiter Dashboard

---

## Screenshots

Add screenshots here after UI completion.(Soon....)

---

## License

MIT License

---

## Author

Kushagra Sharma
