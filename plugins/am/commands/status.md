---
description: Muestra el avance de los hallazgos por estado (pending, draft, implemented, closed, skipped) sin modificar nada
---

# /am:status

Lee `reports/_progress.md` (formato en "Referencia rápida", abajo) y, solo para la lista
"Requieren consulta", el `solution.md` de los hallazgos `draft` e `implemented`. Muestra,
sin escribir ningún archivo:

- Totales por estado: `pending`, `draft`, `implemented`, `closed`, `skipped`.
- Los `closed`, desglosados por `Final status`: Fixed, Already fixed, False positive,
  Won't fix.
- Los `skipped` guardan en `Final status` el motivo de AI Mentor (`Snooze Reason
  Label`): puedes desglosarlos por ese motivo, pero nunca los sumes a los `closed`,
  aunque el texto coincida.
- Avance por módulo.
- Los `draft` e `implemented` que esperan cierre (ID, módulo, elemento, `Updated`),
  para saber qué falta corregir o cerrar.
- **Requieren consulta**, en una lista aparte: los `draft` e `implemented` cuyo
  `solution.md` (en la carpeta de la columna `Folder`) tiene el apartado
  `## Consultar antes de implementar`. Por cada uno: ID, módulo, elemento, estado y
  cuántos puntos hay que consultar. No copies las preguntas; para leerlas está
  `solution.md`. Si ninguno lo tiene, dilo en una línea. Si falta el `solution.md` de
  alguno, repórtalo como "No verificado" en vez de darlo por libre de consulta.
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
