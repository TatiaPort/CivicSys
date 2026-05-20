# agents/ — Hermes Master + API + MCP

Componente de agentes IA, API REST y servidor MCP del proyecto CivicSys / SSC ANTIPEREZA.

## Componentes

```
agents/
├── hermes/              # Agente maestro
│   ├── soul/
│   │   ├── SOUL.md      # Identidad y mission (PÚBLICO)
│   │   └── INSTINCT.md  # Reflejos por defecto (PÚBLICO)
│   ├── memory/          # Memoria persistente (sessions/ gitignored)
│   ├── skills/          # Skills generadas autónomamente (Sprint 2+)
│   ├── PLAN.md          # Sprint actual (INTERNO)
│   ├── VISION.md        # North star (INTERNO)
│   ├── runtime.py       # Loop principal del agente
│   ├── llm_client.py    # Wrapper para Claude / OpenRouter / Nous
│   ├── event_listener.py# Listener de eventos on-chain
│   └── reporter.py      # Generador de reportes
│
├── subagents/           # Subagentes (Sprint 2+: jurídico, anticorrupción…)
│
├── mcp_server/          # Servidor MCP (Model Context Protocol)
│   ├── server.py        # entrypoint
│   ├── tools/           # cada tool en su archivo
│   │   ├── register_citizen.py
│   │   ├── list_proposals.py
│   │   ├── cast_vote.py
│   │   └── generate_report.py
│   └── transports.py    # stdio + SSE
│
├── api/                 # FastAPI
│   ├── main.py
│   ├── routes/
│   │   ├── auth.py
│   │   ├── proposals.py
│   │   ├── votes.py
│   │   └── reports.py
│   ├── services/
│   │   ├── blockchain_client.py
│   │   ├── hermes_bridge.py
│   │   └── citizen_hash.py
│   └── models/          # Pydantic v2 schemas
│
├── requirements.txt
├── pyproject.toml
└── .env.example
```

## Stack

- **Python** 3.11+
- **FastAPI** + **Uvicorn**
- **Pydantic v2** + **httpx**
- **web3.py** (cliente blockchain Python)
- **mcp** (Python MCP SDK)
- **anthropic** (Claude SDK) — compatible con OpenRouter mediante base_url
- **pytest** + **pytest-asyncio**
- **ruff** (lint) + **mypy** (types)

## API REST — Sprint 1

| Método | Ruta                          | Descripción                                  |
|--------|-------------------------------|----------------------------------------------|
| POST   | `/auth/register`              | Registra ciudadano (DNI+nombre) on-chain     |
| GET    | `/auth/status/{citizen_id}`   | Verifica si un hash está registrado          |
| GET    | `/proposals`                  | Lista propuestas activas                     |
| POST   | `/proposals`                  | Crea una nueva propuesta (admin/curador)     |
| POST   | `/proposals/{id}/vote`        | Emite voto                                   |
| GET    | `/proposals/{id}/results`     | Resultado actual on-chain                    |
| GET    | `/reports/{proposal_id}`      | Reporte Hermes (genera si no existe)         |
| GET    | `/hermes/status`              | Estado del agente (memoria, last_event…)     |
| GET    | `/health`                     | Healthcheck (RPC + LLM + DB)                 |

Documentación interactiva: `http://localhost:8000/docs` (Swagger autogenerado).

## MCP server — Sprint 1

Expone las siguientes **tools** vía Model Context Protocol:

| Tool                  | Args                                          | Returns                          |
|-----------------------|-----------------------------------------------|----------------------------------|
| `register_citizen`    | `dni: str`, `full_name: str`                  | `{citizen_id, tx_hash}`          |
| `list_proposals`      | (none)                                        | `Proposal[]`                     |
| `get_proposal`        | `proposal_id: int`                            | `Proposal`                       |
| `cast_vote`           | `proposal_id: int`, `option: int`, `citizen_id: str` | `{tx_hash}`               |
| `generate_report`     | `proposal_id: int`                            | `Report (markdown + metadata)`   |
| `get_hermes_status`   | (none)                                        | `{soul_loaded, last_event, ...}` |

**Transports soportados:**
- `stdio` — para integración con Claude Code y otros clientes MCP locales.
- `SSE` — para acceso desde frontend Next.js o herramientas web.

## Hermes runtime

Loop básico (Sprint 1):

```python
# hermes/runtime.py (pseudo)
async def run():
    soul = load_md("hermes/soul/SOUL.md")
    instinct = load_md("hermes/soul/INSTINCT.md")

    async for event in event_listener.subscribe(["ProposalClosed"]):
        proposal = await blockchain.get_proposal(event.proposal_id)
        tally = await blockchain.tally(event.proposal_id)

        report = await reporter.generate(
            soul=soul,
            instinct=instinct,
            proposal=proposal,
            tally=tally,
        )

        memory.persist(report)
        await api_bridge.publish(report)
```

## Citizen hashing (Sprint 1)

```python
# services/citizen_hash.py
import hashlib

def normalize_name(name: str) -> str:
    """Upper, sin tildes, sin espacios dobles."""
    import unicodedata
    nfkd = unicodedata.normalize("NFKD", name)
    no_acc = "".join(c for c in nfkd if not unicodedata.combining(c))
    return " ".join(no_acc.upper().split())

def citizen_id(dni: str, full_name: str, public_salt: str) -> bytes:
    """keccak256(dni || normalized_name || public_salt). DNI nunca se persiste."""
    from eth_utils import keccak
    payload = f"{dni}|{normalize_name(full_name)}|{public_salt}".encode()
    return keccak(payload)
```

## Quick start

```bash
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env

# Levantar API
uvicorn api.main:app --reload --port 8000

# Levantar MCP server (otra terminal)
python -m mcp_server.server

# Tests
pytest -v
```

## Variables de entorno (`.env`)

```dotenv
# Blockchain
RPC_URL=https://rpc-zk.tanenbaum.io
CHAIN_ID=57057
CITIZEN_REGISTRY_ADDRESS=0x...
VOTE_CONTRACT_ADDRESS=0x...
SIGNER_PRIVATE_KEY=0x...           # cuenta API que firma txs (testnet)
PUBLIC_SALT=ssc-antipereza-2026-publico

# LLM (Hermes)
ANTHROPIC_API_KEY=sk-ant-...
LLM_MODEL=claude-sonnet-4-6
LLM_BASE_URL=                       # vacío = Anthropic directo; o OpenRouter

# API
API_HOST=0.0.0.0
API_PORT=8000
CORS_ORIGINS=http://localhost:3000

# MCP
MCP_TRANSPORT=stdio                 # stdio | sse
MCP_PORT=8765                       # solo si SSE
```

## Integración con Claude Code

Tras levantar el MCP server, registrarlo en Claude Code (`~/.claude.json` o vía CLI):

```bash
claude mcp add civicsys --transport stdio --command "python -m mcp_server.server" --cwd /ruta/a/CivicSys/agents
```

Luego, Claude Code puede invocar las tools directamente, por ejemplo:

> "Lista las propuestas activas y genera un reporte para la propuesta 1."
