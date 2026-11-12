---
description: Cierra un hallazgo como Fixed, Already fixed, False positive o Won't fix y genera el PDF final con evidencia y estado
argument-hint: <ID>
---

# /am:close

ID recibido: `$ARGUMENTS`

El usuario ya atendió el hallazgo: lo corrigió a mano, lo implementó con `/am:fix` o
decidió no corregirlo. OutSystems sigue siendo solo lectura para ti, y nunca cambias el
estado del hallazgo en AI Mentor: eso lo hace el usuario.

Nunca copies a un `.md`, a un PDF ni al chat el valor de un secreto, credencial, token o
dato personal; solo el nombre y la ruta del elemento. Esto incluye las justificaciones y
la descripción de la evidencia. El ID es interno: no va en el PDF ni en `solution.md`.

Formato de `reports/_progress.md`, nombres de archivo y generación de PDF: como los
define `/am:review`.

1. Si no hay ID, muestra los hallazgos en estado `draft` o `implemented` de
   `_progress.md` y pregunta cuál cerrar. Si el ID está `pending`, indica que primero
   va `/am:review`; si ya está `closed`, indica que para corregirlo se usa `/am:redo`;
   si está `skipped`, indica que ya venía gestionado en AI Mentor.
2. Muestra el "Estado sugerido en AI Mentor" de `solution.md` y pregunta la decisión.
   Las opciones son:

   | Decisión | Qué exige | Resultado |
   |---|---|---|
   | `Fixed` | Corrección aplicada; imágenes en `evidence/` | Cierra |
   | `Already fixed` | El problema ya no existe en el código; imágenes en `evidence/` | Cierra |
   | `False positive` | Justificación escrita y quién aprobó | Cierra |
   | `Won't fix` | Justificación escrita y quién aprobó | Cierra |
   | `Remind me later` | El motivo | No cierra |

   Si la decisión difiere del estado sugerido, está bien: anótalo en `## Cierre`.
3. **Remind me later:** no cierres ni regeneres el PDF. Agrega (o reemplaza) en
   `solution.md` una sección `## Pospuesto` con la fecha y el motivo. El estado sigue
   igual (`draft` sigue `draft`; `implemented` sigue `implemented`, porque el cambio ya
   está en OutSystems), sin tocar `Updated`. Reporta y termina. Lo mismo si el usuario
   dice que simplemente sigue pendiente, sin motivo que anotar: no cambies nada.
4. **Fixed:**
   - Revisa `evidence/`. Si no tiene imágenes, avisa y no generes el PDF final.
   - Fuente de la sección 4: si existe `implementation.md`, úsalo (cambios realmente
     aplicados y desviaciones). Si no existe, pregunta si la solución aplicada fue la
     propuesta o cambió; si cambió, actualiza `solution.md` con lo que realmente se hizo.
5. **Already fixed:**
   - Revisa `evidence/`. Si no tiene imágenes (por ejemplo, el código actual y AI
     Mentor), avisa y no generes el PDF final.
   - Pide una línea de qué se verificó para concluir que el problema ya no existe.
6. **False positive o Won't fix:**
   - No exijas imágenes en `evidence/` (si las hay, inclúyelas).
   - Pide una justificación escrita y quién aprobó la decisión. Sin ambas, no cierres.
7. Agrega (o reemplaza, si ya existe) al final de `solution.md` una sección `## Cierre`
   con: estado final, fecha y, según el caso, lo verificado (Already fixed) o la
   justificación y quién la aprobó (False positive, Won't fix).
8. Regenera el PDF de solución (tipo `finding`) sin la marca de borrador, reutilizando
   el nombre del `.pdf` que ya está en la carpeta. Si no hay Python ni Node, avisa que
   el PDF final queda pendiente, no marques el hallazgo `closed` y pregunta cómo seguir.
   Contenido:
   - Sección 4 "Solución aplicada":
     - Fixed: lo realmente hecho.
     - Already fixed: "No se requirió corrección: el problema ya no existe en el
       código", con lo verificado.
     - False positive: "No se aplica corrección", con por qué el patrón no aplica.
     - Won't fix: "No se aplica corrección", seguido de la solución que se había
       propuesto.
   - Sección 5: las imágenes de `evidence/` con una línea que describa cada una. Para
     False positive y Won't fix, la justificación escrita (y las imágenes, si hay).
   - Sección 6: estado final y fecha; para False positive y Won't fix, además la
     justificación resumida y quién la aprobó.

   Abre el PDF y verifica que las seis secciones y las imágenes quedaron incluidas.
9. Actualiza la fila en `_progress.md`: `Doc status` = `closed`, `Final status` = la
   decisión, `Updated` = hoy.
10. Reporta la ruta del PDF y cuántos hallazgos quedan en `draft`, `implemented` y
    `pending`. Recuerda que el estado en AI Mentor lo cambia el usuario.

No afirmes que la corrección fue validada en AI Mentor salvo que el usuario lo diga o
la evidencia lo muestre.
