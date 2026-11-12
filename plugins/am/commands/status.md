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
