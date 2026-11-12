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
4. **Cambio hecho con `/am:fix`.** Si el hallazgo está `implemented` y la decisión es
   `Already fixed`, `False positive` o `Won't fix`, avisa que el cambio que aplicó
   `/am:fix` sigue en OutSystems (lo describe `implementation.md`) y pregunta si se va
   a revertir antes de cerrar. Tú no reviertes nada: OutSystems es solo lectura. Guarda
   la respuesta para `## Cierre`. Si el usuario prefiere revertir primero y cerrar
   después, termina sin cambiar nada.
5. **Fixed:**
   - Revisa `evidence/`. Si no tiene imágenes, avisa y no generes el PDF final.
   - Fuente de la sección 4: si existe `implementation.md`, úsalo (cambios realmente
     aplicados y desviaciones). Si no existe, pregunta si la solución aplicada fue la
     propuesta o cambió; si cambió, actualiza `solution.md` con lo que realmente se hizo.
6. **Already fixed:**
   - Revisa `evidence/`. Si no tiene imágenes (por ejemplo, el código actual y AI
     Mentor), avisa y no generes el PDF final.
   - Pide una línea de qué se verificó para concluir que el problema ya no existe.
7. **False positive o Won't fix:**
   - No exijas imágenes en `evidence/` (si las hay, inclúyelas).
   - Pide una justificación escrita y quién aprobó la decisión. Sin ambas, no cierres.
8. **Comprueba que se puede generar el PDF** antes de escribir el cierre: hay un script
   en `scripts/` y su lenguaje responde, o hay Python 3 o Node para crearlo (ver
   "Script de PDF"). Si no se puede, no escribas `## Cierre`, no marques el hallazgo
   `closed`, avisa que el cierre queda pendiente por el PDF y pregunta cómo seguir.
9. Agrega (o reemplaza, si ya existe) al final de `solution.md` una sección `## Cierre`
   con: estado final, fecha y, según el caso, lo verificado (Already fixed) o la
   justificación y quién la aprobó (False positive, Won't fix). Si aplicó el paso 4,
   anota también la respuesta sobre el cambio de `/am:fix` (se va a revertir, ya se
   revirtió o se conserva) tal como la dio el usuario; no afirmes que se revirtió sin
   su confirmación.
10. Regenera el PDF de solución (tipo `finding`) sin la marca de borrador, reutilizando
    el nombre del `.pdf` que ya está en la carpeta. Si la generación falla pese a la
    comprobación del paso 8, quita la sección `## Cierre` que acabas de escribir, no
    marques el hallazgo `closed`, avisa y pregunta cómo seguir. Contenido:
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
      justificación resumida y quién la aprobó. Si aplicó el paso 4, agrega una línea
      con el estado del cambio hecho por `/am:fix`: "revertido" solo si el usuario
      confirmó que ya se revirtió; en cualquier otro caso (se conserva o se va a
      revertir después), "sigue en OutSystems".

    Abre el PDF y verifica que las seis secciones y las imágenes quedaron incluidas.
11. Actualiza la fila en `_progress.md`: `Doc status` = `closed`, `Final status` = la
    decisión, `Updated` = hoy.
12. Reporta la ruta del PDF y cuántos hallazgos quedan en `draft`, `implemented` y
    `pending`. Recuerda que el estado en AI Mentor lo cambia el usuario.

No afirmes que la corrección fue validada en AI Mentor salvo que el usuario lo diga o
la evidencia lo muestre.
