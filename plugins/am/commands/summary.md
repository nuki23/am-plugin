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
4. Genera el mismo contenido en PDF como `reports/_summaries/summary-<AAAA-MM-DD>.pdf`,
   como indican "Plantilla de PDF" y "Generar un PDF" en "Referencia rápida":
   - Lee `TEMPLATE.md` completo (apartado "Resumen de avance") y comprueba la copia de
     `reports/_template/` (cópiala o reemplázala si falta o su versión es menor).
   - Copia `reports/_template/summary.html` como
     `reports/_summaries/summary-<AAAA-MM-DD>.html` y sustituye sus campos, con
     `{{CSS_HREF}}` = `../_template/finding.css`. Usa el mismo CSS y el mismo
     encabezado que los PDF de solución: sin estilos propios, solo las clases de
     `finding.css` y los componentes del catálogo. No cambies el orden ni el título de
     sus ocho secciones; una sección sin datos lleva la línea "Sin hallazgos en el
     periodo." en lugar de quitarse.
   - Los identificadores (módulos, elementos) van en `<code>`. Sin ID internos y sin
     valores de secretos ni datos personales, igual que en el `.md`.
   - Imprime con Edge o Chrome por su ruta completa, con el mismo comando que los PDF
     de solución.
   - Lee el PDF y comprueba que existe y es de esta ejecución, que tiene las ocho
     secciones y que el texto se puede extraer. Si algo falla, corrige el `.html` e
     imprime de nuevo.

   Si no hay Edge ni Chrome, o la impresión falla, deja el `.md` y el `.html`, avisa
   que el PDF queda pendiente y pregunta cómo seguir.
5. Muestra el resumen en pantalla.

Las cifras salen del archivo de progreso, no de estimaciones. Si el porcentaje de AI
Mentor no está disponible, deja el espacio para que el usuario lo complete con el
pantallazo de la sesión.
