from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import scan
from routers import pdf
from utils.detector import get_detector


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Warm up the HuggingFace pipeline so the first /scan doesn't pay the
    # 20–60s download/load cost while the user is watching a spinner.
    get_detector()
    yield


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # dev-only; tighten before shipping
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(scan.router)
app.include_router(pdf.router)


@app.get("/health")
def health():
    return {"ok": True}