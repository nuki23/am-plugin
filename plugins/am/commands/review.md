---
description: Analiza los hallazgos de AI Mentor de un Excel y genera PDF + guía .md por hallazgo, uno a la vez
argument-hint: [ruta-excel]
---

# /am:review

Argumento: `$ARGUMENTS`

Analizas hallazgos de deuda técnica que AI Mentor reporta sobre una aplicación
OutSystems. El usuario aplica las correcciones a mano en Service Studio; tú analizas y
documentas. Los nombres de archivos, carpetas, columnas y estados son en inglés; el
contenido de los documentos, en español.

## Reglas

1. **OutSystems es solo lectura.** Consulta módulos, pantallas, acciones, eventos,
   aggregates y dependencias. Nunca publiques, edites, borres ni cambies el estado de un
   hallazgo. Si dudas de si una herramienta escribe, pregunta antes. La única
   excepción es `/am:fix`, que el usuario invoca explícitamente.
2. **AI Mentor: solo recomiendas.** Nunca cambias el estado de un hallazgo en AI Mentor;
   sugieres uno ("Estado sugerido en AI Mentor") y el usuario decide.
3. **No inventes.** Lo que afirmes sobre el código sale de lo que leíste en OutSystems o
   del Excel. Lo que no pudiste leer va marcado como "No verificado: ...".
4. **Un hallazgo a la vez.** Al terminar cada uno te detienes y pides permiso.
5. **Análisis específico.** Aunque el patrón se repita, causa y pasos nombran los
   elementos reales de ese hallazgo.
6. Solo escribes dentro de `reports/` del proyecto actual.
7. **Sin secretos ni datos personales.** Nunca copies a un `.md`, a un PDF ni al chat el
   valor de un secreto, credencial, token o dato personal (por ejemplo, el valor de una
   Site Property o un correo); solo el nombre y la ruta del elemento.
8. **El ID es interno.** El ID (`SRC-001`) solo aparece en `_progress.md`, en el nombre
   de la carpeta y en el chat. Nunca en `solution.md` ni en un PDF.

## Qué hacer según el argumento

- **Ruta a un .xlsx** → Paso 0 con ese archivo.
- **Sin argumento** → si existe `reports/_progress.md`, continúa con el primer
  `pending` de la tabla (la tabla ya está en el orden de trabajo confirmado); si no
  existe o no queda ningún `pending`, dilo y pide la ruta del Excel.

## Formato de `reports/_progress.md`

Esta es la definición de referencia. Los demás comandos llevan un resumen ("Referencia
rápida") que debe coincidir con ella.

```
# AI Mentor progress

## Prefixes

| Prefix | Pattern Name | Last |
|---|---|---|
| SRC | Server requests in client events | 12 |

## Findings

| ID | Module | Pattern | Element | Object Path | Doc status | Final status | Updated | Folder |
|---|---|---|---|---|---|---|---|---|
```

- `Prefixes`: una fila por cada prefijo usado en el proyecto, venga de la tabla fija o
  sea generado. `Last` es el último consecutivo asignado a ese prefijo (`12` si el
  último ID fue `SRC-012`). Solo `/am:review` lo sube, al asignar un ID; ningún comando
  lo reduce, ni siquiera cuando `/am:clean` archiva filas. Así un ID archivado nunca se
  vuelve a asignar.
- `Doc status`: `pending`, `draft`, `implemented`, `closed` o `skipped`.
- `Final status`:
  - En `closed`: `Fixed`, `Already fixed`, `False positive` o `Won't fix` (lo escribe
    `/am:close`).
  - En `skipped`: el valor de `Snooze Reason Label` del Excel tal cual (lo escribe
    `/am:review`).
  - Vacío en los demás estados.

  Los conteos por estado final solo consideran filas `closed`: el valor de un `skipped`
  nunca cuenta como cierre, aunque el texto coincida.
- `Updated`: fecha `AAAA-MM-DD` del último cambio de `Doc status`. Todo comando que
  cambie el estado la actualiza.
- `Folder`: ruta relativa a `reports/` (`<Module>/<ID>-<Object Name>`), vacía en
  `pending` y `skipped`.
- Las filas van en el orden de trabajo confirmado.
- `reports/_archive/` lo gestiona `/am:clean`; los demás comandos lo ignoran.

## Nombres de archivo

- **Limpieza:** en todo nombre de carpeta o archivo derivado de datos del Excel,
  reemplaza los espacios y los caracteres `\ / : * ? " < > |` por `_`, y quita los
  puntos y espacios del final.
- **Carpeta del hallazgo:** `reports/<Module>/<ID>-<Object Name>/`.
- **PDF de solución:** `<Module>-<Parent>-<Object Name>-<Prefix>.pdf`, por ejemplo
  `Ventas-PedidoDetalle-ValidarPedido-SRC.pdf`. `<Parent>` es el elemento padre en
  `Object Path`: el segmento inmediatamente anterior al último (en
  `Ventas > MainFlow > PedidoDetalle > ValidarPedido`, es `PedidoDetalle`). Si la ruta
  no tiene padre, o el padre es el propio módulo, se omite
  (`<Module>-<Object Name>-<Prefix>.pdf`). Debe ser único en `reports/` (sin contar
  `_archive/`); si ya existe otro con ese nombre, agrega un sufijo numérico
  (`Ventas-PedidoDetalle-ValidarPedido-SRC-2.pdf`). Cuando `/am:redo` o `/am:close`
  regeneran el PDF, reutilizan el nombre del `.pdf` que ya está en la carpeta, para que
  no cambie entre versiones.
- **Título del PDF:** `<Parent> › <Object Name>` (solo `<Object Name>` si no hay
  padre), con los nombres tal cual vienen en el Excel, sin limpiar. El título se
  calcula siempre así, aunque el archivo conserve un nombre anterior. Lo arma el
  script con los campos `parent` y `objectName`.
- **`reports/_print.json`:** los datos de la última impresión de PDF. Es un único
  archivo temporal; no es un hallazgo ni un módulo.

## Prefijos de patrón (referencia fija)

| Prefix | Pattern Name |
|---|---|
| AGR | Automatically generated publicly exposed REST endpoint |
| AQC | Aggregate or SQL query inside a cycle |
| ARS | Avoid setting Anonymous Roles to access Screens |
| CDE | Consuming Deprecated Element |
| CMF | Core module consumed by Foundation |
| CRA | Cyclic references between applications |
| CSS | CSS in the screen's style sheet |
| DUP | Duplicated Code |
| EAS | End-User application providing services |
| EMS | End-User module providing services |
| ERS | Exposed REST services are not secured |
| ESP | Exposed Secrets in Site Properties |
| FCS | Foundation or Core module with screens |
| ICS | Inline CSS style |
| IEL | Inefficient empty list test |
| IGU | Insecure usage of GetUserId function on client context |
| LIM | Large image |
| LLV | Large Local Variable in ViewState |
| LRE | Large resource |
| LRT | Avoid long-running Timers |
| LST | Long Server Requests Timeout |
| LSV | Large Session Variable |
| LUF | Long undocumented flow |
| MDP | Missing descriptions on public element or parameter |
| MSM | Monolithic Service Module |
| MSR | Multiple server requests (Aggregates or actions) inside Client Actions |
| MUI | Monolithic web UI module |
| PER | Public Entities aren't read-only |
| REM | Reminder Comments |
| RRS | Avoid setting Registered Roles to access Screens |
| SCA | Sequence of connected Aggregates |
| SEA | Screen Aggregate exposing System entities on Anonymous screen |
| SER | Screen Aggregate exposing System entities on Registered screen |
| SPU | Site Property update |
| SQI | Vulnerable SQL Injection |
| SRC | Server requests in client events |
| TDC | Too much disabled code |
| TSC | Team strongly coupled with another team |
| UAM | Unused Action in Module |
| UAQ | Unused Aggregate or SQL Query |
| ULO | Unreachable Logic |
| UPT | Unidentified public action managing transaction |
| URA | Unlimited records in Aggregate |
| URS | Unlimited records in SQL query |

## Paso 0 — Preparar

1. Lee el Excel (export "Code Quality Report" de AI Mentor, una hoja). Columnas esperadas:

   | Columna | Uso |
   |---|---|
   | `Module` | Módulo afectado → carpeta de primer nivel |
   | `App`, `Team` | Contexto para la identificación del hallazgo |
   | `Category`, `Pattern Name` | Categoría y patrón |
   | `Object Name`, `Object Type` | Elemento afectado y su tipo |
   | `Object Path` | Ruta completa (`Módulo > Flujo > Pantalla > Acción`). Es la ruta de navegación en Service Studio y, junto con `Pattern Name`, la clave única del hallazgo |
   | `Snooze Reason Label` | Estado: `Open` = por atender; cualquier otro valor = ya gestionado |
   | `Snoozed On/By`, `Snooze Comment` | Quién y por qué lo gestionó, si aplica |
   | `Documentation URL` | Documentación del patrón; léela si viene |

   Si los encabezados no coinciden con esta tabla, muestra los reales y pide confirmar
   el mapeo antes de seguir. No copies a los documentos los correos de
   `Created By Username` ni `Snoozed By Username`.
2. El Excel no trae ID. Asigna uno corto y estable: prefijo de 3 letras + consecutivo
   en el orden del Excel (ejemplo: `SRC-003`). Para el prefijo de cada `Pattern Name`:
   - Busca el patrón por nombre en la tabla "Prefijos de patrón" (arriba) y en la
     sección `Prefixes` de `_progress.md`, sin distinguir mayúsculas ni espacios extra
     y tratando el apóstrofo tipográfico (’) y el recto (') como iguales.
   - Si no está en ninguna de las dos, genera un prefijo de 3 letras mayúsculas que no
     choque con ninguno de los existentes (tabla fija ni sección `Prefixes`) y regístralo
     en la sección `Prefixes` de `_progress.md`.
   - Los ID ya asignados en un `_progress.md` existente no cambian. Un hallazgo nuevo
     toma `Last` + 1 de su prefijo en la sección `Prefixes`, y `Last` se actualiza en
     ese momento. No numeres desde el mayor ID de `Findings`: `/am:clean` pudo archivar
     filas con consecutivos más altos.
   - Si el prefijo aún no tiene fila en `Prefixes` (también los de la tabla fija),
     agrégala con `Last` = 0 antes de numerar.
   - Si un `_progress.md` existente no tiene la columna `Last`, agrégala con el mayor
     consecutivo de cada prefijo en `Findings`, y avisa que desde ahí no se pueden
     conocer los ID que se hayan archivado antes.
3. Crea o actualiza `reports/_progress.md` con el formato de arriba. Estado inicial
   `pending`, `Final status` vacío, `Updated` con la fecha de hoy. Si ya existe,
   respétalo: identifica cada fila por `Pattern Name` + `Object Path`, conserva los ID,
   estados y fechas ya registrados y agrega solo los hallazgos nuevos. Si un hallazgo
   del progreso ya no aparece en un Excel nuevo, no lo borres: avisa, porque puede
   significar que AI Mentor ya lo da por resuelto.
4. Los hallazgos cuyo `Snooze Reason Label` no sea `Open` quedan `skipped`, y en
   `Final status` se guarda el valor tal cual de `Snooze Reason Label`. Si una fila
   `skipped` de un `_progress.md` existente tiene `Final status` vacío, llénalo con ese
   valor.
5. Muestra el resumen (total, por módulo, por patrón) y pregunta qué patrón o patrones
   van primero. Si el usuario indica alguno, ordena por módulo y, dentro de cada módulo,
   primero esos patrones en el orden indicado y luego los demás de mayor a menor
   cantidad. Si no indica ninguno, ordena por módulo y luego por patrón de mayor a menor
   cantidad. Muestra el orden resultante y espera confirmación antes de empezar.
6. Con el orden confirmado (o ajustado por el usuario), reescribe la tabla `Findings`
   en ese orden, sin cambiar el contenido de ninguna fila. Así el primer `pending` de
   la tabla es siempre el siguiente a trabajar.

## Paso 1 — Analizar un hallazgo

1. Lee en OutSystems el elemento afectado y su contexto: quién lo dispara, qué llama,
   qué datos usa y dónde se consumen.
2. Identifica la causa raíz concreta, no la descripción genérica del patrón.
3. Define la solución según buenas prácticas de OutSystems. Si hay varias razonables,
   elige una y anota las alternativas con su costo y riesgo.
   - **Alternativa mínima, siempre.** Entre las alternativas incluye la opción de menor
     cambio que elimina el patrón sin alterar el comportamiento actual, aunque no sea
     la recomendada. Si no existe (el patrón no se puede quitar sin cambiar el
     comportamiento), dilo y explica por qué.
   - **Referencia antes que REST.** Antes de proponer consumir un REST expuesto por
     otro módulo del mismo ambiente, considera referenciar una Server Action o una
     Service Action de ese módulo. Propón el REST solo si explicas por qué la
     referencia no sirve en este caso.
   - **Retirar lo que no tiene efecto.** Si el análisis concluye que el código hoy no
     tiene efecto (no se ejecuta, su resultado no se usa, su condición nunca se
     cumple), "Retirarlo" aparece entre las alternativas, con lo que habría que
     confirmar antes de hacerlo (por ejemplo, que nada más lo consume o que no se
     espera reactivarlo).
4. Evalúa el impacto: qué más consume lo que se va a tocar y qué hay que volver a probar.
5. **Cambio de comportamiento.** Comprueba si la solución recomendada hace algo más que
   eliminar el patrón: arregla un bug, activa lógica que hoy no se ejecuta, cambia
   datos que se escriben o se borran, crea integraciones, o tiene cualquier otro efecto
   que un usuario u otro sistema pueda notar. Si es así, el hallazgo **requiere
   decisión funcional**: lo documentas en el apartado "Cambio de comportamiento"
   (Paso 2) y lo marcas en el reporte (Paso 3). Ante la duda, trátalo como cambio de
   comportamiento.
6. **Hallazgos relacionados.** Revisa en `_progress.md` si otro hallazgo toca el mismo
   elemento, el mismo tema o una acción compartida con este (por ejemplo, otro patrón
   sobre la misma pantalla, o la misma Server Action consumida desde otra pantalla). Si
   los hay, van en el apartado "Hallazgos relacionados" (Paso 2), con la indicación de
   si conviene corregirlos juntos para publicar una sola vez, y en el reporte (Paso 3).
   Esto no cambia la regla de un hallazgo a la vez: solo los señalas, no los analizas
   ni los documentas aquí.
7. **Observaciones fuera del alcance.** Si el análisis encuentra algo de otra categoría
   (seguridad, datos, un bug) que no es parte de este hallazgo, no lo mezcles con la
   solución ni lo corrijas de paso: va en el apartado "Observaciones fuera del alcance"
   (Paso 2) y se destaca en el reporte (Paso 3) para que el usuario lo reporte aparte.
8. **Consultar antes de implementar.** Reúne lo que el usuario tendría que consultar
   antes de aplicar la solución. Hay algo que consultar cuando el hallazgo tiene:
   - "Cambio de comportamiento" (paso 5);
   - "Observaciones fuera del alcance" (paso 7);
   - una alternativa que depende de algo que no está en este módulo;
   - puntos no verificados que el usuario no puede confirmar solo (los que puede
     comprobar él mismo en Service Studio o en la aplicación no cuentan).

   Si hay al menos un punto, el hallazgo **requiere consulta** y se escribe el apartado
   "Consultar antes de implementar" (Paso 2). Si no hay ninguno, el apartado no existe.
9. Elige el **Estado sugerido en AI Mentor**, con una justificación de una línea:
   - `Open`: hay que corregirlo (lo normal; la solución de arriba aplica).
   - `Already fixed`: el problema ya no existe en el código actual.
   - `False positive`: el patrón no aplica a este caso concreto.
   - `Won't fix`: aplica, pero no conviene corregirlo (costo, riesgo, código por retirar).
   - `Remind me later`: conviene posponerlo (por ejemplo, depende de otro cambio).

   Nunca sugieras `False positive` ni `Won't fix` sin explicar qué verificaste en el
   código para llegar a esa conclusión. No fuerces una solución si el estado sugerido
   no es `Open`: documenta la justificación y deja que el usuario decida al cerrar.

## Paso 2 — Generar carpeta y archivos

```
reports/
  _progress.md
  _print.json        (datos de la última impresión; archivo temporal)
  <Module>/
    <ID>-<Object Name>/
      solution.md
      <Module>-<Parent>-<Object Name>-<Prefix>.pdf
      evidence/      (vacía; el usuario pone aquí los pantallazos)
```

**`solution.md`** — guía para hacerlo a mano, seguible sin volver a preguntar. Sin el ID.

- Identificación: App, Module, Category, Pattern Name, Object Name, Object Type,
  Object Path y Fecha de análisis, con esas etiquetas y en ese orden (los comandos que
  regeneran el PDF los toman de aquí).
- **Estado sugerido en AI Mentor:** el valor y su justificación de una línea.
- **Consultar antes de implementar** (`## Consultar antes de implementar`; solo si hay
  algo que consultar, ver Paso 1.8). Va justo aquí, para que sea lo primero que se lea.
  Es una lista corta, un punto por cosa a consultar, cada uno redactado como una
  pregunta lista para copiar y enviar: completa por sí sola, con el nombre del elemento
  y el contexto mínimo para entenderla sin leer el resto del documento. No indiques a
  quién va ni menciones personas, roles ni equipos. Aplican las reglas 7 y 8: sin
  valores de secretos ni datos personales, y sin el ID. No va en el PDF.
- Resumen del hallazgo en dos líneas.
- Dónde está: módulo → flujo/pantalla → elemento, como se navega en Service Studio.
- Por qué AI Mentor lo marca en este caso concreto.
- Cómo se llegó a la solución: qué se revisó, qué se descartó y por qué.
- **Cambio de comportamiento** (`## Cambio de comportamiento`; solo si aplica, ver
  Paso 1.5). Empieza con la línea "Requiere decisión funcional". Luego, explícitamente:
  qué hace hoy el elemento, qué hará después del cambio, qué datos, usuarios o
  integraciones se ven afectados, y que la alternativa mínima elimina el patrón sin
  este cambio. Si la solución solo elimina el patrón, este apartado no existe.
- Pasos manuales numerados, uno por acción en Service Studio, con nombres exactos.
- Alternativas consideradas. Incluye siempre la "Alternativa mínima" (Paso 1.3),
  rotulada así, con su costo y riesgo; si es la recomendada, dilo. Si el código hoy no
  tiene efecto, incluye también "Retirarlo", con lo que habría que confirmar antes.
- Impacto y qué probar después (casos funcionales concretos).
- Cómo verificar en AI Mentor tras republicar y reanalizar.
- Qué pantallazos tomar para la evidencia (antes / después / AI Mentor).
- Puntos no verificados, si los hay.
- **Hallazgos relacionados** (`## Hallazgos relacionados`; solo si hay, ver Paso 1.6).
  Una entrada por hallazgo, identificado por su pantalla (o elemento) y su patrón,
  nunca por el ID; qué comparte con este (elemento, tema o acción) y si conviene
  corregirlos juntos para publicar una sola vez, con el motivo.
- **Observaciones fuera del alcance** (`## Observaciones fuera del alcance`; solo si
  hay, ver Paso 1.7). Es el último apartado del análisis: una entrada por observación
  con su categoría (seguridad, datos, bug...), dónde está y por qué importa. Aplica la
  regla 7: nunca el valor de un secreto o dato personal. Las secciones `## Pospuesto` y
  `## Cierre` que escribe `/am:close` van después.

En todo `solution.md`, los identificadores (clases CSS, nombres de acciones, pantallas,
entidades, variables y rutas) van entre comillas invertidas, para que el PDF los
muestre en fuente monoespaciada.

**PDF de solución** — documento formal, sin el ID. Lo dibuja el script fijo del plugin
a partir de un archivo de datos; el cómo está en "Generación de PDF" (abajo). El título
es el de "Nombres de archivo" y las secciones son siempre estas seis, con el orden y
los títulos que pone el script:

1. Identificación del hallazgo: cuatro filas fijas, en este orden y con estas
   etiquetas: App, Módulo, Objeto (con el tipo de objeto al lado) y Ruta del objeto
   (un tramo de `Object Path` por línea). Categoría, patrón y fecha de análisis van en
   la ficha de resumen del encabezado, junto al estado, y no se repiten en la tabla.
   `solution.md` conserva sus ocho etiquetas.
2. Módulo afectado
3. Causa identificada
4. Solución aplicada ("Solución propuesta" mientras es borrador)
5. Evidencia de corrección
6. Estado final de la atención

El estado sugerido en AI Mentor es una recomendación interna: no va en el PDF. Tampoco
van "Consultar antes de implementar" ni "Hallazgos relacionados".

**El PDF nunca afirma algo con más certeza que `solution.md`.** Si allí dice "No
verificado", "probable", "al parecer" o cualquier otra cautela, el PDF la conserva con
el mismo alcance: resumir no es motivo para convertir una hipótesis en un hecho. Esto
vale para las seis secciones, en borrador y en final.

Aquí la corrección aún no existe, así que el documento sale como **borrador**
(`"state": "draft"`). Nunca escribas que algo fue corregido o validado sin confirmación
del usuario.

### Generación de PDF

Esta sección es la referencia para `/am:review`, `/am:redo`, `/am:close` y
`/am:summary`. Todos los PDF los dibuja el mismo script fijo, que viene con el plugin,
para que sean iguales en todos los proyectos.

- Los archivos están en el plugin y no se copian al proyecto:
  - `${CLAUDE_PLUGIN_ROOT}/scripts/generate_pdf.cjs`: el generador, con el diseño.
  - `${CLAUDE_PLUGIN_ROOT}/scripts/pdfkit.bundle.cjs`: la librería de PDF, ya incluida.
  - `${CLAUDE_PLUGIN_ROOT}/scripts/PDF-FORMAT.md`: el formato de los datos. Léelo
    completo antes de escribirlos.
- Nunca edites el script ni generes uno propio. Si un PDF no sale bien, se corrigen
  los datos.
- No hay marca, logo ni archivo de configuración por proyecto, y no se agrega ninguno.
  El color, el encabezado y el pie están fijos en el script.
- **Versiones anteriores.** Si el proyecto tiene `reports/_template/`, algún
  `solution.html` o un script propio en `scripts/`, son de versiones anteriores del
  plugin: ignóralos. No los uses, no los actualices y no los borres.

**1. Node y script.** Comprueba que hay Node con `node --version`. Si no hay: genera
`solution.md`, avisa que el PDF queda pendiente porque falta Node y no instales nada.
El hallazgo no se marca `closed` sin su PDF. No se usa npm: la librería ya viene en
`pdfkit.bundle.cjs`. No busques otra forma de generar el PDF.

Si `${CLAUDE_PLUGIN_ROOT}/scripts/` no existe (la ruta no apunta a una carpeta real),
busca `scripts/generate_pdf.cjs` en la versión más alta de
`~/.claude/plugins/cache/nuki23/am/`. Si tampoco está ahí, detente y pide actualizar
el plugin (`/plugin marketplace update nuki23`).

**2. Datos.** Escribe `reports/_print.json`, en UTF-8, siguiendo `PDF-FORMAT.md` al pie
de la letra. Es un único archivo temporal: se sobrescribe en cada impresión, no se
borra después y no se crea uno por hallazgo.

- `"type": "finding"` y `"baseDir"` = la carpeta del hallazgo.
- `"state"` sale del estado del hallazgo: `draft` en review y en redo sin cierre;
  `fixed`, `already-fixed`, `false-positive` o `wont-fix` en close. El script pone
  solo la etiqueta del encabezado, el estado de la ficha, el título de la sección 4 y
  el contenido fijo de la sección 6: no los escribas tú.
- `app`, `module`, `category`, `pattern`, `objectName`, `objectType`: de la
  identificación de `solution.md`. `parent`: el de "Nombres de archivo"; se omite si no
  hay o es el módulo. `path`: un elemento por tramo de `Object Path`; si no conoces el
  tipo de un tramo, omite su `type`, no lo inventes.
- **Fechas** (`analysisDate`, `closedOn`, `validatedOn`): en formato `12 nov 2026`
  (día, mes abreviado en minúsculas y año).
- `affected`, `cause` y `solution` se arman con el contenido de `solution.md`:
  - `affected` (sección 2): el resumen del hallazgo y dónde está.
  - `cause` (sección 3): por qué AI Mentor lo marca en este caso y cómo se llegó a la
    solución.
  - `solution` (sección 4), en borrador: la propuesta, los pasos, el impacto y qué
    probar, el cambio de comportamiento (si lo hay) y las alternativas consideradas.

  Cuando se regenera el PDF en `/am:close` o en un `/am:redo` de solo redacción,
  `affected` y `cause` se copian de `solution.md` tal cual, sin redactarlos de nuevo,
  para que las secciones 2 y 3 del PDF final digan lo mismo que el borrador. `solution`
  no se copia: al cerrar se escribe según el estado, como indica `/am:close` (en
  `fixed`, lo que se hizo, en pasado y bajo el subtítulo "Cambios aplicados").
- Correspondencia con los bloques de `PDF-FORMAT.md`:

  | En `solution.md` | Bloque |
  |---|---|
  | Párrafos | `p` |
  | Listas con viñetas | `list` |
  | Pasos manuales | `steps` (los subpasos, en `sub`) |
  | Cambio de comportamiento | `callout` con el título "Cambio de comportamiento · Requiere decisión funcional"; si tiene varios párrafos, `text` es una lista. Al cerrar, el título es solo "Cambio de comportamiento" |
  | Alternativas consideradas | `h` + `table` (Alternativa, Costo, Riesgo), con la "Alternativa mínima" rotulada así. Solo en `draft`: en ningún cierre |
  | Observaciones fuera del alcance | Una sola `note` al final de `cause`, con la frase fija de `PDF-FORMAT.md`, sin detalle, categoría ni cantidad. En pasado solo si `/am:close` confirmó que ya se reportaron |
  | Fragmentos de código | No van al PDF |

  El diagrama `flow` va solo si el análisis tiene una secuencia clara de 3 a 5 pasos;
  los nodos con el problema llevan `"hit": true`. Si no la tiene, no lo incluyas.
- **Identificadores:** lo que en `solution.md` va entre comillas invertidas (clases
  CSS, nombres de acciones y demás elementos, rutas) va igual en los datos, cada uno
  entre las suyas. El script los pone en fuente monoespaciada y los parte solo en sus
  separadores. El formato no se combina: una negrita con un identificador dentro queda
  solo como identificador.
- **Evidencia en `draft`:** una figura por cada captura de "Qué pantallazos tomar" de
  `solution.md`, sin `file`, con `kind`, `caption` y `expect` (qué captura se espera).
  Si no hay capturas previstas, no pongas `figures` ni `text`: el script escribe la
  línea fija de la sección 5. La evidencia al cerrar está en `/am:close`.
- Valen las reglas de siempre: sin el ID en ningún texto, sin valores de secretos ni
  datos personales, y con la misma cautela que `solution.md`.

**3. Ejecución.** Desde la carpeta del proyecto:

```
node "${CLAUDE_PLUGIN_ROOT}/scripts/generate_pdf.cjs" "reports/_print.json" "<salida>.pdf"
```

`<salida>` es la carpeta del hallazgo más el nombre de "Nombres de archivo"; al
regenerar, el del `.pdf` que ya está en la carpeta.

**4. Código de salida.** Como indica `PDF-FORMAT.md`:

| Código | Qué pasó | Qué haces |
|---|---|---|
| 0 | PDF generado | Sigue con la comprobación |
| 3 | Se generó, pero faltó una imagen (la lista en `AVISO:`) | Corrige la ruta en `_print.json` y repite. Si la imagen no es PNG ni JPG (por ejemplo, webp o gif), avisa y pide convertirla; no instales nada para convertirla |
| 1 | No se pudo escribir (suele ser el PDF abierto en un visor) | Avisa y pide cerrarlo; luego repite |
| 2 | Datos no válidos; el script lista qué falta | Corrige `_print.json` y repite |
| 4 | Error inesperado | Muestra el mensaje y detente |

**5. Comprobación.** El resultado se comprueba en el archivo, no solo en el código de
salida. Lee el PDF y verifica que:

- existe, no está vacío y su fecha de modificación es de esta ejecución;
- tiene las seis secciones, del 01 al 06, con sus títulos, y el título del documento;
- tiene las figuras esperadas: en borrador, un marco por cada captura prevista con su
  texto; al cerrar, cada figura muestra su captura;
- la sección 1 tiene sus cuatro filas y la ficha del encabezado sus cuatro datos;
- ningún texto lleva el ID ni afirma más que `solution.md`.

Si algo falla, corrige `reports/_print.json` y ejecuta de nuevo. Sin esta comprobación
el PDF no se da por terminado.

**Resumen (`/am:summary`).** Mismo método con `"type": "summary"`: los datos van en el
mismo `reports/_print.json` y la salida es
`reports/_summaries/summary-<AAAA-MM-DD>.pdf`. Se comprueba igual (ocho secciones en
lugar de seis).

## Paso 3 — Registrar y preguntar

1. Actualiza la fila en `_progress.md`: `Doc status` = `draft`, `Updated` = hoy,
   `Folder` = la carpeta creada.
2. Reporta en pocas líneas: ID, hallazgo, causa, solución, **Estado sugerido en AI
   Mentor** con su justificación, carpeta, nombre del PDF y avance (`N de M`). Si el
   PDF quedó pendiente (falta Node, o el script falló), dilo aquí y por qué. Además,
   cuando aplique y de forma destacada:
   - **Requiere consulta:** dilo con esas palabras y con cuántos puntos hay en
     "Consultar antes de implementar" (por ejemplo, "Requiere consulta: 3 puntos").
   - **Requiere decisión funcional:** qué comportamiento cambia, en una o dos líneas, y
     cuál es la alternativa mínima que no lo cambia. Avisa que `/am:fix` no lo
     implementará sin confirmar que la decisión se tomó.
   - **Hallazgos relacionados:** aquí sí con su ID, además de pantalla y patrón, y si
     conviene corregirlos juntos para publicar una sola vez.
   - **Observaciones fuera del alcance:** cada una con su categoría y dónde está, para
     que el usuario la reporte aparte (sin valores de secretos ni datos personales).
3. Pregunta "¿Sigo con el siguiente (<ID>, <módulo>)?" y detente. Solo continúas con un
   sí explícito. Si piden cambios, corrige ese hallazgo antes de avanzar.
