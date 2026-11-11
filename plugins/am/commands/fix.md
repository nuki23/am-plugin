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
hallazgo.

Nunca copies a un `.md`, a un PDF ni al chat el valor de un secreto, credencial, token o
dato personal; solo el nombre y la ruta del elemento. Esto incluye el plan de cambio e
`implementacion.md`.

Si `reportes/_progreso.md` no tiene las columnas `Estado final` y `Actualizado`,
agrégalas (vacías) sin perder datos antes de seguir (formato en `/am:review`).

## Paso 1 — Comprobaciones (si alguna falla, detente)

1. **ID y documentos.** El hallazgo existe en `reportes/_progreso.md`, está en estado
   `borrador` y tiene `solucion.md`. Si no, indica que primero va `/am:review`.
2. **Capacidad de escritura.** Revisa qué herramientas de OutSystems tienes disponibles
   en esta sesión. Si ninguna permite editar y publicar, dilo así: "Esta conexión a
   OutSystems es solo lectura; aplica `solucion.md` a mano y luego usa `/am:close`", y
   termina. No busques rutas alternas (automatizar el navegador, APIs no documentadas,
   scripts propios).
3. **Ambiente.** Confirma que la conexión apunta a Desarrollo. Si no puedes
   determinarlo, pregunta. Nunca modifiques QA, Preproducción ni Producción, y nunca
   despliegues entre ambientes.
4. **Vigencia del análisis.** Vuelve a leer en OutSystems los elementos que nombra
   `solucion.md`. Si ya no coinciden con lo documentado (alguien cambió la pantalla, la
   acción ya no existe, el hallazgo ya fue corregido), detente y sugiere `/am:redo`.
5. **Revisión humana.** Pregunta si el usuario ya leyó y aprueba la solución de
   `solucion.md`. Sin un sí, no sigas.

## Paso 2 — Plan de cambio

Muestra, antes de tocar nada:

- Elementos que vas a crear, modificar o eliminar, con nombre y ruta exactos.
- Qué otros elementos consumen lo que se modifica (impacto).
- Si vas a publicar el módulo al terminar, o si dejas el cambio sin publicar.
- Cómo se revierte (versión del módulo a la que habría que volver).

Pide confirmación explícita. "Sí" a este plan es la única autorización válida; un sí
anterior en la conversación no cuenta.

## Paso 3 — Implementar

1. Aplica solo los pasos de `solucion.md` aprobados en el plan. Nada de refactors
   adicionales, renombrados ni "mejoras de paso", aunque veas otros hallazgos en el
   mismo elemento: anótalos y repórtalos al final.
2. Si un paso no se puede aplicar como está escrito, detente y pregunta; no improvises
   una solución distinta.
3. Si la publicación devuelve errores, o advertencias nuevas que antes no estaban,
   detente, muestra el mensaje completo y propón revertir. No intentes arreglarlo con
   más cambios sin confirmación.
4. No cambies el estado del hallazgo en AI Mentor.

## Paso 4 — Verificar y registrar

1. Vuelve a leer los elementos modificados y confirma que quedaron como dice el plan.
2. Escribe `implementacion.md` en la carpeta del hallazgo: fecha, ambiente, lista de
   cambios realmente aplicados (elemento por elemento), versión publicada si aplica,
   desviaciones respecto a `solucion.md`, y otros hallazgos observados sin tocar. Si
   `implementacion.md` ya existe (por una solución anterior rehecha con `/am:redo`), no
   lo borres: agrega la nueva implementación como sección fechada al final.
3. Actualiza la fila en `_progreso.md`: `Estado doc` = `implementado`, `Actualizado` =
   hoy. No lo marques `cerrado` ni llenes `Estado final`.
4. Recuerda al usuario lo que sigue siendo suyo: probar los casos funcionales de
   `solucion.md`, verificar en AI Mentor tras el reanálisis, guardar los pantallazos en
   `evidencia/` y correr `/am:close <ID>`.

No afirmes que el hallazgo quedó resuelto: implementado no es validado.
