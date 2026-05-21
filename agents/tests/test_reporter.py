import pytest
from unittest.mock import AsyncMock
from app.reporter import Reporter, ReportInput
from app.llm import LLMClient, LLMResult


@pytest.mark.asyncio
async def test_render_with_llm_analysis(tmp_path):
    tpl_path = tmp_path / "tpl.md"
    tpl_path.write_text(
        "# {title}\n\nResultados Si={yes} No={no} Abs={abstain}\n\n{llm_analysis}\n\n--{confidence}--",
        encoding="utf-8",
    )

    llm = LLMClient()
    llm.complete = AsyncMock(return_value=LLMResult(text="Resumen", provider="anthropic", confidence=9))

    reporter = Reporter(template_path=str(tpl_path), llm=llm)

    out = await reporter.render(ReportInput(
        proposal_id=1,
        chain_id=31337,
        title="Demo",
        yes=3, no=1, abstain=1,
        tx_hash="0xabc",
        block_number=100,
        explorer_url="http://anvil",
    ))

    assert "# Demo" in out.body_markdown
    assert "Si=3" in out.body_markdown
    assert "Resumen" in out.body_markdown
    assert out.provider == "anthropic"
    assert out.confidence == 9


@pytest.mark.asyncio
async def test_render_handles_unavailable_llm(tmp_path):
    tpl_path = tmp_path / "tpl.md"
    tpl_path.write_text("{llm_analysis}", encoding="utf-8")

    llm = LLMClient()
    llm.complete = AsyncMock(
        return_value=LLMResult(text="<unavailable>", provider="unavailable", confidence=0)
    )

    reporter = Reporter(template_path=str(tpl_path), llm=llm)
    out = await reporter.render(ReportInput(
        proposal_id=1, chain_id=31337, title="T",
        yes=0, no=0, abstain=0, tx_hash=None, block_number=None, explorer_url=None,
    ))
    assert "<unavailable>" in out.body_markdown
    assert out.confidence == 0


@pytest.mark.asyncio
async def test_render_zktanenbaum_chain_name(tmp_path):
    tpl_path = tmp_path / "tpl.md"
    tpl_path.write_text("Red: {network}\n", encoding="utf-8")

    llm = LLMClient()
    llm.complete = AsyncMock(return_value=LLMResult(text="x", provider="anthropic", confidence=5))
    reporter = Reporter(template_path=str(tpl_path), llm=llm)
    out = await reporter.render(ReportInput(
        proposal_id=1, chain_id=57057, title="T",
        yes=1, no=0, abstain=0, tx_hash=None, block_number=None, explorer_url=None,
    ))
    assert "zkTanenbaum" in out.body_markdown
