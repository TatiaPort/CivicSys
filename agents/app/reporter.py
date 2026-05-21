"""Reporter: rellena un template Markdown con datos on-chain + análisis LLM."""

from dataclasses import dataclass
from datetime import datetime, timezone
from app.llm import LLMClient


@dataclass
class ReportInput:
    proposal_id: int
    chain_id: int
    title: str
    yes: int
    no: int
    abstain: int
    tx_hash: str | None
    block_number: int | None
    explorer_url: str | None


@dataclass
class ReportOutput:
    body_markdown: str
    provider: str
    confidence: int


CHAIN_NAMES = {31337: "Anvil local", 57057: "zkTanenbaum"}


class Reporter:
    def __init__(self, template_path: str, llm: LLMClient):
        self.template_path = template_path
        self.llm = llm

    async def render(self, input: ReportInput) -> ReportOutput:
        total = input.yes + input.no + input.abstain
        prompt = self._build_prompt(input, total)
        llm_result = await self.llm.complete(prompt)
        with open(self.template_path, "r", encoding="utf-8") as f:
            tpl = f.read()

        body = tpl.format(
            title=input.title,
            timestamp=datetime.now(tz=timezone.utc).isoformat(),
            proposal_id=input.proposal_id,
            chain_id=input.chain_id,
            network=CHAIN_NAMES.get(input.chain_id, "unknown"),
            total_votes=total,
            yes=input.yes,
            no=input.no,
            abstain=input.abstain,
            llm_analysis=llm_result.text,
            tx_hash=input.tx_hash or "n/a",
            block_number=input.block_number or "n/a",
            explorer_url=input.explorer_url or "n/a (red local)",
            confidence=llm_result.confidence,
        )
        return ReportOutput(
            body_markdown=body,
            provider=llm_result.provider,
            confidence=llm_result.confidence,
        )

    def _build_prompt(self, input: ReportInput, total: int) -> str:
        return (
            f"Eres Hermes, agente maestro del SSC ANTIPEREZA. Analiza brevemente "
            f"(<=200 palabras) los resultados de la siguiente votacion ciudadana "
            f"consultiva. NO inventes datos. Indica nivel de confianza si lo tenes.\n\n"
            f"Propuesta: {input.title}\n"
            f"Total votos: {total}\n"
            f"Si: {input.yes} - No: {input.no} - Abstencion: {input.abstain}\n"
            f"Red: chain_id={input.chain_id}\n"
        )
