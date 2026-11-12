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
la descripción de la evidencia. El ID es interno: no va en el PDF, en `solution.html`
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
- **PDF de solución:** `<Module>-<Parent>-<Object Name>-<Prefix>.pdf`, donde `<Parent>`
  es el elemento padre en `Object Path` (se omite si no hay o es el módulo); único en
  `reports/` (sin contar `_archive/`; sufijo `-2`, `-3` si choca). Al regenerarlo se
  reutiliza el nombre del `.pdf` que ya está en la carpeta. Título:
  `<Parent> › <Object Name>`. No lleva el ID. Sale de imprimir `solution.html`, que
  está en la misma carpeta.
- **Plantilla de PDF:** no hay script de PDF ni configuración por proyecto, y no se
  crea ninguno. La plantilla es fija y está en `${CLAUDE_PLUGIN_ROOT}/templates/`:
  `TEMPLATE.md` (reglas, campos y catálogo de componentes; se lee ahí, no se copia),
  `finding.css`, `finding.html` y `summary.html`. Estos tres se copian a
  `reports/_template/` si no están o si su versión (primer comentario de
  `finding.css`, "versión N") es menor que la del plugin; la copia nunca se edita.
- **Generar un PDF:** se escribe el `.html` (`solution.html` en la carpeta del
  hallazgo, desde `finding.html`; `summary-<AAAA-MM-DD>.html` en `_summaries/`, desde
  `summary.html`) siguiendo `TEMPLATE.md` al pie de la letra: solo sus campos y los
  componentes del catálogo, sin estilos propios. Se imprime con Edge o Chrome por su
  ruta completa (en Windows: Edge en `Program Files`, luego en `Program Files (x86)`,
  luego Chrome): `"<navegador>" --headless --disable-gpu --no-pdf-header-footer
  --print-to-pdf="<salida>.pdf" "file:///<ruta>/<archivo>.html"`. Después se
  comprueba que el PDF existe y es de esta ejecución, que tiene todas sus secciones,
  que las imágenes cargaron y que el texto se puede extraer. Sin navegador, o si la
  impresión falla, se deja el `.html`, se avisa y el hallazgo no se marca `closed`.
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
8. **Observaciones fuera del alcance.** Si `solution.md` tiene
   `## Observaciones fuera del alcance`, pregunta si el usuario ya las reportó por
   separado. No las reportas tú, y la respuesta no impide cerrar. Guárdala para
   `## Cierre` y para la sección 3 del PDF.
9. **Comprueba que se puede generar el PDF** antes de escribir nada del cierre (ver
   "Plantilla de PDF" y "Generar un PDF" en "Referencia rápida"):
   - Lee `TEMPLATE.md` completo y comprueba la copia de `reports/_template/` (cópiala o
     reemplázala si falta o su versión es menor).
   - Busca Edge o Chrome por su ruta completa.

   Si no hay plantilla, detente y pide actualizar el plugin. Si no hay navegador,
   sigue con el paso 10 solo hasta escribir `solution.html` y luego detente: no
   escribas `## Cierre`, no marques el hallazgo `closed`, avisa que el cierre queda
   pendiente por el PDF y que basta repetir `/am:close` cuando haya Edge o Chrome.
10. Escribe `solution.html` de nuevo a partir de `reports/_template/finding.html`
    (no edites el anterior), en versión final, e imprime el PDF reutilizando el nombre
    del `.pdf` que ya está en la carpeta. Sin estilos propios: solo los campos y los
    componentes del catálogo de `TEMPLATE.md`. Lo que cambia según la decisión sale de
    la tabla "Qué cambia según el estado" de `TEMPLATE.md`:

    | Campo | Fixed | Already fixed | False positive | Won't fix |
    |---|---|---|---|---|
    | `{{ETIQUETA_ESTADO}}` | Fixed | Already fixed | False positive | Won't fix |
    | `{{ESTADO_BADGE}}` | `badge-dark` con el estado | igual | igual | igual |
    | `{{TITULO_SOLUCION}}` | Solución aplicada | Solución aplicada | Solución aplicada | Solución aplicada |
    | `{{SOLUCION}}` | Lo realmente hecho | "No se requirió corrección: el problema ya no existe en el código", con lo verificado | "No se aplica corrección", con por qué el patrón no aplica | "No se aplica corrección.", seguido de la solución que se había propuesto |
    | `{{CLASE_EVIDENCIA}}` | `page-break` | `page-break` | vacío | vacío |
    | `{{EVIDENCIA}}` | Capturas | Capturas | Justificación (y capturas si hay) | Justificación (y capturas si hay) |
    | `{{ESTADO_FINAL}}` | Fila de estado y tabla | igual | igual, con justificación y quién aprobó | igual, con justificación y quién aprobó |

    Contenido:
    - El PDF nunca afirma algo con más certeza que sus fuentes (`solution.md`,
      `implementation.md` y lo que el usuario confirmó en este cierre): si allí dice
      "No verificado" o "probable", el PDF usa la misma cautela. "Consultar antes de
      implementar" y "Hallazgos relacionados" no van en el PDF. Tampoco el ID ni el
      valor de un secreto o dato personal.
    - Título `<Parent> › <Object Name>`, en la fuente normal de los títulos. Sección 1
      con sus cuatro filas (App, Módulo, Objeto con su tipo y Ruta del objeto);
      categoría, patrón y fecha de análisis van en la ficha del encabezado y no se
      repiten en la tabla. Si no se conoce el tipo de un tramo de la ruta, se omite.
    - Sección 3, "Causa identificada": si `solution.md` tiene
      `## Observaciones fuera del alcance`, termina con una sola línea en una nota
      (`note`), sin detalle. Solo si el usuario confirmó en el paso 8 que ya las
      reportó, va en pasado: "Durante el análisis se identificaron observaciones
      fuera del alcance de este hallazgo; se reportaron por separado." En cualquier
      otro caso (no las ha reportado, no sabe o no respondió), queda como en el
      borrador: "...; se reportan por separado."
    - Los identificadores (clases CSS, nombres de acciones, rutas) van en `<code>`,
      cada uno en el suyo, también en las justificaciones y en la descripción de la
      evidencia. Los largos llevan `<code class="wrap">` y `<wbr>` después de cada
      separador, para que no se partan dentro de un nombre.
    - Sección 4 "Solución aplicada", sin la tabla de alternativas (solo va en
      borrador). Si `solution.md` tiene `## Cambio de comportamiento` y la sección
      describe esa solución (Fixed con la solución propuesta, o Won't fix), incluye
      el recuadro "Cambio de comportamiento" que lo dice explícitamente; en Fixed,
      solo si el cambio aplicado lo conserva.
    - Sección 5: las imágenes de `evidence/`, referenciadas con ruta relativa
      (`evidence/<archivo>`), cada una con un pie que la describa. Las de antes y
      después van en pares; las de validación y las que sobren, a ancho completo.
      Para False positive y Won't fix, la justificación escrita (y las imágenes, si
      hay).
    - Sección 6: la fila de estado y la tabla con estado final y fecha de cierre; para
      False positive y Won't fix, además la justificación resumida y quién la aprobó.
      Si aplicó el paso 4, agrega la fila "Cambio de /am:fix": "revertido" solo si el
      usuario confirmó que ya se revirtió; en cualquier otro caso (se conserva o se
      va a revertir después), "sigue en OutSystems".

    Después de imprimir, lee el PDF y comprueba que existe y es de esta ejecución,
    que tiene las seis secciones, que las imágenes cargaron (cada figura muestra su
    captura) y que el texto se puede extraer. Si algo falla, corrige `solution.html`
    e imprime de nuevo.

    Si el PDF no se pudo generar o no pasa la comprobación, deja `solution.html`, no
    escribas `## Cierre`, no marques el hallazgo `closed`, avisa y pregunta cómo
    seguir.
11. Con el PDF comprobado, agrega (o reemplaza, si ya existe) al final de
    `solution.md` (después de `## Observaciones fuera del alcance`, si existe) una
    sección `## Cierre` con: estado final, fecha y, según el caso, lo verificado
    (Already fixed) o la justificación y quién la aprobó (False positive, Won't fix).
    Si aplicó el paso 4, anota también la respuesta sobre el cambio de `/am:fix` (se
    va a revertir, ya se revirtió o se conserva) tal como la dio el usuario; no
    afirmes que se revirtió sin su confirmación. Si aplicó el paso 8, anota si las
    observaciones fuera del alcance ya se reportaron por separado (confirmado por el
    usuario) o siguen por reportar. Debe decir lo mismo que el PDF.
12. Actualiza la fila en `_progress.md`: `Doc status` = `closed`, `Final status` = la
    decisión, `Updated` = hoy.
13. Reporta la ruta del PDF y cuántos hallazgos quedan en `draft`, `implemented` y
    `pending`. Recuerda que el estado en AI Mentor lo cambia el usuario.

No afirmes que la corrección fue validada en AI Mentor salvo que el usuario lo diga o
la evidencia lo muestre.
