"""
Dual-provider LLM client: Anthropic primario, OpenRouter fallback.
Si ambos fallan, devuelve LLMResult(provider="unavailable", confidence=0).
"""

from dataclasses import dataclass
from typing import Literal
import logging
import httpx

logger = logging.getLogger(__name__)

Provider = Literal["anthropic", "openrouter", "unavailable"]


@dataclass
class LLMResult:
    text: str
    provider: Provider
    confidence: int


class LLMClient:
    def __init__(
        self,
        anthropic_key: str | None = None,
        openrouter_key: str | None = None,
        timeout: float = 30.0,
        model_anthropic: str = "claude-sonnet-4-6",
        model_openrouter: str = "anthropic/claude-sonnet-4-6",
    ):
        self.anthropic_key = anthropic_key
        self.openrouter_key = openrouter_key
        self.timeout = timeout
        self.model_anthropic = model_anthropic
        self.model_openrouter = model_openrouter

    async def complete(self, prompt: str, max_tokens: int = 1024) -> LLMResult:
        if self.anthropic_key:
            try:
                return await self._anthropic(prompt, max_tokens)
            except Exception as e:
                logger.warning("anthropic failed: %s", e)
        if self.openrouter_key:
            try:
                return await self._openrouter(prompt, max_tokens)
            except Exception as e:
                logger.warning("openrouter failed: %s", e)
        return LLMResult(
            text="<unavailable: LLM no respondió>",
            provider="unavailable",
            confidence=0,
        )

    async def _anthropic(self, prompt: str, max_tokens: int) -> LLMResult:
        async with httpx.AsyncClient(timeout=self.timeout) as cli:
            r = await cli.post(
                "https://api.anthropic.com/v1/messages",
                headers={
                    "x-api-key": self.anthropic_key or "",
                    "anthropic-version": "2023-06-01",
                    "content-type": "application/json",
                },
                json={
                    "model": self.model_anthropic,
                    "max_tokens": max_tokens,
                    "messages": [{"role": "user", "content": prompt}],
                },
            )
            r.raise_for_status()
            data = r.json()
            text = "".join(b["text"] for b in data["content"] if b["type"] == "text")
            return LLMResult(text=text, provider="anthropic", confidence=8)

    async def _openrouter(self, prompt: str, max_tokens: int) -> LLMResult:
        async with httpx.AsyncClient(timeout=self.timeout) as cli:
            r = await cli.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.openrouter_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": self.model_openrouter,
                    "messages": [{"role": "user", "content": prompt}],
                    "max_tokens": max_tokens,
                },
            )
            r.raise_for_status()
            data = r.json()
            text = data["choices"][0]["message"]["content"]
            return LLMResult(text=text, provider="openrouter", confidence=7)
