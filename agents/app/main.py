"""FastAPI app para Hermes runtime."""

from fastapi import FastAPI
from app.settings import get_settings

app = FastAPI(title="CivicSys Agents (Hermes)", version="0.1.0")


@app.get("/agents/health")
async def health():
    s = get_settings()
    return {
        "status": "ok",
        "chain_id": s.chain_id,
        "agent": "hermes",
        "version": "0.1.0",
    }
