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
- **Versiones anteriores:** si el proyecto tiene `reports/_template/`, algún
  `solution.html` o un script propio en `scripts/`, se ignoran: no se usan, no se
  actualizan y no se borran.
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
   como indican "Script de PDF" y "Generar un PDF" en "Referencia rápida":
   - Comprueba que hay Node con `node --version`. Si no hay, deja el `.md`, avisa que
     el PDF queda pendiente porque falta Node y no instales nada.
   - Lee `PDF-FORMAT.md` completo (apartado "Resumen") y escribe `reports/_print.json`
     (se sobrescribe) con `"type": "summary"`:
     - `period`: el periodo, como `5 al 12 nov 2026`. `cutoff`: la fecha del resumen,
       como `12 nov 2026`.
     - `cards`, siempre estas cuatro fichas: "Periodo", "Cerrados en el periodo",
       "Esperan cierre" (los `implemented`) y "Avance acumulado" (por ejemplo,
       `42 %`).
     - `sections`, siempre estas ocho, con estos títulos y en este orden (el script
       las numera):
       1. Cifras: un `h` "Periodo" con su `kv` y un `h` "Acumulado" con su `kv`.
       2. Hallazgos cerrados en el periodo: `table` (Módulo, Elemento, Patrón, Estado
          final, Solución).
       3. Implementados que esperan cierre: `table`.
       4. False positive y Won't fix: `table`, con la justificación y quién aprobó; y
          aparte los borradores que esperan decisión.
       5. Pospuestos: `table`, con el motivo.
       6. Patrones y lecciones aprendidas: `p` o `list`.
       7. Dudas abiertas: `p` o `list`.
       8. Plan para la semana siguiente: `p`, `list` o `steps`.

       Una sección sin datos no se quita: lleva un `p` con "Sin hallazgos en el
       periodo."
   - Los identificadores (módulos, elementos) van entre comillas invertidas. Sin ID
     internos y sin valores de secretos ni datos personales, igual que en el `.md`.
   - Ejecuta el script con esa salida e interpreta el código: 0, correcto; 1, no se
     pudo escribir (suele ser el PDF abierto en un visor: avisa y pide cerrarlo); 2,
     datos no válidos (corrige `_print.json` con lo que lista y repite); 4, error
     inesperado (muestra el mensaje y detente).
   - Lee el PDF y comprueba que existe, que su fecha es de esta ejecución y que tiene
     las ocho secciones. Si algo falla, corrige `_print.json` y ejecuta de nuevo.

   En `reports/_summaries/` quedan solo el `.md` y el `.pdf`. Si el PDF no sale, deja
   el `.md`, avisa que el PDF queda pendiente y pregunta cómo seguir.
5. Muestra el resumen en pantalla.

Las cifras salen del archivo de progreso, no de estimaciones. Si el porcentaje de AI
Mentor no está disponible, deja el espacio para que el usuario lo complete con el
pantallazo de la sesión.
