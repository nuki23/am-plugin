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

## Paso 1 — Comprobaciones (si alguna falla, detente)

1. **ID y documentos.** El hallazgo existe en `reports/_progress.md`, está en estado
   `draft` y tiene `solution.md`. Si no, indica que primero va `/am:review`.
2. **Estado sugerido.** Si el "Estado sugerido en AI Mentor" de `solution.md` no es
   `Open`, no hay corrección que implementar: dilo y sugiere `/am:close` o `/am:redo`.
3. **Decisión funcional.** Si `solution.md` tiene el apartado
   `## Cambio de comportamiento` ("Requiere decisión funcional"), la solución hace algo
   más que eliminar el patrón. Muestra lo que dice el apartado y pregunta si la
   decisión funcional ya se tomó y quién la tomó. Sin un sí explícito dentro de esta
   invocación, niégate a implementar y termina; un sí anterior en la conversación no
   cuenta, y la aprobación del plan (Paso 2) no lo reemplaza. Si la decisión fue ir por
   la alternativa mínima u otra distinta de la documentada, no la implementes desde
   aquí: sugiere `/am:redo` para que `solution.md` refleje lo decidido.
4. **Consultas pendientes.** Si `solution.md` tiene el apartado
   `## Consultar antes de implementar`, muestra sus preguntas tal como están y pregunta
   si ya se resolvieron todas. Sin un sí explícito dentro de esta invocación, detente y
   termina; un sí anterior en la conversación no cuenta. Es una comprobación aparte de
   la de decisión funcional: el sí de una no vale para la otra, y la aprobación del
   plan (Paso 2) no reemplaza a ninguna. Si alguna respuesta cambia la solución
   documentada, no la adaptes desde aquí: sugiere `/am:redo`.
5. **Capacidad de escritura.** Revisa qué herramientas de OutSystems tienes disponibles
   en esta sesión. Si ninguna permite editar y publicar, dilo así: "Esta conexión a
   OutSystems es solo lectura; aplica `solution.md` a mano y luego usa `/am:close`", y
   termina. No busques rutas alternas (automatizar el navegador, APIs no documentadas,
   scripts propios).
6. **Ambiente.** Confirma que la conexión apunta a Desarrollo. Si no puedes
   determinarlo, pregunta. Nunca modifiques QA, Preproducción ni Producción, y nunca
   despliegues entre ambientes.
7. **Vigencia del análisis.** Vuelve a leer en OutSystems los elementos que nombra
   `solution.md`. Si ya no coinciden con lo documentado (alguien cambió la pantalla, la
   acción ya no existe, el hallazgo ya fue corregido), detente y sugiere `/am:redo`.
   Lo mismo si al releer ves que los pasos cambian el comportamiento (arreglan un bug,
   activan lógica que hoy no se ejecuta, cambian datos que se escriben o se borran,
   crean integraciones) y `solution.md` no tiene el apartado
   `## Cambio de comportamiento`.
8. **Revisión humana.** Pregunta si el usuario ya leyó y aprueba la solución de
   `solution.md`. Sin un sí, no sigas.

## Paso 2 — Plan de cambio

Muestra, antes de tocar nada:

- Elementos que vas a crear, modificar o eliminar, con nombre y ruta exactos.
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
3. Si la publicación devuelve errores, o advertencias nuevas que antes no estaban,
   detente, muestra el mensaje completo y propón revertir. No intentes arreglarlo con
   más cambios sin confirmación.

## Paso 4 — Verificar y registrar

1. Vuelve a leer los elementos modificados y confirma que quedaron como dice el plan.
2. Escribe `implementation.md` en la carpeta del hallazgo: fecha, ambiente, lista de
   cambios realmente aplicados (elemento por elemento), versión publicada si aplica,
   desviaciones respecto a `solution.md`, y otros hallazgos observados sin tocar. Si
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
