# Prompt para Claude Code — Inicialización Sprint 1 de CivicSys / SSC ANTIPEREZA

> Copiar y pegar este prompt a Claude Code estando posicionado en
> `C:\dev\hackathons\blockchain-syscoin-04-2026\CivicSys`.

---

## Contexto del proyecto (lee antes de actuar)

Eres el desarrollador encargado de inicializar el código del Sprint 1 del proyecto **CivicSys / SSC ANTIPEREZA** — un sistema de supervisión ciudadana sobre blockchain Syscoin (edgechain **zkSYS Testnet · zkTanenbaum · Chain ID 57057**) coordinado por un agente maestro llamado **Hermes**.

Estás en el directorio raíz del monorepo. **YA EXISTE** documentación inicial:

- `README.md` raíz · `LICENSE` (MIT) · `.gitignore`
- `agents/hermes/soul/SOUL.md` y `agents/hermes/soul/INSTINCT.md` (públicos)
- `agents/hermes/PLAN.md` y `agents/hermes/VISION.md` (internos)
- `docs/sprints/sprint1.md` — plan ejecutivo del Sprint 1
- `docs/architecture/sprint1-overview.md` — diagrama y flujo end-to-end
- `docs/adr/0001-zkTanenbaum-as-target-chain.md`
- `docs/security/threat-model-sprint1.md`
- `blockchain/README.md` + `blockchain/.env.example`
- `agents/README.md` + `agents/.env.example`

**LÉE ESOS ARCHIVOS PRIMERO**, especialmente `docs/sprints/sprint1.md` y los dos READMEs de subproyecto. La fuente de verdad sobre el alcance del Sprint 1 es ese documento.

## Tu misión

Implementar el **Sprint 1 — Prototipo inicial** de CivicSys siguiendo lo que documenta `docs/sprints/sprint1.md`. El sprint cubre dos subproyectos hermanos, conectados por una API REST y un servidor MCP:

### Subproyecto 1 — `blockchain/`

Smart contracts en Solidity desplegables a **zkSYS Testnet (zkTanenbaum, Chain ID 57057, RPC `https://rpc-zk.tanenbaum.io`, explorer `https://explorer-zk.tanenbaum.io`)**.

Implementar:

1. **`CitizenRegistry.sol`** — registro de ciudadanos con hash `keccak256(dni || normalized_name || PUBLIC_SALT)`. El DNI en claro NUNCA se almacena. Evento `CitizenRegistered(bytes32 indexed id, address indexed wallet, uint64 timestamp)`. Métodos: `register`, `isRegistered`, `getCitizen`.
2. **`Vote.sol`** — propuestas con título, descripción, opciones (string[]), deadline. Métodos: `createProposal`, `castVote`, `tally`, `closeProposal`. Eventos: `ProposalCreated`, `VoteCast`, `ProposalClosed`. Restricciones: solo ciudadanos registrados pueden votar; un ciudadano vota una sola vez por propuesta; no se vota tras `deadline`.
3. **`interfaces/ICitizenRegistry.sol`** y **`interfaces/IVote.sol`**.
4. **Hardhat config** TypeScript con la red `zkTanenbaum` (Chain ID 57057) y red local `hardhat`.
5. **`scripts/deploy.ts`** — despliega ambos contratos, escribe direcciones en `deployments/zkTanenbaum.json` y copia ABIs a `../shared/abis/`.
6. **`scripts/seed-proposals.ts`** — crea 3 propuestas de prueba.
7. **Tests** con Hardhat + Chai:
   - `test/CitizenRegistry.test.ts`
   - `test/Vote.test.ts`
   - `test/e2e.test.ts` (flujo completo en hardhat local)
   - Cobertura objetivo: ≥80%.
8. **Stack:** Solidity 0.8.24, OpenZeppelin Contracts v5 (AccessControl, ReentrancyGuard), hardhat-toolbox, TypeChain, ethers v6.

### Subproyecto 2 — `agents/`

Python 3.11+. Tres componentes que comparten servicios:

#### a) `agents/api/` — FastAPI

Endpoints (ver tabla completa en `agents/README.md`):

- `POST /auth/register` → `services.citizen_hash.citizen_id()` + `services.blockchain_client.register_citizen()`
- `GET /auth/status/{citizen_id}`
- `GET /proposals`, `POST /proposals`, `POST /proposals/{id}/vote`, `GET /proposals/{id}/results`
- `GET /reports/{proposal_id}` (genera vía Hermes si no existe)
- `GET /hermes/status`, `GET /health`

Pydantic v2 para todos los schemas. CORS habilitado. Logging que filtra PII (`dni`, `password`, `secret`, `key`, `mnemonic`). Documentación Swagger en `/docs`.

#### b) `agents/mcp_server/` — servidor MCP (Python `mcp` SDK)

Tools expuestas:
- `register_citizen(dni, full_name)` — protegida, solo en modo dev (flag de entorno).
- `list_proposals()`, `get_proposal(proposal_id)`.
- `cast_vote(proposal_id, option, citizen_id)`.
- `generate_report(proposal_id)`.
- `get_hermes_status()`.

Soporte para `stdio` (default) y `SSE` (configurable). Las tools llaman a los mismos módulos `agents/services/*` que la API — **NO duplicar lógica**.

#### c) `agents/hermes/` — runtime del agente

- `runtime.py` — orquestador.
- `event_listener.py` — listener de eventos `ProposalClosed` con `web3.py` (subscripción WebSocket si está disponible, sino polling con `eth_getLogs`).
- `llm_client.py` — wrapper para el SDK de Anthropic (Claude). `LLM_BASE_URL` opcional para usar OpenRouter o Nous Portal sin reescribir.
- `reporter.py` — construye el prompt cargando `SOUL.md` + `INSTINCT.md` + datos y produce un reporte markdown con `confidence_score`, `tx_hashes`, `timestamp`.
- Persistencia de reportes en `hermes/memory/sessions/proposal_<id>.md` (esta carpeta está gitignored).

#### d) `agents/services/` — código compartido API + MCP + Hermes

- `blockchain_client.py` (web3.py, abstrae llamadas a contratos, lee ABIs de `shared/abis/`).
- `citizen_hash.py` (normalización + hash keccak256). El DNI NUNCA se loguea, almacena ni se incluye en respuestas.
- `hermes_bridge.py` (interfaz limpia para que la API pida reportes a Hermes).

#### e) Tests `agents/tests/`

- Unit: `test_citizen_hash.py`, `test_blockchain_client.py` (con `eth-tester`).
- API: `test_routes.py` con `httpx.AsyncClient`.
- E2E: `test_e2e.py` que arranca hardhat local, despliega contratos, registra ciudadano, vota, cierra propuesta y verifica el reporte. Skipable con `pytest -k "not e2e"` cuando no hay hardhat.

#### Stack Python

`fastapi`, `uvicorn[standard]`, `pydantic>=2`, `httpx`, `web3>=6`, `eth-utils`, `anthropic`, `mcp`, `python-dotenv`, `pytest`, `pytest-asyncio`, `ruff`, `mypy`.

### Conectividad — API ↔ MCP ↔ blockchain

- La API REST es el bus principal para frontend humano.
- El MCP server es el bus para LLM clients (Claude Code, agentes externos).
- Ambos usan **los mismos servicios** en `agents/services/`.
- Hermes corre como subprocesoindependiente que comparte `services/` y publica vía `hermes_bridge`.

## Convenciones que debes respetar

1. **Privacidad por diseño:** DNI nunca persistido, logueado ni devuelto en respuestas. Tests deben verificar esto explícitamente.
2. **Trazabilidad:** todo voto y todo reporte cita `tx_hash` y URL al explorer.
3. **Hermes nunca opina:** los prompts y la lógica deben respetar las constraints de `SOUL.md` e `INSTINCT.md`.
4. **Open source MIT:** sin código copiado con licencia incompatible.
5. **TypeScript estricto** en `blockchain/` (tsconfig `strict: true`).
6. **Type-checked Python**: `mypy --strict` debe pasar en `agents/services/` (al menos).
7. **Sin secretos en el repo**: usa `.env.example`. Si necesitas valores, déjalos en `0x000...` y dile al usuario qué llenar.

## Orden sugerido de implementación

1. Leer `docs/sprints/sprint1.md`, `agents/README.md`, `blockchain/README.md` y los SOUL/INSTINCT.
2. Crear el plan con TodoWrite (split por subproyecto, granularidad media).
3. **blockchain/** primero (los ABIs son input para agents/):
   1. `package.json` + `hardhat.config.ts` + `tsconfig.json` con red zkTanenbaum.
   2. Contratos en `contracts/` + `interfaces/`.
   3. Tests unitarios.
   4. Scripts de deploy y seed.
   5. `pnpm hardhat compile` o `npx hardhat compile` debe pasar.
   6. `npx hardhat test` debe pasar con cobertura ≥80%.
4. **shared/abis/** — copiar ABIs generados (puede hacerlo el deploy script).
5. **agents/** después:
   1. `pyproject.toml` + `requirements.txt` + estructura de paquetes con `__init__.py`.
   2. `services/citizen_hash.py` (con tests primero — TDD).
   3. `services/blockchain_client.py` (lee ABIs de `shared/abis/`).
   4. `api/main.py` + routes + models Pydantic.
   5. `hermes/llm_client.py` + `hermes/reporter.py`.
   6. `hermes/event_listener.py` + `hermes/runtime.py`.
   7. `mcp_server/server.py` + tools.
   8. Tests `pytest -v` debe pasar.
6. **Smoke test E2E manual** documentado en `docs/sprints/sprint1.md` sección 8.
7. Actualizar `agents/hermes/PLAN.md` moviendo entregables completados a `## Done`.

## Lo que NO debes hacer en Sprint 1

- ❌ No implementes subagentes (jurídico, anticorrupción…) — Sprint 2.
- ❌ No implementes frontend Next.js — separado, fuera del scope.
- ❌ No configures WireGuard ni Docker — Sprint 2/3.
- ❌ No uses Supabase — SQLite local es suficiente (o memoria + filesystem).
- ❌ No introduzcas ZK proofs reales — Sprint 2+.
- ❌ No agregues dependencias innecesarias. Si dudas, pregunta.

## Verificación al cierre

Antes de declarar Sprint 1 listo, ejecuta y comparte el resultado de:

```bash
# blockchain
cd blockchain && npm run compile && npm test && npm run coverage

# agents
cd ../agents && ruff check . && pytest -v
```

Luego abre un PR (o commitea en `main`) con un resumen tipo:

```
Sprint 1 · prototipo inicial

- ✅ CitizenRegistry.sol + Vote.sol con tests (cobertura X%)
- ✅ Deploy script para zkTanenbaum (Chain ID 57057)
- ✅ FastAPI con endpoints de auth, proposals, votes, reports
- ✅ MCP server con N tools (stdio + SSE)
- ✅ Hermes runtime: listener + reporter + memoria
- ✅ Tests E2E pasan
- Pendiente: deploy real a zkTanenbaum (esperando faucet TSYS)
```

## Si te quedas atascado

- **Faucet TSYS no responde** → marca como blocker en `PLAN.md`, deja los contratos compilables y los tests pasando en hardhat local. Documenta el bloqueo.
- **`mcp` SDK incompatible** → versionado actual: usa `mcp>=1.0`. Si hay un breaking change, escala al usuario.
- **`web3.py` async** → si causa problemas, fallback a `web3.py` sync envuelto en `asyncio.to_thread`.
- **ABIs no se copian a `shared/`** → escribe un script `scripts/sync-abis.ts` y agrégalo al `postdeploy`.

---

**Empieza ahora.** Lee primero `docs/sprints/sprint1.md` y los READMEs de subproyecto, planifica con TodoWrite, y reporta progreso conforme avances.
