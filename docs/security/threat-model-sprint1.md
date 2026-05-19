# Threat Model — Sprint 1

> Modelo de amenazas STRIDE simplificado para el alcance del Sprint 1.
> Owner: Tatiana Portillo (Documentación & Cyber-seguridad).

## Activos a proteger

1. **DNI ciudadano** — PII fuerte. NUNCA persistir en claro.
2. **Cuenta firmante de la API** (`SIGNER_PRIVATE_KEY`) — compromete todas las txs.
3. **Integridad del tally** — manipulación del resultado on-chain.
4. **Memoria de Hermes** — alteración de reportes.

## Amenazas Sprint 1

| ID  | Categoría       | Amenaza                                            | Severidad | Mitigación                                          |
|-----|-----------------|----------------------------------------------------|-----------|-----------------------------------------------------|
| T1  | Spoofing        | Bot envía millones de registros con DNIs random   | Alta      | Rate-limit en API + atestación ligera (Sprint 2 ZK) |
| T2  | Tampering       | API logueada con DNI en claro                      | Crítica   | Filtros de logging + tests que verifican no-PII      |
| T3  | Repudiation     | Ciudadano niega haber votado                       | Media     | tx-hash on-chain + evento `VoteCast` con `citizenId` |
| T4  | Info disclosure | Rainbow table sobre `keccak256(dni \|\| name \|\| salt)` | Alta      | Documentar limitación · ZK en Sprint 2              |
| T5  | DoS             | Spam de propuestas vacía la cuenta firmante de gas | Media     | Solo curadores autorizados crean propuestas         |
| T6  | EoP             | Atacante consigue `SIGNER_PRIVATE_KEY`             | Crítica   | .env fuera del repo · rotación · audit log          |
| T7  | Tampering       | LLM alucina y publica reporte falso                | Alta      | Reporter cita SIEMPRE tx-hash · revisión humana día 1|
| T8  | Replay          | Mismo voto reenviado en otra propuesta             | Media     | Contrato usa `mapping(proposalId => mapping(citizenId => option))` |

## Decisiones de seguridad para Sprint 1

1. `.env` y `.env.*` están en `.gitignore` desde día 0.
2. Pre-commit hook con `gitleaks` recomendado.
3. Logs de API filtran cualquier campo llamado `dni`, `password`, `secret`, `key`, `mnemonic`.
4. Cuenta firmante usa una wallet exclusiva de testnet sin fondos mainnet.
5. Tests verifican que `register_citizen` no escribe `dni` en disco ni en respuesta.
