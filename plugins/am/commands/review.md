---
description: Analiza los hallazgos de AI Mentor de un Excel y genera PDF + guía .md por hallazgo, uno a la vez
argument-hint: [ruta-excel]
---

# /am:review

Argumento: `$ARGUMENTS`

Analizas hallazgos de deuda técnica que AI Mentor reporta sobre una aplicación
OutSystems. El usuario aplica las correcciones a mano en Service Studio; tú analizas y
documentas.

## Reglas

1. **OutSystems es solo lectura.** Consulta módulos, pantallas, acciones, eventos,
   aggregates y dependencias. Nunca publiques, edites, borres ni cambies el estado de un
   hallazgo. Si dudas de si una herramienta escribe, pregunta antes. La única
   excepción es `/am:fix`, que el usuario invoca explícitamente.
2. **No inventes.** Lo que afirmes sobre el código sale de lo que leíste en OutSystems o
   del Excel. Lo que no pudiste leer va marcado como "No verificado: ...".
3. **Un hallazgo a la vez.** Al terminar cada uno te detienes y pides permiso.
4. **Análisis específico.** Aunque el patrón se repita, causa y pasos nombran los
   elementos reales de ese hallazgo.
5. Solo escribes dentro de `reportes/` y `scripts/` del proyecto actual.

## Qué hacer según el argumento

- **Ruta a un .xlsx** → Paso 0 con ese archivo.
- **Sin argumento** → si existe `reportes/_progreso.md`, continúa con el primer
  `pendiente` de la tabla (la tabla ya está en el orden de trabajo confirmado); si no
  existe, pide la ruta del Excel.

## Formato de `reportes/_progreso.md`

```
# Progreso AI Mentor

## Prefijos

| Prefijo | Pattern Name |
|---|---|
| SRC | Server requests in client events |

## Hallazgos

| ID | Módulo | Patrón | Elemento | Object Path | Estado doc | Estado final | Actualizado | Carpeta |
|---|---|---|---|---|---|---|---|---|
```

- `Estado doc`: `pendiente`, `borrador`, `implementado`, `cerrado` u `omitido`.
- `Estado final`: vacío hasta el cierre; al cerrar, `Resuelto` o `Won't fix`.
- `Actualizado`: fecha `AAAA-MM-DD` del último cambio de `Estado doc`. Todo comando que
  cambie el estado la actualiza.
- Las filas van en el orden de trabajo confirmado.

Si un `_progreso.md` existente no tiene la sección `Prefijos` o las columnas
`Estado final` y `Actualizado`, agrégalas (vacías) sin perder ni reordenar datos.

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
2. El Excel no trae ID. Asigna uno corto y estable por patrón: prefijo de 3 letras +
   consecutivo en el orden del Excel. Prefijos iniciales: `SRC` Server requests in
   client events, `MSR` Multiple server requests inside Client Actions, `CSS` CSS in the
   screen's style sheet, `SCA` Sequence of connected Aggregates, `URA` Unlimited records
   in Aggregate, `LST` Long Server Requests Timeout. Los prefijos en uso se guardan en
   la sección `Prefijos` de `_progreso.md`: antes de asignar, léela y reutiliza lo que
   ya esté. Para un patrón nuevo, inventa un prefijo de 3 letras que no esté en uso y
   agrégalo a esa sección. Ejemplo de ID: `SRC-003`. La carpeta se llama
   `<ID>-<Object Name>`.
3. Crea o actualiza `reportes/_progreso.md` con el formato de arriba. Estado inicial
   `pendiente`, `Estado final` vacío, `Actualizado` con la fecha de hoy. Si ya existe,
   respétalo: identifica cada fila por `Pattern Name` + `Object Path`, conserva los ID,
   estados y fechas ya registrados y agrega solo los hallazgos nuevos. Si un hallazgo
   del progreso ya no aparece en un Excel nuevo, no lo borres: avisa, porque puede
   significar que AI Mentor ya lo da por resuelto.
4. Los hallazgos cuyo `Snooze Reason Label` no sea `Open` quedan `omitido`, con el
   motivo.
5. Muestra el resumen (total, por módulo, por patrón) y el orden propuesto: por módulo
   y, dentro del módulo, primero `Server requests in client events` (prioridad 1) y
   luego los demás patrones de mayor a menor cantidad. Espera confirmación antes de
   empezar.
6. Con el orden confirmado (o ajustado por el usuario), reescribe la tabla `Hallazgos`
   en ese orden, sin cambiar el contenido de ninguna fila. Así el primer `pendiente` de
   la tabla es siempre el siguiente a trabajar.

## Paso 1 — Analizar un hallazgo

1. Lee en OutSystems el elemento afectado y su contexto: quién lo dispara, qué llama,
   qué datos usa y dónde se consumen.
2. Identifica la causa raíz concreta, no la descripción genérica del patrón.
3. Define la solución según buenas prácticas de OutSystems. Si hay varias razonables,
   elige una y anota las alternativas con su costo y riesgo.
4. Evalúa el impacto: qué más consume lo que se va a tocar y qué hay que volver a probar.
5. Si es un falso positivo o no conviene corregirlo, no fuerces una solución: documenta
   la justificación y propón "Won't fix" para que el usuario decida al cerrar.

## Paso 2 — Generar carpeta y archivos

```
reportes/
  _progreso.md
  <Modulo>/
    <ID>-<Object Name>/
      solucion.md
      solucion.pdf
      evidencia/      (vacía; el usuario pone aquí los pantallazos)
```

**`solucion.md`** — guía para hacerlo a mano, seguible sin volver a preguntar:

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

**`solucion.pdf`** — documento formal con exactamente estas seis secciones:

1. Identificación del hallazgo (ID, patrón, categoría, elemento, fecha de análisis)
2. Módulo afectado
3. Descripción de la causa identificada
4. Solución aplicada
5. Evidencia de corrección
6. Estado final de la atención

Aquí la corrección aún no existe, así que el PDF sale como **BORRADOR** (marcado
visiblemente): la sección 4 se titula "Solución propuesta", la 5 dice "Pendiente — se
adjunta al cerrar" y la 6 "Pendiente de implementación". Nunca escribas que algo fue
corregido o validado sin confirmación del usuario.

Genera el PDF como indica "Generación de PDF" (abajo). Abre el PDF y verifica las seis
secciones antes de darlo por terminado.

### Generación de PDF

Esta sección es la referencia para `/am:review`, `/am:redo`, `/am:close` y
`/am:summary`. No asumas que hay Python.

1. **Script existente.** Si ya hay `scripts/generar_pdf.py` o `scripts/generar_pdf.mjs`
   de una sesión anterior, reutiliza ese. Si no soporta los dos tipos de documento,
   extiéndelo sin cambiar el formato del tipo `hallazgo`.
2. **Si no hay script, detecta qué hay disponible** (`python3 --version` /
   `python --version`, `node --version`). Cuenta solo si responde con una versión real
   (Python 3.x o Node); un alias que ofrece instalar desde una tienda no cuenta.
   - Con Python 3 → `scripts/generar_pdf.py` con reportlab.
   - Si no, con Node → `scripts/generar_pdf.mjs` con pdfkit (o una librería
     equivalente).

   Instalar la librería en el lenguaje que ya existe está permitido.
3. **Sin Python ni Node,** no instales un lenguaje por tu cuenta: genera igual los
   `.md`, avisa que el PDF queda pendiente, anótalo en el reporte al usuario y pregunta
   cómo seguir.

El script se crea una sola vez, con un formato uniforme y dos tipos de documento:

- `hallazgo`: las seis secciones de arriba, en modo borrador o final, incluyendo las
  imágenes de la carpeta de evidencia con su descripción. Lo usan `/am:review`,
  `/am:redo` y `/am:close`.
- `resumen`: el reporte de `/am:summary` (periodo, cifras, tablas y texto libre).

## Paso 3 — Registrar y preguntar

1. Actualiza la fila en `_progreso.md`: `Estado doc` = `borrador`, `Actualizado` = hoy.
2. Reporta en pocas líneas: hallazgo, causa, solución, carpeta y avance (`N de M`). Si
   el PDF quedó pendiente por falta de Python o Node, dilo aquí.
3. Pregunta "¿Sigo con el siguiente (<ID>, <módulo>)?" y detente. Solo continúas con un
   sí explícito. Si piden cambios, corrige ese hallazgo antes de avanzar.
