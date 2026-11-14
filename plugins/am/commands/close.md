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
- **PDF de solución:** `<Module>-<Parent>-<Object Name>-<Prefix>.pdf`, donde `<Parent>`
  es el elemento padre en `Object Path` (se omite si no hay o es el módulo); único en
  `reports/` (sin contar `_archive/`; sufijo `-2`, `-3` si choca). Al regenerarlo se
  reutiliza el nombre del `.pdf` que ya está en la carpeta. Título:
  `<Parent> › <Object Name>`. No lleva el ID.
- **Script de PDF:** el diseño es fijo y viene con el plugin, en
  `${CLAUDE_PLUGIN_ROOT}/scripts/`: `generate_pdf.cjs` (el generador),
  `pdfkit.bundle.cjs` (la librería, ya incluida) y `PDF-FORMAT.md` (el formato de los
  datos; se lee completo antes de escribirlos). Si esa ruta no existe, se busca
  `scripts/` en la versión más alta de `~/.claude/plugins/cache/nuki23/am/`; si tampoco
  está, el comando se detiene y pide actualizar el plugin. El script no se copia al
  proyecto, nunca se edita y no se genera uno propio. Solo requiere Node (se comprueba
  con `node --version`); no se usa npm ni se instala nada. No hay configuración por
  proyecto.
- **Generar un PDF:** se escriben los datos en `reports/_print.json` (UTF-8) siguiendo
  `PDF-FORMAT.md` al pie de la letra y se ejecuta
  `node "${CLAUDE_PLUGIN_ROOT}/scripts/generate_pdf.cjs" "reports/_print.json" "<salida>.pdf"`.
  `_print.json` es un único archivo temporal: se sobrescribe en cada impresión, no se
  borra después y no se crea uno por hallazgo. Código de salida: 0, correcto; 3, se
  generó pero faltó una imagen (se corrige la ruta y se repite); 1, no se pudo escribir
  (suele ser el PDF abierto en un visor: se avisa y se pide cerrarlo); 2, datos no
  válidos (se corrige `_print.json` con lo que lista el script y se repite); 4, error
  inesperado (se muestra el mensaje y el comando se detiene). Después se comprueba el
  archivo: existe, su fecha es de esta ejecución y, al leerlo, están todas sus
  secciones y las figuras esperadas. Sin Node, o si el PDF no sale, se avisa que queda
  pendiente y el hallazgo no se marca `closed`.
- **Texto del PDF:** `affected` y `cause` (secciones 2 y 3) se arman con el contenido
  de `solution.md`; al regenerar en close o en un redo de solo redacción se copian tal
  cual, sin redactarlos de nuevo. `solution` (sección 4) se escribe según el estado: en
  `draft`, la propuesta con sus pasos y la tabla de alternativas; en `fixed`, lo que
  se hizo, en pasado y bajo el subtítulo "Cambios aplicados"; en los demás cierres,
  lo que indica `PDF-FORMAT.md`. En ningún cierre va la tabla de alternativas, y el
  recuadro de un cierre se titula solo "Cambio de comportamiento". Nunca se afirma
  que algo se hizo o se validó sin confirmación del usuario.
- **Buenas prácticas:** las reglas están en
  `${CLAUDE_PLUGIN_ROOT}/rules/best-practices.md`, la única fuente; si esa ruta no
  existe, se busca `rules/` en la versión más alta de
  `~/.claude/plugins/cache/nuki23/am/` y, si tampoco está, el comando que las necesita
  se detiene y pide actualizar el plugin. No se copia al proyecto ni se edita. Sus
  códigos (`DOC-3`, `PERF-7`…) se citan en `solution.md` solo en el apartado
  `## Buenas prácticas aplicadas`, y pueden aparecer en el chat y en el plan de
  `/am:fix`; nunca en los pasos manuales, en `implementation.md` ni en el PDF.
- **Versiones anteriores:** si el proyecto tiene `reports/_template/`, algún
  `solution.html` o un script propio en `scripts/`, se ignoran: no se usan, no se
  actualizan y no se borran.
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
     La sección solo describe como hecho lo que diga `implementation.md` o lo que el
     usuario confirme aquí.
   - Si `solution.md` tiene `## Cambio de comportamiento` y el cambio aplicado lo
     conserva, pregunta quién tomó la decisión funcional. La respuesta se anota en
     `## Cierre`; no va en el PDF.
   - **Warnings.** Pregunta si el módulo quedó sin warnings nuevos después del
     cambio. Si el usuario responde que quedaron warnings nuevos, o que no lo sabe,
     recuérdale que la regla `DOC-10` de buenas prácticas pide que el cambio no deje
     warnings nuevos y pregunta si quiere cerrar como `Fixed` de todos modos. Solo con
     un sí explícito sigues; sin ese sí, no cierres y termina sin cambiar nada. No des
     por comprobado lo que el usuario no sabe. La respuesta se anota en `## Cierre`;
     no va en el PDF.
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
   "Script de PDF" y "Generar un PDF" en "Referencia rápida"):
   - Comprueba que hay Node con `node --version`.
   - Ubica el script del plugin y lee `PDF-FORMAT.md` completo.

   Si no hay Node, detente: no escribas `## Cierre`, no marques el hallazgo `closed`,
   no instales nada, avisa que el cierre queda pendiente porque falta Node y que basta
   repetir `/am:close` cuando lo haya. Si no está el script, detente y pide actualizar
   el plugin.
10. **Evidencia.** Si el PDF va a llevar imágenes (siempre en Fixed y Already fixed;
    en False positive y Won't fix, solo si las hay en `evidence/`):
    - Una figura por imagen de `evidence/`, con `file` = `evidence/<archivo>` y un
      `caption` que la describa.
    - `kind` según el nombre del archivo: `antes` si dice "antes", `despues` si dice
      "despues" o "después"; las de validación (Network, AI Mentor y similares),
      `validacion`. Si un nombre no deja claro el tipo, pregunta al usuario; no lo
      adivines.
    - Ordena las figuras para que cada `antes` quede seguido de su `despues` (el
      script los dibuja lado a lado); las de validación y las que sobren van después.
    - El script solo admite PNG y JPG. Si hay una imagen en otro formato (webp, gif),
      avisa y pide convertirla a PNG o JPG antes de cerrar; no instales nada.
    - Pregunta, en una sola pregunta, el ambiente, la versión publicada y la fecha de
      validación. Son opcionales: lo que el usuario no responda se omite de los datos
      y el script lo muestra como "—". No los deduzcas.
11. Escribe `reports/_print.json` de nuevo (se sobrescribe) y genera el PDF final con
    el script, reutilizando el nombre del `.pdf` que ya está en la carpeta. `baseDir`
    es la carpeta del hallazgo. Sigue `PDF-FORMAT.md` al pie de la letra:

    | Campo | Fixed | Already fixed | False positive | Won't fix |
    |---|---|---|---|---|
    | `state` | `fixed` | `already-fixed` | `false-positive` | `wont-fix` |
    | `solution` | Lo que se hizo, en pasado, con los pasos bajo el subtítulo "Cambios aplicados" | "No se requirió corrección: el problema ya no existe en el código", con lo verificado | "No se aplica corrección", con por qué el patrón no aplica | "No se aplica corrección.", seguido de la solución que se había propuesto |
    | `evidence.figures` | Las del paso 10 | Las del paso 10 | Solo si hay imágenes | Solo si hay imágenes |
    | `evidence.text` | — | — | La justificación | La justificación |
    | `final` | `closedOn` | `closedOn`, `verified` | `closedOn`, `justification`, `approvedBy` | `closedOn`, `justification`, `approvedBy` |

    El script pone solo la etiqueta del encabezado, el estado de la ficha, el título
    de la sección 4 ("Solución aplicada") y el contenido fijo de la sección 6: no los
    escribas tú.

    Contenido:
    - `affected` y `cause` (secciones 2 y 3) se arman con el contenido de
      `solution.md`. Copia el texto tal cual, sin redactarlo de nuevo, para que el
      PDF final diga lo mismo que el borrador. La correspondencia con los bloques es
      la de `/am:review`: listas con viñetas en `list`, y los fragmentos de código no
      van al PDF.
    - `solution` (sección 4) no se copia del borrador: se escribe según el estado.
      - **Fixed:** describe lo que se hizo, en pasado ("Se creó…", "Se eliminó…"), a
        partir de `implementation.md` si existe o de lo que el usuario confirmó en
        el paso 5. Si la solución aplicada fue la propuesta, convierte los pasos de
        `solution.md` a pasado sin cambiar su contenido: mismos pasos, mismos
        elementos, mismo orden. Los pasos van en `steps` bajo un `h` "Cambios
        aplicados". No describas como hecho nada que esas fuentes no digan.
      - **Already fixed, False positive y Won't fix:** lo que indica la tabla, como
        lo define `PDF-FORMAT.md`. En Won't fix, la solución que se había propuesto
        sigue descrita como propuesta, no como hecha.
      - En ningún cierre va la tabla de alternativas.
    - El PDF nunca afirma algo con más certeza que sus fuentes (`solution.md`,
      `implementation.md` y lo que el usuario confirmó en este cierre): si allí dice
      "No verificado" o "probable", el PDF usa la misma cautela. "Consultar antes de
      implementar", "Hallazgos relacionados" y "Buenas prácticas aplicadas" no van en
      el PDF. Tampoco el ID, un código de regla (`DOC-3`, `PERF-7`…) ni el valor de un
      secreto o dato personal, en ningún texto.
    - Identificación: `app`, `module`, `category`, `pattern`, `objectName`,
      `objectType`, `analysisDate`, `parent` y `path`, de `solution.md`. Si no se
      conoce el tipo de un tramo de la ruta, se omite su `type`.
    - Fechas (`analysisDate`, `closedOn`, `validatedOn`) en formato `12 nov 2026`.
    - `cause`: si `solution.md` tiene `## Observaciones fuera del alcance`, termina
      con una sola `note`, con la frase fija de `PDF-FORMAT.md`, sin detalle. Solo si
      el usuario confirmó en el paso 8 que ya las reportó, va la frase en pasado
      ("...; se reportaron por separado."). En cualquier otro caso (no las ha
      reportado, no sabe o no respondió), queda como en el borrador ("...; se reportan
      por separado.").
    - Los identificadores (clases CSS, nombres de acciones, rutas) van entre comillas
      invertidas, cada uno entre las suyas, también en las justificaciones y en los
      pies de las figuras.
    - Recuadro de cambio de comportamiento: si `solution.md` tiene
      `## Cambio de comportamiento` y la sección 4 describe esa solución, `solution`
      lleva un `callout` titulado solo "Cambio de comportamiento", sin "Requiere
      decisión funcional". En Fixed va solo si el cambio aplicado lo conserva, y dice
      el cambio que quedó aplicado; en Won't fix, el que habría tenido la solución
      propuesta, sin darlo por aplicado. Quién tomó la decisión no va en el PDF.
    - `final`: `closedOn` es la fecha de hoy; `verified` (Already fixed) es la línea
      del paso 6; `justification` y `approvedBy` (False positive, Won't fix) son los
      del paso 7. Si aplicó el paso 4, agrega `fixChange`: "revertido" solo si el
      usuario confirmó que ya se revirtió; en cualquier otro caso (se conserva o se
      va a revertir después), "sigue en OutSystems".

    Ejecuta el script e interpreta el código de salida: 0, correcto; 3, faltó una
    imagen (corrige la ruta y repite); 1, no se pudo escribir (suele ser el PDF
    abierto en un visor: avisa y pide cerrarlo); 2, datos no válidos (corrige
    `_print.json` con lo que lista y repite); 4, error inesperado (muestra el mensaje
    y detente).

    Después, lee el PDF y comprueba que existe, que su fecha es de esta ejecución,
    que tiene las seis secciones y que están las figuras esperadas, cada una con su
    captura. Si algo falla, corrige `_print.json` y ejecuta de nuevo.

    Si el PDF no se pudo generar o no pasa la comprobación, no escribas `## Cierre`,
    no marques el hallazgo `closed`, avisa y pregunta cómo seguir.
12. Con el PDF comprobado, agrega (o reemplaza, si ya existe) al final de
    `solution.md` (después de `## Observaciones fuera del alcance`, si existe) una
    sección `## Cierre` con: estado final, fecha y, según el caso, lo verificado
    (Already fixed) o la justificación y quién la aprobó (False positive, Won't fix).
    Anota también el ambiente, la versión publicada y la fecha de validación que el
    usuario haya dado en el paso 10, para que `/am:redo` pueda regenerar el mismo PDF.
    Si aplicó la pregunta del paso 5, anota quién tomó la decisión funcional, tal
    como lo dijo el usuario; si no respondió, anota que no se indicó. En `Fixed`,
    anota también la respuesta sobre warnings del paso 5: "warnings: sin warnings
    nuevos", "warnings: quedaron warnings nuevos; el usuario confirmó cerrar de todos
    modos" o "warnings: no verificado" (el usuario no lo sabía y confirmó cerrar de
    todos modos).
    Si aplicó el paso 4, anota también la respuesta sobre el cambio de `/am:fix` (se
    va a revertir, ya se revirtió o se conserva) tal como la dio el usuario; no
    afirmes que se revirtió sin su confirmación. Si aplicó el paso 8, anota si las
    observaciones fuera del alcance ya se reportaron por separado (confirmado por el
    usuario) o siguen por reportar. Debe decir lo mismo que el PDF.
13. Actualiza la fila en `_progress.md`: `Doc status` = `closed`, `Final status` = la
    decisión, `Updated` = hoy.
14. Reporta la ruta del PDF y cuántos hallazgos quedan en `draft`, `implemented` y
    `pending`. Recuerda que el estado en AI Mentor lo cambia el usuario.

No afirmes que la corrección fue validada en AI Mentor salvo que el usuario lo diga o
la evidencia lo muestre.
