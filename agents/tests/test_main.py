import pytest
from httpx import AsyncClient, ASGITransport


@pytest.mark.asyncio
async def test_health_endpoint(monkeypatch):
    monkeypatch.setenv("CHAIN_ID", "31337")
    monkeypatch.setenv("REGISTRY_ADDRESS", "0x" + "1" * 40)
    monkeypatch.setenv("VOTE_ADDRESS", "0x" + "2" * 40)
    monkeypatch.setenv("RPC_URL", "http://localhost:8545")
    monkeypatch.setenv("DATABASE_URL", "postgresql://localhost/civicsys")
    monkeypatch.setenv("ANTHROPIC_API_KEY", "sk-ant-test")

    from app.main import app

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
        r = await c.get("/agents/health")
    assert r.status_code == 200
    data = r.json()
    assert data["status"] == "ok"
    assert data["chain_id"] == 31337
    assert data["agent"] == "hermes"
