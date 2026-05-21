"""Pydantic settings cargado del entorno + .env."""

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # Chain
    chain_id: int = 31337
    registry_address: str
    vote_address: str
    rpc_url: str

    # Database
    database_url: str

    # LLM
    anthropic_api_key: str
    openrouter_api_key: str | None = None
    llm_model_anthropic: str = "claude-sonnet-4-6"
    llm_timeout_seconds: int = 30

    # API
    api_host: str = "0.0.0.0"
    api_port: int = 8000

    # Hermes
    hermes_template_path: str = "hermes/templates/reporte_voto.md"
    embedding_dim: int = 384

    @field_validator("chain_id")
    @classmethod
    def chain_id_supported(cls, v: int) -> int:
        if v not in (31337, 57057):
            raise ValueError(f"chain_id {v} unsupported (debe ser 31337 o 57057)")
        return v


def get_settings() -> Settings:
    return Settings()  # type: ignore[call-arg]
