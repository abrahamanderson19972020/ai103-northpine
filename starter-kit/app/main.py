"""Northpine Basecamp: the web app for the AI-103 course.

Run it from the starter-kit folder:
    uvicorn app.main:app --reload --port 8000
Then open http://localhost:8000
"""
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from . import config
from .features import feature_list, include_routers

app = FastAPI(title="Northpine Basecamp", version="0.1.0")

# Every file in app/routers is added here automatically.
include_routers(app)


@app.get("/api/health")
def health() -> dict:
    return {"status": "ok", "foundry_project_configured": bool(config.PROJECT_ENDPOINT)}


@app.get("/api/features")
def features() -> list[dict]:
    return feature_list()


# Manual PDFs and product photos, so the website can show them.
app.mount("/files/manuals", StaticFiles(directory=config.DATA_DIR / "manuals"), name="manuals")
app.mount("/files/images", StaticFiles(directory=config.DATA_DIR / "images"), name="images")
# The shop website. It must be mounted last, because it answers every other path.
app.mount("/", StaticFiles(directory=config.WEB_DIR, html=True), name="web")
