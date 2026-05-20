# B-011 · Crear cliente viem para Rollux L2 en /lib/rolluxClient.ts

**id:** B-011
**title:** Crear cliente viem para Rollux L2 en /lib/rolluxClient.ts
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
Permite interactuar con la blockchain Rollux L2 desde el backend.

## Conceptos clave
- viem
- Rollux L2

## Pre-requisitos
- viem instalado
- .env configurado

## Paso a paso
1. Crear archivo /lib/rolluxClient.ts.
2. Configurar cliente viem usando la URL de Rollux del .env.

## Verificación / Definition of Done
- Cliente funcional y exportado para uso en servicios.

## Errores comunes
- No leer la URL desde process.env.

## Lecturas
- https://viem.sh/docs/clients/

## Notas para revisor
- Confirmar que el cliente conecta correctamente a Rollux.