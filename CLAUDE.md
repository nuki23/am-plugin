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
    `<Module>-<Object Name>-<Prefix>.pdf`, `implementation.md` (solo si pasó por
    `/am:fix`) y `evidence/`.
- **Nombres de archivo** (regla de referencia en `commands/review.md`): se limpian
  espacios y `\ / : * ? " < > |`; el PDF es único en `reports/` (sufijo `-2`, `-3` si
  choca) y redo/close reutilizan el nombre existente al regenerarlo.
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
  1. Identificación del hallazgo (App, Module, Category, Pattern Name, Object Name,
     Object Type, Object Path y fecha de análisis; sin ID)
  2. Módulo afectado
  3. Descripción de la causa identificada
  4. Solución aplicada ("Solución propuesta" mientras es borrador)
  5. Evidencia de corrección
  6. Estado final de la atención (si el hallazgo estaba `implemented` y se cierra sin
     `Fixed`, lleva una línea con el estado del cambio hecho por `/am:fix`: revertido,
     solo con confirmación del usuario, o sigue en OutSystems)
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
