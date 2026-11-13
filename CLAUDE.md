# CLAUDE.md — mantenimiento del plugin `am`

Plugin de Claude Code que documenta hallazgos de deuda técnica que AI Mentor reporta
sobre aplicaciones OutSystems. Repo público: github.com/nuki23/am-plugin.

## Estructura

```
.claude-plugin/marketplace.json     marketplace "nuki23" (owner "nuki23")
plugins/am/.claude-plugin/plugin.json   plugin "am" + versión (author "nuki23")
plugins/am/commands/<nombre>.md     un archivo por comando → /am:<nombre>
plugins/am/scripts/                 generador fijo de PDF: generate_pdf.cjs (diseño),
                                    pdfkit.bundle.cjs (PDFKit empaquetado, MIT) y
                                    PDF-FORMAT.md (formato de los datos)
README.md
```

- Plugin `am`, marketplace `nuki23`: `/plugin marketplace add nuki23/am-plugin`,
  `/plugin install am@nuki23`, `/plugin marketplace update nuki23`. Si cambia el nombre,
  actualizar `marketplace.json`, `plugin.json` y el README a la vez.
- Comandos actuales (siete): `review`, `close`, `fix`, `redo`, `status`, `summary`,
  `clean`. `fix` y `clean` llevan `disable-model-invocation: true`.
- **Idioma:** nombres internos (archivos, carpetas, columnas, estados) en inglés;
  contenido de los documentos y textos de los comandos, en español. Los encabezados
  dentro de `solution.md` (`## Cierre`, `## Pospuesto`) son contenido, igual que las
  etiquetas que el script pone en el PDF. Los campos del archivo de datos
  (`affected`, `cause`, `kind`...) son nombres internos; sus valores `antes`,
  `despues` y `validacion` los fija el script.
- Salida que generan los comandos (en el proyecto del usuario, nunca en este repo):
  - `reports/_progress.md`
  - `reports/_print.json` (datos de la última impresión de PDF; un único archivo
    temporal que se sobrescribe, no se borra y no se crea por hallazgo)
  - `reports/_summaries/summary-AAAA-MM-DD.md` y `.pdf`
  - `reports/_archive/<AAAA-MM-DD>/` (solo `/am:clean`; los demás comandos lo ignoran)
  - `reports/<Module>/<ID>-<Object Name>/` con `solution.md`,
    `<Module>-<Parent>-<Object Name>-<Prefix>.pdf`, `implementation.md` (solo si pasó
    por `/am:fix`) y `evidence/`.
- **Nombres de archivo** (regla de referencia en `commands/review.md`): se limpian
  espacios y `\ / : * ? " < > |`; el PDF es único en `reports/` (sufijo `-2`, `-3` si
  choca) y redo/close reutilizan el nombre existente al regenerarlo. `<Parent>` es el
  segmento anterior al último de `Object Path`; se omite si no hay o es el módulo. El
  título del PDF es `<Parent> › <Object Name>`.
- **ID interno** (`SRC-001`): solo en `_progress.md`, en el nombre de la carpeta y en el
  chat. Nunca en `solution.md`, `implementation.md` ni en ningún PDF.
- **PDF:** todos los dibuja el script fijo de `plugins/am/scripts/`, para que sean
  iguales en todos los proyectos. La regla de referencia es la sección "Generación de
  PDF" de `commands/review.md` más `scripts/PDF-FORMAT.md` (campos, campos
  obligatorios, bloques y códigos de salida); redo, close y summary las referencian.
  - **Cómo se ejecuta:** `node "${CLAUDE_PLUGIN_ROOT}/scripts/generate_pdf.cjs"
    "reports/_print.json" "<salida>.pdf"`. Claude Code sustituye la variable en el
    cuerpo del comando; no existe como variable de entorno en Bash. Si la ruta no
    resuelve, los comandos buscan en
    `~/.claude/plugins/cache/nuki23/am/<versión>/scripts/`; si tampoco está, se
    detienen. El script no se copia al proyecto.
  - **Solo Node, sin npm:** los comandos comprueban `node --version`. La librería va
    en `pdfkit.bundle.cjs`; no se instala nada. Sin Node, queda `solution.md`, se
    avisa que el PDF queda pendiente y el hallazgo no se marca `closed`.
  - **Datos:** review, redo y close escriben `reports/_print.json` con
    `"type": "finding"` y `baseDir` = la carpeta del hallazgo; summary, con
    `"type": "summary"`. `state` sale del estado del hallazgo (`draft`, `fixed`,
    `already-fixed`, `false-positive`, `wont-fix`); la etiqueta, el título de la
    sección 4 y la sección 6 los pone el script. Fechas en formato `12 nov 2026`.
  - **Códigos de salida:** 0 correcto; 3 faltó una imagen (corregir la ruta y
    repetir; si no es PNG ni JPG, pedir convertirla); 1 no se pudo escribir (PDF
    abierto en un visor: pedir cerrarlo); 2 datos no válidos (corregir `_print.json`
    y repetir); 4 error inesperado (mostrar el mensaje y detenerse). El script valida
    los campos obligatorios: los comandos no repiten esa validación, manejan el 2.
  - **Versión del script:** el número del primer comentario de `generate_pdf.cjs`
    ("versión N") y su constante `VERSION`; `PDF-FORMAT.md` lleva el mismo en su
    título.
  - **Proyectos de versiones anteriores:** los archivos que dejaron en el proyecto
    las versiones 0.4.0 y anteriores se ignoran: no se usan, no se actualizan y no se
    borran. Se nombran solo en "Generación de PDF" de `review.md` y en una línea del
    bloque "Referencia rápida"; en ningún otro archivo del repo. `/am:clean all` los
    archiva con todo lo demás.

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
    y quién aprobó; el ambiente, la versión publicada y la fecha de validación, si se
    dieron; quién tomó la decisión funcional, si el cambio aplicado conserva un
    cambio de comportamiento; si un `implemented` se cierra sin `Fixed`, también si
    el cambio de `/am:fix` se revierte) que escribe close y leen summary y redo;
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
  `all` exige que el usuario escriba `ARCHIVAR TODO`. clean nunca archiva ni mueve
  `reports/_print.json`: con `all`, en `reports/` quedan solo `_archive/` y ese
  archivo. clean nunca reduce `Last`; con
  `all`, el `_progress.md` nuevo conserva la sección `Prefixes` con sus valores.
- **Estados del progreso:** `pending`, `draft`, `implemented`, `closed`, `skipped`. Si
  un cambio agrega o renombra un estado, actualizarlo en todos los comandos que lo usan
  (hoy: los siete) y en el README (tabla y diagrama).
- **Bloque "Referencia rápida" sincronizado:** close, redo, fix, clean, status y
  summary llevan un bloque idéntico (columnas de `_progress.md`, valores de
  `Doc status` y `Final status`, nombres de carpeta y PDF, script y generación del
  PDF) para no
  depender de leer `review.md`, que sigue siendo la referencia completa. Si cambia algo
  de eso, se actualiza `review.md` y el bloque en los seis, y se comprueba que sigue
  idéntico.
- **close no deja cierres a medias:** comprueba Node, genera y comprueba el PDF antes
  de escribir `## Cierre` y de marcar `closed`. Si el PDF no sale, el hallazgo sigue
  como estaba. Al cerrar, pregunta en una sola pregunta el ambiente, la versión
  publicada y la fecha de validación (opcionales; lo que falte sale como "—") y los
  anota en `## Cierre`, para que redo pueda regenerar el mismo PDF.
- **PDF de solución, siempre seis secciones**, con el orden y los títulos que pone
  `scripts/generate_pdf.cjs`:
  1. Identificación del hallazgo: cuatro filas fijas, en este orden (App, Módulo,
     Objeto con su tipo, Ruta del objeto; sin ID). Categoría, patrón, fecha de
     análisis y estado van en la ficha de resumen del encabezado y no se repiten en
     la tabla. Si no se conoce el tipo de un tramo de la ruta, se omite. `solution.md`
     conserva sus ocho etiquetas en inglés.
  2. Módulo afectado
  3. Causa identificada (si hay observaciones fuera del alcance, termina con una sola
     `note` con la frase fija de `PDF-FORMAT.md`, sin detalle; en pasado solo en el
     PDF final y si el usuario confirmó en close que ya las reportó, lo que queda
     anotado en `## Cierre`)
  4. Solución aplicada ("Solución propuesta" mientras es borrador, con el `callout`
     "Cambio de comportamiento · Requiere decisión funcional" si `solution.md` lo
     tiene y la tabla de alternativas). Al cerrar se escribe según el estado: en
     `fixed`, lo que se hizo, en pasado y con los pasos bajo "Cambios aplicados" (de
     `implementation.md` o de lo que el usuario confirme; si se aplicó la propuesta,
     sus pasos en pasado sin cambiar el contenido); en los demás, lo que define
     `PDF-FORMAT.md`. En un cierre el recuadro se titula solo "Cambio de
     comportamiento" y dice el cambio que quedó aplicado; close pregunta quién tomó
     la decisión y lo anota en `## Cierre`, no en el PDF. En ningún cierre va la
     tabla de alternativas
  5. Evidencia de corrección (en borrador, una figura sin `file` y con `expect` por
     cada captura prevista; al cerrar, una por imagen de `evidence/`, con `kind`
     según el nombre del archivo y cada `antes` seguido de su `despues`; si el nombre
     no deja claro el tipo, el comando pregunta)
  6. Estado final de la atención (si el hallazgo estaba `implemented` y se cierra sin
     `Fixed`, lleva una fila con el estado del cambio hecho por `/am:fix`: revertido,
     solo con confirmación del usuario, o sigue en OutSystems)

  Lo que cambia según el estado está en la tabla "Qué va en cada estado" de
  `PDF-FORMAT.md`; review, redo y close la aplican tal cual. `affected` y
  `cause` se arman con el contenido de `solution.md`; al regenerar en close o en un
  redo de solo redacción, ese texto se copia tal cual, sin redactarlo de nuevo. La
  regla de copiar no aplica a `solution`, que se escribe según el estado (punto 4). Los
  saltos de página, el corte de los identificadores largos y la fuente del título los
  resuelve el script. Los fragmentos de código no van al PDF, y el diagrama `flow`
  solo si el análisis tiene una secuencia clara de 3 a 5 pasos.
- **Script fijo, sin diseño propio:** los comandos nunca editan `generate_pdf.cjs`,
  `pdfkit.bundle.cjs` ni `PDF-FORMAT.md`, no los copian al proyecto y no generan un
  script propio: solo escriben `reports/_print.json` y ejecutan el del plugin. Si un
  PDF no sale bien, se corrigen los datos. Sin marca ni logo: el color, el encabezado
  y el pie están fijos en el script. No hay archivo de configuración por proyecto y
  no se agrega ninguno. Un cambio de diseño se hace solo en `generate_pdf.cjs`, en
  este repo, por decisión del usuario y subiendo su número de versión (y el de
  `PDF-FORMAT.md` si cambia el formato de los datos).
- **Verificación del PDF:** después de generar, todo comando comprueba que el PDF
  existe y que su fecha es de esa ejecución, y lo lee para confirmar que tiene todas
  sus secciones y las figuras esperadas. El resultado se comprueba en el archivo, no
  solo en el código de salida. Sin esa comprobación el PDF no se da por terminado.
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
   Si cambia algo de `plugins/am/scripts/`, generar los PDF de prueba con datos
   genéricos fuera del repo (los cinco estados y el resumen), llamando al script por
   su ruta dentro del repo, y revisarlos; ningún archivo de `scripts/` se toca sin
   consultarlo antes con el usuario.
6. Mostrar el diff resumido.
7. **Nunca ejecutar `git commit` ni `git push`, ni siquiera si el usuario lo pide.** El
   usuario hace los commits. Al terminar cada cambio, proponer un mensaje en formato
   Conventional Commits:
   - Tipos: `feat`, `fix`, `docs`, `chore`.
   - Alcance: el nombre del comando cuando aplique, p. ej. `feat(close): ...`.
   - En español; primera línea de máximo 72 caracteres.
   - Nunca incluir líneas `Co-Authored-By` ni "Generated with".
