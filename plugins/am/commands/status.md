---
description: Muestra el avance de los hallazgos por estado (pending, draft, implemented, closed, skipped) sin modificar nada
---

# /am:status

Lee `reports/_progress.md` (formato en "Referencia rápida", abajo) y muestra, sin escribir
ningún archivo:

- Totales por estado: `pending`, `draft`, `implemented`, `closed`, `skipped`.
- Los `closed`, desglosados por `Final status`: Fixed, Already fixed, False positive,
  Won't fix.
- Los `skipped` guardan en `Final status` el motivo de AI Mentor (`Snooze Reason
  Label`): puedes desglosarlos por ese motivo, pero nunca los sumes a los `closed`,
  aunque el texto coincida.
- Avance por módulo.
- Los `draft` e `implemented` que esperan cierre (ID, módulo, elemento, `Updated`),
  para saber qué falta corregir o cerrar.
- El siguiente `pending` que tomaría `/am:review` (el primero de la tabla).

Ignora `reports/_archive/`.

Nunca muestres en el chat el valor de un secreto, credencial, token o dato personal;
solo el nombre y la ruta del elemento.

Si el archivo no existe, indica que primero hay que correr `/am:review <excel>`.

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
