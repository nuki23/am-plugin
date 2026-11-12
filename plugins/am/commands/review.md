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
6. Solo escribes dentro de `reports/` y `scripts/` del proyecto actual.
7. **Sin secretos ni datos personales.** Nunca copies a un `.md`, a un PDF ni al chat el
   valor de un secreto, credencial, token o dato personal (por ejemplo, el valor de una
   Site Property o un correo); solo el nombre y la ruta del elemento.
8. **El ID es interno.** El ID (`SRC-001`) solo aparece en `_progress.md`, en el nombre
   de la carpeta y en el chat. Nunca en `solution.md` ni en un PDF.

## Qué hacer según el argumento

- **Ruta a un .xlsx** → Paso 0 con ese archivo.
- **Sin argumento** → si existe `reports/_progress.md`, continúa con el primer
  `pending` de la tabla (la tabla ya está en el orden de trabajo confirmado); si no
  existe, pide la ruta del Excel.

## Formato de `reports/_progress.md`

Esta es la definición de referencia; los demás comandos la usan.

```
# AI Mentor progress

## Prefixes

| Prefix | Pattern Name |
|---|---|
| SRC | Server requests in client events |

## Findings

| ID | Module | Pattern | Element | Object Path | Doc status | Final status | Updated | Folder |
|---|---|---|---|---|---|---|---|---|
```

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
- **PDF de solución:** `<Module>-<Object Name>-<Prefix>.pdf`, por ejemplo
  `Ventas-ValidarPedido-SRC.pdf`. Debe ser único en `reports/` (sin contar
  `_archive/`); si ya existe otro con ese nombre, agrega un sufijo numérico
  (`Ventas-ValidarPedido-SRC-2.pdf`). Cuando `/am:redo` o `/am:close` regeneran el PDF,
  reutilizan el nombre del `.pdf` que ya está en la carpeta, para que no cambie entre
  versiones.

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
     continúa el consecutivo desde el mayor ya usado con su prefijo.
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
4. Evalúa el impacto: qué más consume lo que se va a tocar y qué hay que volver a probar.
5. Elige el **Estado sugerido en AI Mentor**, con una justificación de una línea:
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
  <Module>/
    <ID>-<Object Name>/
      solution.md
      <Module>-<Object Name>-<Prefix>.pdf
      evidence/      (vacía; el usuario pone aquí los pantallazos)
```

**`solution.md`** — guía para hacerlo a mano, seguible sin volver a preguntar. Sin el ID.

- Identificación: App, Module, Category, Pattern Name, Object Name, Object Type,
  Object Path y fecha de análisis (los comandos que regeneran el PDF los toman de aquí).
- **Estado sugerido en AI Mentor:** el valor y su justificación de una línea.
- Resumen del hallazgo en dos líneas.
- Dónde está: módulo → flujo/pantalla → elemento, como se navega en Service Studio.
- Por qué AI Mentor lo marca en este caso concreto.
- Cómo se llegó a la solución: qué se revisó, qué se descartó y por qué.
- Pasos manuales numerados, uno por acción en Service Studio, con nombres exactos.
- Alternativas consideradas.
- Impacto y qué probar después (casos funcionales concretos).
- Cómo verificar en AI Mentor tras republicar y reanalizar.
- Qué pantallazos tomar para la evidencia (antes / después / AI Mentor).
- Puntos no verificados, si los hay.

**PDF de solución** — documento formal, sin el ID, con exactamente estas seis secciones:

1. Identificación del hallazgo (App, Module, Category, Pattern Name, Object Name,
   Object Type, Object Path y fecha de análisis)
2. Módulo afectado
3. Descripción de la causa identificada
4. Solución aplicada
5. Evidencia de corrección
6. Estado final de la atención

El estado sugerido en AI Mentor es una recomendación interna: no va en el PDF.

Aquí la corrección aún no existe, así que el PDF sale como **BORRADOR** (marcado
visiblemente): la sección 4 se titula "Solución propuesta", la 5 dice "Pendiente — se
adjunta al cerrar" y la 6 "Pendiente de implementación". Nunca escribas que algo fue
corregido o validado sin confirmación del usuario.

Genera el PDF como indica "Generación de PDF" (abajo), con el nombre de "Nombres de
archivo". Abre el PDF y verifica las seis secciones antes de darlo por terminado.

### Generación de PDF

Esta sección es la referencia para `/am:review`, `/am:redo`, `/am:close` y
`/am:summary`. No asumas que hay Python.

1. **Script existente.** Si ya hay `scripts/generate_pdf.py` o `scripts/generate_pdf.mjs`
   de una sesión anterior, reutiliza ese. Si no soporta los dos tipos de documento,
   extiéndelo sin cambiar el formato del tipo `finding`.
2. **Si no hay script, detecta qué hay disponible** (`python3 --version` /
   `python --version`, `node --version`). Cuenta solo si responde con una versión real
   (Python 3.x o Node); un alias que ofrece instalar desde una tienda no cuenta.
   - Con Python 3 → `scripts/generate_pdf.py` con reportlab.
   - Si no, con Node → `scripts/generate_pdf.mjs` con pdfkit (o una librería
     equivalente).

   Instalar la librería en el lenguaje que ya existe está permitido.
3. **Sin Python ni Node,** no instales un lenguaje por tu cuenta: genera igual los
   `.md`, avisa que el PDF queda pendiente, anótalo en el reporte al usuario y pregunta
   cómo seguir.

El script se crea una sola vez, con un formato uniforme y dos tipos de documento. El
script recibe la ruta de salida; no calcula nombres ni incluye el ID.

- `finding`: las seis secciones de arriba, en modo borrador o final, incluyendo las
  imágenes de la carpeta de evidencia con su descripción. Lo usan `/am:review`,
  `/am:redo` y `/am:close`.
- `summary`: el reporte de `/am:summary` (periodo, cifras, tablas y texto libre).

## Paso 3 — Registrar y preguntar

1. Actualiza la fila en `_progress.md`: `Doc status` = `draft`, `Updated` = hoy,
   `Folder` = la carpeta creada.
2. Reporta en pocas líneas: ID, hallazgo, causa, solución, **Estado sugerido en AI
   Mentor** con su justificación, carpeta, nombre del PDF y avance (`N de M`). Si el
   PDF quedó pendiente por falta de Python o Node, dilo aquí.
3. Pregunta "¿Sigo con el siguiente (<ID>, <módulo>)?" y detente. Solo continúas con un
   sí explícito. Si piden cambios, corrige ese hallazgo antes de avanzar.
