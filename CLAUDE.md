# CLAUDE.md — mantenimiento del plugin `am`

Plugin de Claude Code que documenta hallazgos de deuda técnica que AI Mentor reporta
sobre aplicaciones OutSystems. Repo público: github.com/nuki23/am-plugin.

## Estructura

```
.claude-plugin/marketplace.json     marketplace "nuki23" (owner "nuki23")
plugins/am/.claude-plugin/plugin.json   plugin "am" + versión (author "nuki23")
plugins/am/commands/<nombre>.md     un archivo por comando → /am:<nombre>
README.md
```

- Plugin `am`, marketplace `nuki23`: `/plugin marketplace add nuki23/am-plugin`,
  `/plugin install am@nuki23`, `/plugin marketplace update nuki23`. Si cambia el nombre,
  actualizar `marketplace.json`, `plugin.json` y el README a la vez.
- Comandos actuales (siete): `review`, `close`, `fix`, `redo`, `status`, `summary`,
  `clean`. `fix` y `clean` llevan `disable-model-invocation: true`.
- **Idioma:** nombres internos (archivos, carpetas, columnas, estados, tipos de PDF) en
  inglés; contenido de los documentos y textos de los comandos, en español. Los
  encabezados dentro de `solution.md` (`## Cierre`, `## Pospuesto`) son contenido.
- Salida que generan los comandos (en el proyecto del usuario, nunca en este repo):
  - `reports/_progress.md`
  - `reports/_summaries/summary-AAAA-MM-DD.md` y `.pdf`
  - `reports/_archive/<AAAA-MM-DD>/` (solo `/am:clean`; los demás comandos lo ignoran)
  - `reports/<Module>/<ID>-<Object Name>/` con `solution.md`,
    `<Module>-<Parent>-<Object Name>-<Prefix>.pdf`, `implementation.md` (solo si pasó
    por `/am:fix`) y `evidence/`.
- **Nombres de archivo** (regla de referencia en `commands/review.md`): se limpian
  espacios y `\ / : * ? " < > |`; el PDF es único en `reports/` (sufijo `-2`, `-3` si
  choca) y redo/close reutilizan el nombre existente al regenerarlo. `<Parent>` es el
  segmento anterior al último de `Object Path`; se omite si no hay o es el módulo. El
  título del PDF es `<Parent> > <Object Name>`.
- **ID interno** (`SRC-001`): solo en `_progress.md`, en el nombre de la carpeta y en el
  chat. Nunca en `solution.md`, `implementation.md` ni en ningún PDF.
- **PDF:** la regla de referencia es la sección "Generación de PDF" de
  `commands/review.md`; redo, close y summary la referencian. El plugin no asume
  Python: reutiliza un script existente (`scripts/generate_pdf.py` o
  `scripts/generate_pdf.mjs`); si no hay, detecta Python 3 (reportlab) o Node (pdfkit)
  y crea el script. Puede instalar la librería, nunca el lenguaje. Sin ninguno, se
  generan los `.md`, el PDF queda pendiente y se pregunta al usuario. El script soporta
  dos tipos: `finding` (seis secciones, modo borrador o final; review, redo, close) y
  `summary` (summary).

## Formato de `_progress.md`

La definición de referencia está en `commands/review.md`; los demás comandos llevan
un resumen (bloque "Referencia rápida").

```
# AI Mentor progress

## Prefixes
| Prefix | Pattern Name | Last |

## Findings
| ID | Module | Pattern | Element | Object Path | Doc status | Final status | Updated | Folder |
```

- `Last` (sección `Prefixes`): último consecutivo asignado a cada prefijo, con una fila
  por prefijo usado. review numera desde `Last` + 1 y lo actualiza; ningún comando lo
  reduce. Así un ID archivado por clean nunca se repite.
- `Doc status`: `pending`, `draft`, `implemented`, `closed`, `skipped`.
- `Final status`: en `closed`, `Fixed`, `Already fixed`, `False positive` o `Won't fix`
  (close); en `skipped`, el valor de `Snooze Reason Label` del Excel (review); vacío en
  los demás. Los conteos por estado final (status, summary) solo consideran filas
  `closed`, aunque el texto de un `skipped` coincida.
- `Updated`: `AAAA-MM-DD` del último cambio de estado; lo actualiza todo comando que
  cambie el estado (review, fix, close, redo). summary filtra el periodo por esta columna.
- Las filas van en el orden de trabajo confirmado en review: el primer `pending` es
  el siguiente.
- No hay migración desde el formato en español (`reportes/`, `_progreso.md`): no
  existen proyectos con ese formato.
- `solution.md` lleva:
  - arriba, la identificación (App, Module, Category, Pattern Name, Object Name,
    Object Type, Object Path, fecha de análisis) y el "Estado sugerido en AI Mentor"
    con una justificación de una línea (review, redo);
  - `## Consultar antes de implementar`, justo después del estado sugerido y solo si
    hay algo que consultar (cambio de comportamiento, observaciones fuera del alcance,
    una alternativa que depende de algo fuera del módulo, o puntos no verificados que
    el usuario no puede confirmar solo): lista corta de preguntas listas para copiar,
    sin indicar a quién van ni mencionar personas, roles ni equipos. No va en el PDF.
    En el chat, "Requiere consulta" y cuántos puntos (escriben review y redo; lo leen
    status, que lista aparte los `draft` e `implemented` que lo tienen, y fix, que
    exige confirmar que las consultas se resolvieron);
  - "Alternativas consideradas", siempre con la "Alternativa mínima": la de menor
    cambio que elimina el patrón sin alterar el comportamiento, y con "Retirarlo" si
    el código hoy no tiene efecto, junto a lo que habría que confirmar antes (review,
    redo);
  - `## Cambio de comportamiento`, solo si la solución hace algo más que eliminar el
    patrón; empieza con "Requiere decisión funcional" (escriben review y redo; lo leen
    fix y close);
  - `## Hallazgos relacionados`, solo si otro hallazgo de `_progress.md` toca el mismo
    elemento, tema o acción compartida: identificados por pantalla y patrón, sin ID
    (en el chat sí va el ID), con la indicación de si conviene corregirlos juntos para
    publicar una sola vez; va antes de las observaciones (review, redo);
  - `## Observaciones fuera del alcance`, solo si hay: último apartado del análisis,
    antes de `## Pospuesto` y `## Cierre` (review, redo);
  - los identificadores (clases CSS, nombres de acciones, rutas), entre comillas
    invertidas;
  - `## Cierre` (estado final, fecha y, según el caso, lo verificado o la justificación
    y quién aprobó; si un `implemented` se cierra sin `Fixed`, también si el cambio de
    `/am:fix` se revierte) que escribe close y lee summary;
  - `## Pospuesto` (fecha y motivo de un Remind me later) que escribe close.

## Estados de AI Mentor

- Estado sugerido (review, redo): `Open`, `Already fixed`, `False positive`,
  `Won't fix`, `Remind me later`. Nunca `False positive` ni `Won't fix` sin explicar
  qué se verificó en el código. No va en el PDF.
- Estado final (close):
  - `Fixed`: con imágenes en `evidence/`.
  - `Already fixed`: con imágenes en `evidence/` y lo verificado.
  - `False positive`: justificación escrita y quién aprobó, ambos obligatorios.
  - `Won't fix`: justificación escrita y quién aprobó, ambos obligatorios.
- `Remind me later` no cierra: el estado no cambia (`draft` o `implemented`) y el
  motivo va en `## Pospuesto`.
- El plugin nunca cambia el estado en AI Mentor; solo lo recomienda.

## Reglas de diseño que no se rompen

- **OutSystems es solo lectura** en todos los comandos, excepto `/am:fix`, que exige:
  conexión con escritura, ambiente de Desarrollo y confirmación explícita del plan de
  cambio dentro de esa misma invocación. `/am:fix` mantiene `disable-model-invocation: true`.
  Si `solution.md` tiene `## Cambio de comportamiento`, `/am:fix` se niega a implementar
  sin que el usuario confirme, en esa invocación, que la decisión funcional se tomó.
  Si tiene `## Consultar antes de implementar`, muestra las preguntas y se detiene sin
  un sí, dado en esa invocación, a que ya se resolvieron. Son dos comprobaciones
  separadas: el sí de una no vale para la otra.
- **Solución sin sorpresas:** review y redo incluyen siempre la alternativa mínima,
  consideran referenciar una Server Action o Service Action antes de proponer un REST
  de otro módulo del mismo ambiente, declaran todo cambio de comportamiento
  ("Requiere decisión funcional" en el chat) y dejan lo de otra categoría (seguridad,
  datos, bug) en "Observaciones fuera del alcance", destacado en el chat.
  Ningún comando cambia el estado del hallazgo en AI Mentor.
- **Un hallazgo a la vez:** `/am:review` se detiene tras cada hallazgo y pregunta antes de
  seguir; `/am:fix` atiende un solo ID por invocación.
- **Nunca afirmar que algo fue corregido o validado** sin confirmación del usuario.
  Lo no verificado se marca "No verificado: ...". Implementado no es validado.
- **Nunca borrar:** `/am:clean` archiva en `reports/_archive/<fecha>/`, incluidas las
  filas que quita (`_progress-removed.md`); lista lo que va a mover y espera un sí;
  `all` exige que el usuario escriba `ARCHIVAR TODO`. clean nunca reduce `Last`; con
  `all`, el `_progress.md` nuevo conserva la sección `Prefixes` con sus valores.
- **Estados del progreso:** `pending`, `draft`, `implemented`, `closed`, `skipped`. Si
  un cambio agrega o renombra un estado, actualizarlo en todos los comandos que lo usan
  (hoy: los siete) y en el README (tabla y diagrama).
- **Bloque "Referencia rápida" sincronizado:** close, redo, fix, clean, status y
  summary llevan un bloque idéntico (columnas de `_progress.md`, valores de
  `Doc status` y `Final status`, nombres de carpeta y PDF, script de PDF) para no
  depender de leer `review.md`, que sigue siendo la referencia completa. Si cambia algo
  de eso, se actualiza `review.md` y el bloque en los seis, y se comprueba que sigue
  idéntico.
- **close no deja cierres a medias:** comprueba que se puede generar el PDF antes de
  escribir `## Cierre`.
- **PDF de solución, siempre seis secciones:**
  1. Identificación del hallazgo: ocho etiquetas fijas, en este orden y sin traducir
     (App, Module, Category, Pattern Name, Object Name, Object Type, Object Path,
     Fecha de análisis; sin ID)
  2. Módulo afectado
  3. Descripción de la causa identificada (si hay observaciones fuera del alcance,
     termina con una sola línea que dice que se reportan por separado, sin detalle;
     en pasado solo en el PDF final y si el usuario confirmó en close que ya las
     reportó, lo que queda anotado en `## Cierre`)
  4. Solución aplicada ("Solución propuesta" mientras es borrador; con el apartado
     "Cambio de comportamiento" si `solution.md` lo tiene)
  5. Evidencia de corrección
  6. Estado final de la atención (si el hallazgo estaba `implemented` y se cierra sin
     `Fixed`, lleva una línea con el estado del cambio hecho por `/am:fix`: revertido,
     solo con confirmación del usuario, o sigue en OutSystems)

  El script no deja una sección sola en la última página ni separa un título de su
  contenido. Los identificadores van en fuente monoespaciada y no se parten al final
  de la línea; el título del documento va en la fuente normal de los títulos.
- **El PDF nunca afirma más que `solution.md`:** si la guía dice "No verificado" o
  "probable", el PDF usa la misma cautela (review, redo, close). "Consultar antes de
  implementar" y "Hallazgos relacionados" no van en el PDF.
- **Sin secretos ni datos personales en la salida:** ningún comando copia a `.md`, PDF ni
  al chat el valor de un secreto, credencial, token o dato personal; solo el nombre y la
  ruta del elemento. Todo comando nuevo debe incluir esta regla.
- **Repo genérico y público:** nada de nombres de clientes, correos, rutas de la máquina
  del usuario, reportes, Excel ni PDF. Si el usuario pasa un ejemplo real para explicar
  un cambio, no se copia al repo (se usa uno genérico, como `Ventas-ValidarPedido`).
  `.gitignore` excluye `reports/`, `reportes/`, `*.xlsx` y `*.pdf`; no quitar esas
  entradas.

## Al hacer cualquier cambio

1. Antes de editar, decir qué archivos se van a tocar y por qué.
2. Mantener la coherencia entre comandos: si cambia la estructura de carpetas, el formato
   de `_progress.md` o el de los documentos, revisar los siete archivos de `commands/`.
   El bloque "Referencia rápida" debe quedar idéntico en los seis comandos que lo llevan.
3. Actualizar el README si cambia un comando, su argumento o su uso.
4. Subir la versión en `plugins/am/.claude-plugin/plugin.json` y en el badge del README
   (semver: patch para ajustes de texto, minor para comandos o comportamiento nuevo).
5. Validar que `marketplace.json` y `plugin.json` siguen siendo JSON válido, y que el
   diagrama Mermaid del README sigue siendo válido (los `:` dentro de una etiqueta se
   escriben `#58;`).
6. Mostrar el diff resumido.
7. **Nunca ejecutar `git commit` ni `git push`, ni siquiera si el usuario lo pide.** El
   usuario hace los commits. Al terminar cada cambio, proponer un mensaje en formato
   Conventional Commits:
   - Tipos: `feat`, `fix`, `docs`, `chore`.
   - Alcance: el nombre del comando cuando aplique, p. ej. `feat(close): ...`.
   - En español; primera línea de máximo 72 caracteres.
   - Nunca incluir líneas `Co-Authored-By` ni "Generated with".
