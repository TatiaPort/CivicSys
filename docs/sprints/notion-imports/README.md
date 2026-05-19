# Notion imports — Sprint 1

CSVs listos para importar a Notion como sub-bases dentro de las épicas existentes.

## Archivos

| CSV | Filas | Destino sugerido |
|-----|-------|------------------|
| `sprint1-blockchain-tasks.csv` | 22 | Sub-página de **"Implementar Blockchain"** |
| `sprint1-agents-tasks.csv` | 40 | Sub-página de **"Implementar Agente Hermes"** |
| `sprint1-all-tasks.csv` | 62 | Alternativa única — incluye columna `Capa` |

## Columnas

| Columna | Tipo en Notion recomendado |
|---------|----------------------------|
| ID | Texto (Title o Text) |
| Tarea | Title de la página |
| Owner | Select |
| Backup | Texto |
| Esfuerzo | Texto |
| Prioridad | Select (P0/P1/P2) |
| Capa | Select (solo en `sprint1-all-tasks.csv`) |

## Cómo importar (recomendado: una sub-base por épica)

### Opción A — Sub-base inline dentro de cada épica (recomendado)

1. En Notion abre **"Implementar Blockchain"** (en "Sin empezar").
2. Dentro del cuerpo de la página, escribe `/` → busca **"Importar"** → elige **CSV**.
3. Selecciona `sprint1-blockchain-tasks.csv`.
4. Notion crea una base inline con las 22 filas. La primera columna `ID` la puedes mover a la posición del Title (clic derecho en el header → "Move left").
5. Cambia los tipos: Owner → Select, Prioridad → Select. Las demás puede dejarlas como Texto.
6. Repite con **"Implementar Agente Hermes"** y `sprint1-agents-tasks.csv` (40 filas).

### Opción B — Importar una vez en una base nueva

1. En la página padre (cualquiera) escribe `/import` → CSV.
2. Selecciona `sprint1-all-tasks.csv` (62 filas con columna `Capa`).
3. Notion crea una base con todas las tareas. Filtra por `Capa = blockchain` o `Capa = agents` con vistas separadas.

### Opción C — Importar a la base existente "Nueva base de datos"

Esto NO se recomienda porque mezclaría épicas con tareas atómicas y haría el Kanban actual ilegible. Solo si lo prefieres así:

1. Abre la base existente.
2. Click en el botón `...` (arriba a la derecha) → **Merge with CSV**.
3. Selecciona el CSV. Mapea las columnas.

> Nota: Notion "Merge with CSV" requiere una columna única para matching. Como las tareas no existen aún, se crearán todas como filas nuevas.

## Después del import

- Cambia los tipos de columna: Owner → **Seleccionar**, Prioridad → **Seleccionar**.
- (Opcional) Agrega columna **Estado** tipo Estado/Status con las mismas opciones que la base padre (Sin empezar / En curso / Listo).
- (Opcional) Conecta cada fila al archivo markdown del repo añadiendo una columna **URL** apuntando al path local: `file:///C:/dev/hackathons/blockchain-syscoin-04-2026/CivicSys/blockchain/docs/B-001-setup-hardhat-typescript.md`.

## Re-generación

Si actualizas el front matter de algún `A-XXX.md` o `B-XXX.md`, re-genera los CSVs con:

```bash
cd CivicSys
python docs/sprints/notion-imports/regenerate.py   # script opcional
```
