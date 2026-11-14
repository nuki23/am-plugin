---
description: Implementa en OutSystems la solución ya documentada de un hallazgo (requiere conexión con escritura y confirmación explícita)
argument-hint: <ID>
disable-model-invocation: true
---

# /am:fix

ID recibido: `$ARGUMENTS`

Este es el **único** comando del plugin que puede modificar OutSystems, y solo para el
hallazgo indicado. Fuera de este comando la regla sigue siendo solo lectura. Nunca lo
ejecutes por iniciativa propia ni encadenes varios hallazgos: una invocación, un
hallazgo. Nunca cambies el estado del hallazgo en AI Mentor.

Nunca copies a un `.md`, a un PDF ni al chat el valor de un secreto, credencial, token o
dato personal; solo el nombre y la ruta del elemento. Esto incluye el plan de cambio e
`implementation.md`. El ID es interno: no va en `implementation.md`.

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

## Paso 1 — Comprobaciones (si alguna falla, detente)

1. **ID y documentos.** El hallazgo existe en `reports/_progress.md`, está en estado
   `draft` y tiene `solution.md`. Si no, indica que primero va `/am:review`.
2. **Estado sugerido.** Si el "Estado sugerido en AI Mentor" de `solution.md` no es
   `Open`, no hay corrección que implementar: dilo y sugiere `/am:close` o `/am:redo`.
3. **Buenas prácticas.** Si `solution.md` no tiene el apartado
   `## Buenas prácticas aplicadas`, la solución no pasó por las reglas (por ejemplo,
   se documentó con una versión anterior del plugin): no implementes nada, dilo y
   sugiere `/am:redo <ID>`. Si lo tiene, lee `best-practices.md` completo (ubicación
   en "Referencia rápida"; si no está, detente y pide actualizar el plugin) y
   comprueba que los pasos de `solution.md` incluyen las acciones que exigen las
   reglas, tanto las marcadas en el apartado como las que tocan los elementos que los
   pasos crean o modifican: descripciones de acciones y parámetros, cada Aggregate
   creado vacío con solo las entidades necesarias, Max Records, comentario en cada
   consumo de API, qué hace cada acción nueva ante el error. Si falta alguna, detente
   y sugiere `/am:redo`; no la agregues por tu cuenta.
4. **Decisión funcional.** Si `solution.md` tiene el apartado
   `## Cambio de comportamiento` ("Requiere decisión funcional"), la solución hace algo
   más que eliminar el patrón. Muestra lo que dice el apartado y pregunta si la
   decisión funcional ya se tomó y quién la tomó. Sin un sí explícito dentro de esta
   invocación, niégate a implementar y termina; un sí anterior en la conversación no
   cuenta, y la aprobación del plan (Paso 2) no lo reemplaza. Si la decisión fue ir por
   la alternativa mínima u otra distinta de la documentada, no la implementes desde
   aquí: sugiere `/am:redo` para que `solution.md` refleje lo decidido.
5. **Consultas pendientes.** Si `solution.md` tiene el apartado
   `## Consultar antes de implementar`, muestra sus preguntas tal como están y pregunta
   si ya se resolvieron todas. Sin un sí explícito dentro de esta invocación, detente y
   termina; un sí anterior en la conversación no cuenta. Es una comprobación aparte de
   la de decisión funcional: el sí de una no vale para la otra, y la aprobación del
   plan (Paso 2) no reemplaza a ninguna. Si alguna respuesta cambia la solución
   documentada, no la adaptes desde aquí: sugiere `/am:redo`.
6. **Capacidad de escritura.** Revisa qué herramientas de OutSystems tienes disponibles
   en esta sesión. Si ninguna permite editar y publicar, dilo así: "Esta conexión a
   OutSystems es solo lectura; aplica `solution.md` a mano y luego usa `/am:close`", y
   termina. No busques rutas alternas (automatizar la interfaz, APIs no documentadas,
   scripts propios).
7. **Ambiente.** Confirma que la conexión apunta a Desarrollo. Si no puedes
   determinarlo, pregunta. Nunca modifiques QA, Preproducción ni Producción, y nunca
   despliegues entre ambientes.
8. **Vigencia del análisis.** Vuelve a leer en OutSystems los elementos que nombra
   `solution.md`. Si ya no coinciden con lo documentado (alguien cambió la pantalla, la
   acción ya no existe, el hallazgo ya fue corregido), detente y sugiere `/am:redo`.
   Lo mismo si al releer ves que los pasos cambian el comportamiento (arreglan un bug,
   activan lógica que hoy no se ejecuta, cambian datos que se escriben o se borran,
   crean integraciones) y `solution.md` no tiene el apartado
   `## Cambio de comportamiento`.
9. **Revisión humana.** Pregunta si el usuario ya leyó y aprueba la solución de
   `solution.md`. Sin un sí, no sigas.

## Paso 2 — Plan de cambio

Muestra, antes de tocar nada:

- Elementos que vas a crear, modificar o eliminar, con nombre y ruta exactos.
- Las acciones que exigen las buenas prácticas, cada una con el código de su regla:
  por ejemplo, la descripción de cada acción y parámetro nuevo (`DOC-3`), cada
  Aggregate creado vacío con solo las entidades necesarias (`PERF-0`) y con Max
  Records (`PERF-7`), el comentario en cada consumo de API (`DOC-11`) y qué hace cada
  acción nueva ante el error (`SEG-4`, `SEG-5`). Salen de los pasos de `solution.md`;
  no agregues ninguna que no esté ahí.
- Si el hallazgo requiere decisión funcional: el cambio de comportamiento que se va a
  introducir y la decisión confirmada en el Paso 1.
- Qué otros elementos consumen lo que se modifica (impacto).
- Si vas a publicar el módulo al terminar, o si dejas el cambio sin publicar.
- Cómo se revierte (versión del módulo a la que habría que volver).

Pide confirmación explícita. "Sí" a este plan es la única autorización válida; un sí
anterior en la conversación no cuenta.

## Paso 3 — Implementar

1. Aplica solo los pasos de `solution.md` aprobados en el plan. Nada de refactors
   adicionales, renombrados ni "mejoras de paso", aunque veas otros hallazgos en el
   mismo elemento: anótalos y repórtalos al final.
2. Si un paso no se puede aplicar como está escrito, detente y pregunta; no improvises
   una solución distinta.
3. Si la publicación devuelve errores, o advertencias nuevas que antes no estaban
   (la regla `DOC-10` pide que el cambio no deje warnings nuevos), detente, muestra el mensaje completo y propón revertir. No intentes arreglarlo con
   más cambios sin confirmación.

## Paso 4 — Verificar y registrar

1. Vuelve a leer los elementos modificados y confirma que quedaron como dice el plan.
2. Escribe `implementation.md` en la carpeta del hallazgo: fecha, ambiente, lista de
   cambios realmente aplicados (elemento por elemento), versión publicada si aplica,
   desviaciones respecto a `solution.md`, y otros hallazgos observados sin tocar. Sin
   códigos de reglas: `implementation.md` es la fuente de la sección 4 del PDF al
   cerrar como `Fixed`, así que las acciones que exigían las reglas se describen en
   palabras, como cualquier otro cambio. Si
   el hallazgo requería decisión funcional, anota que el usuario confirmó que se tomó,
   quién la tomó (el nombre o rol que dio; nunca un correo) y la fecha. Si tenía
   "Consultar antes de implementar", anota que el usuario confirmó que las consultas
   estaban resueltas y la fecha, sin copiar las respuestas. Si
   `implementation.md` ya existe (por una solución anterior rehecha con `/am:redo`), no
   lo borres: agrega la nueva implementación como sección fechada al final.
3. Actualiza la fila en `_progress.md`: `Doc status` = `implemented`, `Updated` = hoy.
   No lo marques `closed` ni llenes `Final status`.
4. Recuerda al usuario lo que sigue siendo suyo: probar los casos funcionales de
   `solution.md`, verificar en AI Mentor tras el reanálisis, guardar los pantallazos en
   `evidence/` y correr `/am:close <ID>`.

No afirmes que el hallazgo quedó resuelto: implementado no es validado.
