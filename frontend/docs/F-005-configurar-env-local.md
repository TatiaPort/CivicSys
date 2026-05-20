# F-005 · Configurar variables de entorno (.env.local)

**id:** F-005  
**title:** Configurar variables de entorno (.env.local) con RPC URL  
**owner:** [Responsable]  
**backup:** [Backup/Pair]  
**effort:** 10 min  
**priority:** P0  
**status:** pending  
**depends_on:** F-001  
**sprint:** 1  
**layer:** frontend

---

## Por qué importa
Permite separar datos sensibles y de entorno, como la URL RPC de Syscoin/Rollux.

## Paso a paso
1. Crear archivo .env.local en la raíz del frontend.
2. Agregar la variable NEXT_PUBLIC_RPC_URL con la URL correspondiente.

## Definition of Done
- .env.local creado y leído por Next.js.
