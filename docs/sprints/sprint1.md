# Sprint 1 — Prototipo inicial · CivicSys / SSC ANTIPEREZA

> **Ventana:** Día 4 – Día 7 del hackathon (4 días efectivos)
> **Goal:** Demo end-to-end mínimo demostrable a jurado y mentores.

---

## 1. Objetivo del sprint

> Un ciudadano se registra con DNI + nombre completo, emite un voto sobre una propuesta de prueba en **zkTanenbaum (Chain ID 57057)**, y **Hermes** genera automáticamente un reporte trazable del resultado.

Todo conectado vía **API REST** (FastAPI) y **MCP** (Model Context Protocol).

## 2. Alcance — lo que SÍ entra en Sprint 1

### 2.1 Autenticación ciudadana (texto plano controlado)

- Entrada: `dni` (8 dígitos numéricos, formato peruano) + `full_name` (string, 5–120 chars, normalizado a UPPER/sin tildes).
- Procesamiento:
  1. Validación local de formato (regex + longitud).
  2. Cálculo de `citizen_id = keccak256(dni || full_name_normalized || PUBLIC_SALT)`.
  3. Llamada al contrato `CitizenRegistry.register(citizen_id, full_name_normalized)`.
  4. Almacenamiento on-chain solo del hash + nombre normalizado.
- **El DNI NUNCA se persiste**: ni en DB, ni en logs, ni en memoria de Hermes.
- Salida: `tx_hash` confirmado + dirección de wallet asociada al ciudadano (one-shot).

### 2.2 Sistema de votación blockchain (Syscoin → zkTanenbaum)

Contratos en `blockchain/contracts/`:

- **`CitizenRegistry.sol`**: registro de ciudadanos con hash DNI. Eventos: `CitizenRegistered(bytes32 citizenId, string normalizedName, uint256 timestamp)`.
- **`Vote.sol`**: propuestas + opciones + voto + tally. Eventos: `ProposalCreated`, `VoteCast`, `ProposalClosed`.
- **`BallotFactory.sol`** (opcional Sprint 1, definitivo Sprint 2): factory para crear nuevas votaciones sin redeploy.

Red:

```
Network:   zkSYS Testnet (zkTanenbaum)
Chain ID:  57057
RPC:       https://rpc-zk.tanenbaum.io
Explorer:  https://explorer-zk.tanenbaum.io
Symbol:    TSYS
```

### 2.3 Agente Hermes básico

- Listener de eventos `ProposalClosed` vía `eth_getLogs` / WebSocket.
- Cuando se cierra una votación:
  1. Lee el resultado on-chain (método `tally(proposalId)`).
  2. Recupera metadatos de la propuesta.
  3. Llama al LLM (Claude vía Anthropic SDK, configurable a OpenRouter/Nous) con un prompt estructurado que incluye SOUL + INSTINCT + datos.
  4. Genera un reporte en markdown con: resumen, distribución, score de confianza (0–1), tx-hashes citados.
  5. Lo persiste en `agents/hermes/memory/sessions/` y lo publica vía API.

### 2.4 API REST (FastAPI)

Endpoints mínimos (`agents/api/routes/`):

| Método | Ruta                          | Descripción                                  |
|--------|-------------------------------|----------------------------------------------|
| POST   | `/auth/register`              | Registra ciudadano (DNI+nombre) on-chain     |
| GET    | `/auth/status/{citizen_id}`   | Verifica si un hash está registrado          |
| GET    | `/proposals`                  | Lista propuestas activas                     |
| POST   | `/proposals`                  | Crea una nueva propuesta (admin/curador)     |
| POST   | `/proposals/{id}/vote`        | Emite voto                                    |
| GET    | `/proposals/{id}/results`     | Resultado actual on-chain                    |
| GET    | `/reports/{proposal_id}`      | Reporte de Hermes (genera si no existe)     |
| GET    | `/health`                     | Healthcheck (RPC + LLM + DB)                 |

### 2.5 Servidor MCP

`agents/mcp_server/` expone las siguientes **tools** vía Model Context Protocol (stdio + SSE):

- `register_citizen(dni: str, full_name: str) -> {citizen_id, tx_hash}` (PROTEGIDA, solo en entornos de dev).
- `list_proposals() -> Proposal[]`
- `get_proposal(proposal_id: int) -> Proposal`
- `cast_vote(proposal_id: int, option: int, citizen_id: str) -> {tx_hash}`
- `generate_report(proposal_id: int) -> Report`
- `get_hermes_status() -> {soul_loaded, last_event, memory_size}`

El servidor MCP permite que **Claude Code** u otros LLM clients operen sobre el sistema de forma agéntica durante desarrollo y demo.

## 3. Fuera de alcance (Sprint 2+)

- Subagentes jurídico, anticorrupción, ético, verificador, social, ambiental.
- Dashboard Next.js de transparencia.
- Bot Telegram / Discord / WhatsApp.
- Bias Observatory.
- WireGuard mesh + VPS endurecido en producción.
- Supabase (Postgres + pgvector) — Sprint 1 usa SQLite local.
- Cloudflare Tunnel + WAF.
- ZK proofs nativos (los emitimos como tx-hash convencional en Sprint 1).

## 4. Definition of Done

1. ✅ Un test E2E completo pasa: register → propose → vote → close → report.
2. ✅ Contratos verificados en `explorer-zk.tanenbaum.io` con código fuente público.
3. ✅ ≥80% cobertura en tests unitarios de contratos.
4. ✅ ≥3 endpoints API testeados con pytest + httpx.
5. ✅ MCP server arranca y responde a `list_tools` correctamente.
6. ✅ README en `blockchain/` y `agents/` con quick start ejecutable.
7. ✅ `SOUL.md`, `INSTINCT.md`, `PLAN.md`, `VISION.md` versionados.
8. ✅ Sin claves privadas, DNI ni PII en el repo (verificado por `git-secrets` o `trufflehog`).

## 5. Repartición sugerida del equipo

| Persona            | Foco Sprint 1                                              |
|--------------------|------------------------------------------------------------|
| Orlando            | Smart contracts + deploy zkTanenbaum + Hardhat config      |
| Sandro             | API FastAPI + Hermes runtime + MCP server                  |
| Gabriel            | Tests unitarios + E2E + smoke tests                        |
| Tatiana            | Docs técnicos + threat model inicial + revisión .gitignore |
| Eduardo / Mario    | Demo script + storytelling + apoyo a comunicación          |
| Grecia             | Microcontenido de avance del sprint (X / IG)               |

## 6. Riesgos y mitigación

| Riesgo                                       | Mitigación                                              |
|----------------------------------------------|---------------------------------------------------------|
| Faucet de TSYS lento o cuota                 | Solicitar a Syscoin Foundation con anticipación         |
| RPC inestable                                | Configurar fallback (Zeeve) + retry con backoff         |
| Hash DNI legal/privacidad                    | Confirmar con Miguel Aikip antes del demo público       |
| LLM cost (Claude) durante demo               | Cache de reportes + modo offline con fixtures           |
| Colisión `keccak256(dni+nombre+salt)`        | Probabilidad despreciable (2^-256) pero documentada     |

## 7. Comandos rápidos

```bash
# Setup blockchain
cd blockchain
npm install
cp .env.example .env   # llenar DEPLOYER_PRIVATE_KEY (cuenta testnet)
npx hardhat compile
npx hardhat test
npx hardhat run scripts/deploy.ts --network zkTanenbaum

# Setup agentes
cd ../agents
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env        # llenar ANTHROPIC_API_KEY y RPC_URL
uvicorn api.main:app --reload --port 8000

# Setup MCP (separado, otra terminal)
python -m mcp_server.server

# Demo E2E
pytest tests/e2e -v
```

## 8. Demo script (Día 7)

1. `curl POST /auth/register` con DNI ficticio "12345678" + "JUAN PEREZ".
2. Mostrar tx-hash en explorer.
3. `curl POST /proposals` con propuesta de ejemplo.
4. `curl POST /proposals/1/vote` con opción 0.
5. Forzar cierre (admin) o esperar deadline.
6. `curl GET /reports/1` → mostrar el reporte generado por Hermes.
7. Bonus: ejecutar el flujo desde Claude Code consumiendo MCP server.
