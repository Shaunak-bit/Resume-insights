import os, io, re, time
from datetime import datetime
from collections import Counter
from typing import Optional, List, Dict, Any

import fitz  # PyMuPDF
import requests
from fastapi import FastAPI, UploadFile, File, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pymongo import MongoClient
from bson import ObjectId
import json

from dotenv import load_dotenv
load_dotenv()  # This loads the .env file into environment variables


# ---------- Config ----------
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "resume_insight")
COLL_NAME = os.getenv("COLL_NAME", "resumes")
SARVAM_API_KEY = os.getenv("SARVAM_API_KEY")
SARVAM_API_URL = os.getenv("SARVAM_API_URL", "https://api.sarvam.ai/v1/chat/completions")
SARVAM_MODEL = os.getenv("SARVAM_MODEL", "sarvam-m")

STOPWORDS = set("""
a an the and or of to in for with on by as is are was were be been being this that these those from it its
at your you we our they their he she his her them i me my mine
""".split())

# ---------- App ----------
app = FastAPI(title="Resume Insight Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = MongoClient(MONGO_URI)
coll = client[DB_NAME][COLL_NAME]

# ---------- Helpers ----------
def extract_text_from_pdf(file_bytes: bytes) -> str:
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    text_parts = [page.get_text("text") for page in doc]
    return "\n".join(text_parts).strip()

def top_five_words(text: str) -> List[str]:
    words = re.findall(r"[A-Za-z]+", text.lower())
    words = [w for w in words if w not in STOPWORDS and len(w) > 2]
    counts = Counter(words)
    return [w for w, _ in counts.most_common(5)]

def heuristic_recommendation(text: str) -> str:
    rec = []
    if not re.search(r"\d", text):
        rec.append("Add quantifiable achievements (numbers, impact, metrics).")
    if not re.search(r"\b(cloud|aws|azure|gcp)\b", text, re.I):
        rec.append("Mention cloud experience or tooling if relevant.")
    if not re.search(r"\btests?|testing|pytest|jest|ci/cd|pipeline\b", text, re.I):
        rec.append("Highlight testing or CI/CD to show engineering rigor.")
    return " ".join(rec) or "Great baseline—consider tailoring to the target role and adding measurable impact."

def call_sarvam_summary(text: str) -> Optional[Dict[str, str]]:
    if not SARVAM_API_KEY:
        print("⚠️ SARVAM_API_KEY is missing!")
        return None

    print("➡️ Calling Sarvam API...")
    content = text[:12000]

    prompt = (
        "You are an assistant that summarizes resumes for recruiters. "
        "From the resume text below, produce:\n"
        "1) A 2–3 paragraph concise summary (skills, experience, impact).\n"
        "2) One short actionable recommendation.\n\n"
        f"Resume Text:\n{content}\n\n"
        "Return JSON with keys: summary, recommendation."
    )

    headers = {
        "Authorization": f"Bearer {SARVAM_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": SARVAM_MODEL,
        "messages": [
            {"role": "system", "content": "You produce structured, concise outputs."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.3,
    }

    try:
        r = requests.post(SARVAM_API_URL, headers=headers, json=payload, timeout=30)
        print("➡️ Sarvam API status:", r.status_code)
        print("➡️ Sarvam API response (first 500 chars):", r.text[:500])

        if r.status_code != 200:
            print("❌ Sarvam API returned non-200 status")
            return None

        data = r.json()
        content = data.get("choices", [{}])[0].get("message", {}).get("content", "").strip()
        print("➡️ Extracted content (first 300 chars):", content[:300])

        parsed = None
        try:
            parsed = json.loads(content)
        except Exception:
            m = re.search(r"summary[:\-]\s*(.+?)recommendation[:\-]\s*(.+)$", content, re.I | re.S)
            if m:
                parsed = {"summary": m.group(1).strip(), "recommendation": m.group(2).strip()}

        if parsed and "summary" in parsed:
            return {
                "summary": parsed["summary"].strip(),
                "recommendation": parsed.get("recommendation", "").strip() or heuristic_recommendation(text)
            }
        else:
            return {"summary": content, "recommendation": heuristic_recommendation(text)}

    except Exception as e:
        print("❌ Exception calling Sarvam API:", e)
        return None

# ---------- Models ----------
class InsightOut(BaseModel):
    id: str
    fileName: str
    uploadDate: str
    insightType: str
    summary: Optional[str] = None
    recommendation: Optional[str] = None
    topWords: Optional[List[str]] = None

# ---------- Endpoints ----------
@app.post("/upload-resume", response_model=InsightOut)
async def upload_resume(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted.")

    content = await file.read()

    try:
        text = extract_text_from_pdf(content)
        if not text:
            raise ValueError("No text found in PDF.")
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Failed to read PDF: {e}")

    ai = call_sarvam_summary(text)

    doc = {
        "fileName": file.filename,
        "uploadDate": datetime.utcnow(),
        "insightType": "AI Summary" if ai else "Frequent Words",
        "summary": ai["summary"] if ai else None,
        "recommendation": ai["recommendation"] if ai else None,
        "topWords": None if ai else top_five_words(text),
    }

    inserted = coll.insert_one(doc)
    doc_id = str(inserted.inserted_id)

    return InsightOut(
        id=doc_id,
        fileName=doc["fileName"],
        uploadDate=doc["uploadDate"].isoformat() + "Z",
        insightType=doc["insightType"],
        summary=doc["summary"],
        recommendation=doc["recommendation"],
        topWords=doc["topWords"],
    )

@app.get("/insights", response_model=List[InsightOut])
def list_insights():
    items = []
    for d in coll.find().sort("uploadDate", -1):
        items.append(InsightOut(
            id=str(d["_id"]),
            fileName=d["fileName"],
            uploadDate=d["uploadDate"].isoformat() + "Z",
            insightType=d["insightType"],
            summary=d.get("summary"),
            recommendation=d.get("recommendation"),
            topWords=d.get("topWords"),
        ))
    return items

@app.get("/insights/{doc_id}", response_model=InsightOut)
def get_insight(doc_id: str):
    try:
        d = coll.find_one({"_id": ObjectId(doc_id)})
        if not d:
            raise HTTPException(status_code=404, detail="Not found")
        return InsightOut(
            id=str(d["_id"]),
            fileName=d["fileName"],
            uploadDate=d["uploadDate"].isoformat() + "Z",
            insightType=d["insightType"],
            summary=d.get("summary"),
            recommendation=d.get("recommendation"),
            topWords=d.get("topWords"),
        )
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid id")
