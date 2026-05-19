# Arquitectura Sprint 1 — diagrama lógico

```
┌──────────────────────────────────────────────────────────────────────┐
│                          CIUDADANO / CLIENTE                          │
│              (curl, Postman, futuro frontend Next.js, Claude Code)    │
└────────────────────┬────────────────────────────┬─────────────────────┘
                     │                            │
                     │ HTTP REST                  │ MCP (stdio/SSE)
                     ▼                            ▼
        ┌───────────────────────┐    ┌──────────────────────────┐
        │   FastAPI (puerto 8000)│    │  MCP Server (8765/stdio)│
        │   agents/api/          │    │  agents/mcp_server/      │
        └────────┬───────────────┘    └────────────┬─────────────┘
                 │                                 │
                 │   ambos consumen los mismos servicios
                 │                                 │
                 ▼                                 ▼
         ┌──────────────────────────────────────────────┐
         │           Hermes Runtime                      │
         │   - load SOUL.md + INSTINCT.md                │
         │   - event_listener (logs on-chain)            │
         │   - reporter (LLM → markdown firmado)         │
         │   - memory persistente (JSON+MD)              │
         └────────┬─────────────────┬──────────────────┬─┘
                  │                 │                  │
                  ▼                 ▼                  ▼
        ┌──────────────────┐  ┌────────────┐  ┌──────────────────┐
        │ Blockchain client│  │   LLM       │  │ Filesystem      │
        │ (web3.py / ethers)│  │ (Claude/    │  │ memory/sessions/│
        └────────┬─────────┘  │  OpenRouter)│  └──────────────────┘
                 │            └─────────────┘
                 │
                 ▼
        ┌────────────────────────────────┐
        │   zkSYS Testnet (zkTanenbaum)  │
        │   Chain ID 57057               │
        │   - CitizenRegistry.sol        │
        │   - Vote.sol                   │
        │   RPC: rpc-zk.tanenbaum.io     │
        └────────────────────────────────┘
```

## Flujo end-to-end Sprint 1

```
[1] POST /auth/register {dni, full_name}
        ├─ normalize_name(full_name)
        ├─ citizen_id = keccak256(dni||normalized||PUBLIC_SALT)
        ├─ tx = CitizenRegistry.register(citizen_id, normalized)
        └─ return {citizen_id, tx_hash}     [DNI nunca persistido]

[2] POST /proposals {title, description, options[], deadline}
        └─ tx = Vote.createProposal(...) → ProposalCreated event

[3] POST /proposals/{id}/vote {option, citizen_id}
        ├─ verify CitizenRegistry.isRegistered(citizen_id)
        └─ tx = Vote.castVote(id, option, citizen_id) → VoteCast event

[4] (cron o admin) Vote.closeProposal(id) → ProposalClosed event

[5] Hermes event_listener detecta ProposalClosed
        ├─ tally = Vote.tally(id)
        ├─ proposal = Vote.getProposal(id)
        ├─ prompt = SOUL + INSTINCT + {proposal, tally}
        ├─ report = LLM(prompt)
        ├─ persist en memory/sessions/proposal_<id>.md
        └─ publish vía API

[6] GET /reports/{id} → markdown del reporte + metadatos
```

## Decisiones clave

- **DNI nunca on-chain**: solo el hash `keccak256(dni || normalized_name || PUBLIC_SALT)`.
- **`PUBLIC_SALT`** versionado: visible en el repo. Hacer rainbow tables sobre 10^8 combinaciones (DNI peruano) es trivial, por eso el hash NO es protección contra ataques offline si el atacante conoce el nombre. La privacidad real viene en Sprint 2+ con ZK proofs / pedersen commitments.
- **Cuenta firmante** (`SIGNER_PRIVATE_KEY`): la API firma todas las txs en nombre del ciudadano en Sprint 1 (modelo custodial). Sprint 2+ permitirá wallets self-custody.
- **MCP y API duplican la lógica de servicios**: ambos llaman a los mismos módulos en `services/`. No reimplementar.
