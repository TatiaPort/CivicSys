# F-018 · Detectar si la red es Rollux/Syscoin y mostrar aviso

**id:** F-018  
**title:** Detectar si la red es Rollux/Syscoin y mostrar aviso  
**owner:** [Responsable]  
**backup:** [Backup/Pair]  
**effort:** 10 min  
**priority:** P1  
**status:** pending  
**depends_on:** F-016  
**sprint:** 1  
**layer:** frontend

---

## Por qué importa
Evita errores de red y guía al usuario a la red correcta.

## Paso a paso
1. Detectar red conectada en ConnectWalletButton o hook.
2. Mostrar aviso si no es Rollux/Syscoin.

## Definition of Done
- Aviso visible si la red no es la esperada.
