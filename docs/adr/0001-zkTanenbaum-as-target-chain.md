# ADR 0001 — zkSYS Testnet (zkTanenbaum) como red objetivo

- **Status:** Accepted
- **Date:** 2026-05-19
- **Deciders:** Equipo SSC ANTIPEREZA (Orlando, Sandro, Tatiana)

## Contexto

Necesitamos una red EVM-compatible donde firmar los votos ciudadanos del MVP del hackathon. Las opciones evaluadas fueron:

- Syscoin NEVM mainnet/testnet
- Ethereum Sepolia
- Polygon zkEVM testnet
- **zkSYS Testnet (zkTanenbaum, Chain ID 57057)**

## Decisión

Adoptamos **zkSYS Testnet (zkTanenbaum, Chain ID 57057)** como red objetivo del proyecto.

## Consecuencias

### Positivas

- Anclaje en Bitcoin vía Syscoin L1 (merge-mined).
- zkProofs nativos disponibles para iteraciones futuras (privacidad de voto).
- Costos por tx 10–100× menores que NEVM.
- Finality más rápida — apto para votaciones masivas.
- Sentry Nodes con IA: validación eficiente.
- Edgechain permissionless: opción de forkear nuestra propia chain SSCA si escala.
- Cumple el requisito del hackathon (proyecto sobre stack Syscoin).

### Negativas / riesgos

- Tooling Hardhat/Foundry específico de zkStack en maduración.
- Faucet de TSYS puede ser cuellos de botella.
- Verificación de contratos en explorer puede requerir contacto con la foundation.

## Mitigaciones

- Mantener una capa de abstracción en `services/blockchain_client.py` que permita fallback a Sepolia/local hardhat para testing.
- Solicitar TSYS al canal del hackathon con anticipación.
- Configurar RPC fallback (Zeeve).
