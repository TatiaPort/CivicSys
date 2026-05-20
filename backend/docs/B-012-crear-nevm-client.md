# B-012 · Crear cliente viem para Syscoin NEVM L1 en /lib/nevmClient.ts

**id:** B-012
**title:** Crear cliente viem para Syscoin NEVM L1 en /lib/nevmClient.ts
**owner:** [Responsable]
**backup:** [Backup/Pair]
**effort:** 15 min
**priority:** P0
**status:** pending
**depends_on:** B-003, B-007
**sprint:** 1
**layer:** backend

---

## Por qué importa
Permite interactuar con la blockchain Syscoin NEVM L1 desde el backend.

## Conceptos clave
- viem
- Syscoin NEVM L1

## Pre-requisitos
- viem instalado
- .env configurado

## Paso a paso
1. Crear archivo /lib/nevmClient.ts.
2. Configurar cliente viem usando la URL de NEVM del .env.

## Verificación / Definition of Done
- Cliente funcional y exportado para uso en servicios.

## Errores comunes
- No leer la URL desde process.env.

## Lecturas
- https://viem.sh/docs/clients/

## Notas para revisor
- Confirmar que el cliente conecta correctamente a NEVM.