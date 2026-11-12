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

Formato de `reports/_progress.md`, nombres de archivo y generación de PDF: como los
define `/am:review`.

1. Ubica la carpeta del hallazgo en `_progress.md`. Si el ID no existe, dilo y
   detente. Si está `pending` o `skipped`, no hay análisis que rehacer: indica que se
   usa `/am:review`.
2. Lee el `solution.md` actual, `implementation.md` si existe, y la nota del usuario.
   Si no dio nota, pregunta qué está mal antes de rehacer.
3. Si el hallazgo está `closed`, pregunta antes de sobrescribir: puede bastar con
   corregir la redacción y conservar evidencia y estado final.
4. Vuelve a leer en OutSystems los elementos involucrados; no reutilices conclusiones
   del análisis anterior sin verificarlas.
5. Reescribe `solution.md` con la misma estructura que usa `/am:review`, incluido el
   "Estado sugerido en AI Mentor" reevaluado (con la misma regla: nunca `False
   positive` ni `Won't fix` sin explicar qué se verificó). Conserva la sección
   `## Pospuesto` si existía. No toques la carpeta `evidence/`.
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
