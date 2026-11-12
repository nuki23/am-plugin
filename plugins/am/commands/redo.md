---
description: Rehace el análisis y los documentos de un hallazgo, con la corrección que indique el usuario
argument-hint: <ID> [nota]
---

# /am:redo

Argumentos: `$ARGUMENTS` (el primero es el ID; el resto, si existe, es la nota con lo
que hay que corregir del análisis anterior).

OutSystems es solo lectura: consulta, no publiques ni edites. Nunca cambies el estado
del hallazgo en AI Mentor.

Nunca copies a un `.md`, a un PDF ni al chat el valor de un secreto, credencial, token o
dato personal; solo el nombre y la ruta del elemento. El ID es interno: no va en el PDF
ni en `solution.md`.

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

1. Ubica la carpeta del hallazgo en `_progress.md`. Si el ID no existe, dilo y
   detente. Si está `pending` o `skipped`, no hay análisis que rehacer: indica que se
   usa `/am:review`.
2. Lee el `solution.md` actual, `implementation.md` si existe, y la nota del usuario.
   Si no dio nota, pregunta qué está mal antes de rehacer.
3. Si el hallazgo está `closed`, pregunta antes de sobrescribir: puede bastar con
   corregir la redacción y conservar evidencia y estado final.
4. Vuelve a leer en OutSystems los elementos involucrados; no reutilices conclusiones
   del análisis anterior sin verificarlas.
5. Reescribe `solution.md` con estas secciones, en este orden y sin el ID:
   - Identificación (App, Module, Category, Pattern Name, Object Name, Object Type,
     Object Path y fecha de análisis)
   - Estado sugerido en AI Mentor, con su justificación de una línea
   - Resumen del hallazgo
   - Dónde está
   - Por qué AI Mentor lo marca
   - Cómo se llegó a la solución
   - Pasos manuales
   - Alternativas consideradas
   - Impacto y qué probar después
   - Cómo verificar en AI Mentor
   - Qué pantallazos tomar para la evidencia
   - Puntos no verificados, si los hay

   Reevalúa el "Estado sugerido en AI Mentor" (nunca `False positive` ni `Won't fix`
   sin explicar qué se verificó). Conserva la sección `## Pospuesto` si existía. No
   toques la carpeta `evidence/`.
6. Estado al terminar. Regenera el PDF de solución (tipo `finding`), reutilizando el
   nombre del `.pdf` que ya está en la carpeta; si no hay Python ni Node, avisa que el
   PDF queda pendiente y pregunta cómo seguir.
   - **Si la solución cambió, queda `draft`**: PDF en modo borrador, vacía
     `Final status` y quita la sección `## Cierre` de `solution.md` si existía. Si
     estaba `implemented`, además avisa claramente que lo implementado en OutSystems ya
     no coincide con el documento; conserva `implementation.md` y agrega al inicio una
     nota: "Corresponde a la solución anterior, reemplazada el AAAA-MM-DD por /am:redo".
   - **Si solo cambió la redacción** (misma causa y misma solución), conserva el estado:
     `draft` e `implemented` siguen igual (PDF en modo borrador); `closed` sigue
     `closed`, con `Final status`, la sección `## Cierre` y el PDF en modo final con la
     evidencia existente.
7. Si el estado cambió, actualiza la fila en `_progress.md`: `Doc status`,
   `Final status` si corresponde, y `Updated` = hoy.
8. Resume qué cambió respecto a la versión anterior, el estado sugerido en AI Mentor y
   en qué estado quedó el hallazgo.

Lo que no puedas verificar va marcado como "No verificado: ...".
