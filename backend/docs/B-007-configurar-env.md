# B-007 · Configurar .env con RPC URL de Syscoin NEVM y Rollux

**id:** B-007
**title:** Configurar .env con RPC URL de Syscoin NEVM y Rollux
**owner:** [Responsable]
**backup:** [Backup/Pair]
**effort:** 5 min
**priority:** P0
**status:** pending
**depends_on:** B-004
**sprint:** 1
**layer:** backend

---

## Por qué importa
Permite separar y proteger las URLs de los nodos blockchain y otras variables sensibles.

## Conceptos clave
- Variables de entorno
- Seguridad

## Pre-requisitos
- dotenv instalado

## Paso a paso
1. Crear archivo .env en la raíz de backend.
2. Agregar variables para RPC URL de Syscoin NEVM y Rollux.

## Verificación / Definition of Done
- Variables accesibles desde process.env.

## Errores comunes
- No agregar .env al .gitignore.

## Lecturas
- https://12factor.net/config

## Notas para revisor
- Confirmar que .env no está en el repo.