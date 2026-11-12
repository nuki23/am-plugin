---
description: Genera el reporte resumen de avance para la sesión de seguimiento (por defecto, últimos 7 días)
argument-hint: [desde AAAA-MM-DD]
---

# /am:summary

Argumento: `$ARGUMENTS` (fecha de inicio opcional; por defecto, los últimos 7 días).

Genera el resumen para la sesión de seguimiento y calibración. No consultes ni
modifiques OutSystems: trabaja solo con `reports/` (sin `reports/_archive/`). No
modifiques `_progress.md`.

Nunca copies a un `.md`, a un PDF ni al chat el valor de un secreto, credencial, token o
dato personal; solo el nombre y la ruta del elemento. Si un documento de origen lo
contiene, omítelo en el resumen y avisa. El resumen se entrega: no incluye los ID
internos; identifica cada hallazgo por Module, Object Name y Pattern.

## Referencia rápida

Este bloque es idéntico en close, redo, fix, clean, status y summary; la referencia
completa es `/am:review`.

- **`reports/_progress.md`** tiene dos tablas:
  - `Prefixes`: `Prefix | Pattern Name | Last`. `Last` es el último consecutivo
    asignado a ese prefijo; solo `/am:review` lo sube y ningún comando lo reduce.
  - `Findings`: `ID | Module | Pattern | Element | Object Path | Doc status |
    Final status | Updated | Folder`. Las filas van en el orden de trabajo: el primer
    `pending` es el siguiente.
- **`Doc status`:** `pending`, `draft`, `implemented`, `closed` o `skipped`.
- **`Final status`:** en `closed`, `Fixed`, `Already fixed`, `False positive` o
  `Won't fix`; en `skipped`, el motivo de AI Mentor (`Snooze Reason Label`), que nunca
  cuenta como cierre; vacío en los demás.
- **`Updated`:** `AAAA-MM-DD` del último cambio de `Doc status`; la actualiza todo
  comando que cambie el estado.
- **Carpeta del hallazgo:** `reports/<Module>/<ID>-<Object Name>/` (columna `Folder`,
  relativa a `reports/`; vacía en `pending` y `skipped`). En los nombres se reemplazan
  por `_` los espacios y `\ / : * ? " < > |`, y se quitan los puntos y espacios del
  final.
- **PDF de solución:** `<Module>-<Object Name>-<Prefix>.pdf`, único en `reports/` (sin
  contar `_archive/`; sufijo `-2`, `-3` si choca). Al regenerarlo se reutiliza el
  nombre del `.pdf` que ya está en la carpeta. No lleva el ID.
- **Script de PDF:** reutiliza `scripts/generate_pdf.py` o `scripts/generate_pdf.mjs`
  si existe. Si no, detecta Python 3 (reportlab) o Node (pdfkit) y créalo con dos tipos
  de documento: `finding` (seis secciones, borrador o final) y `summary`. Puedes
  instalar la librería, nunca el lenguaje. Sin Python ni Node, el PDF queda pendiente:
  avisa y pregunta cómo seguir.
- `reports/_archive/` lo gestiona `/am:clean`; los demás comandos lo ignoran.

## Pasos

1. Lee `reports/_progress.md` (formato en "Referencia rápida"). Un hallazgo está "en
   el periodo" si su columna `Updated` cae entre la fecha de inicio y hoy. Si hay filas
   sin fecha, avisa cuántas no se pudieron ubicar en el periodo y no las inventes.
2. Lee `solution.md` (incluidas sus secciones `## Cierre` y `## Pospuesto`) e
   `implementation.md`, si existe, de los hallazgos `closed`, `implemented` o `draft`
   del periodo.
3. Escribe `reports/_summaries/summary-<AAAA-MM-DD>.md` con:
   - Periodo cubierto.
   - Cifras del periodo: cerrados desglosados por `Final status` (Fixed, Already fixed,
     False positive, Won't fix), implementados y en borrador. Los cierres se cuentan
     solo entre filas `closed`; un `skipped` guarda en `Final status` el motivo de AI
     Mentor y nunca cuenta como cierre.
     Cifras acumuladas: pending, draft, implemented, closed, skipped, total y
     porcentaje de avance.
   - Tabla de hallazgos cerrados en el periodo: módulo, elemento, patrón, estado final,
     solución en una línea.
   - Tabla de hallazgos implementados en el periodo que esperan cierre.
   - False positive y Won't fix: los hallazgos `closed` con esos estados, con la
     justificación y quién la aprobó (de `## Cierre`). Aparte, los `draft` cuyo
     "Estado sugerido en AI Mentor" es `False positive` o `Won't fix` y esperan decisión.
   - Pospuestos: los hallazgos con sección `## Pospuesto` (Remind me later), con su
     motivo.
   - Patrones de causa que se repiten y lecciones aprendidas.
   - Dudas técnicas o funcionales abiertas para llevar a la sesión.
   - Plan propuesto para la semana siguiente (qué módulo sigue).
4. Genera el mismo contenido en PDF como `reports/_summaries/summary-<AAAA-MM-DD>.pdf`
   (tipo `summary`), como indica "Script de PDF" en "Referencia rápida": reutiliza el
   script existente o, si no hay, créalo con Python o Node según lo disponible. Si no
   hay ninguno de los dos, deja solo el .md, avisa que el PDF queda pendiente y
   pregunta cómo seguir.
5. Muestra el resumen en pantalla.

Las cifras salen del archivo de progreso, no de estimaciones. Si el porcentaje de AI
Mentor no está disponible, deja el espacio para que el usuario lo complete con el
pantallazo de la sesión.
