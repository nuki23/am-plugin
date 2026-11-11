---
description: Cierra un hallazgo como Resuelto o Won't fix y genera el PDF final con evidencia y estado
argument-hint: <ID>
---

# /am:close

ID recibido: `$ARGUMENTS`

El usuario ya atendió el hallazgo: lo corrigió a mano, lo implementó con `/am:fix` o
decidió no corregirlo. OutSystems sigue siendo solo lectura para ti: no publiques ni
cambies el estado del hallazgo en AI Mentor.

Nunca copies a un `.md`, a un PDF ni al chat el valor de un secreto, credencial, token o
dato personal; solo el nombre y la ruta del elemento. Esto incluye la justificación de
un Won't fix y la descripción de la evidencia.

Si `reportes/_progreso.md` no tiene las columnas `Estado final` y `Actualizado`,
agrégalas (vacías) sin perder datos antes de seguir (formato en `/am:review`).

1. Si no hay ID, muestra los hallazgos en estado `borrador` o `implementado` de
   `_progreso.md` y pregunta cuál cerrar. Si el ID está `pendiente`, indica que primero
   va `/am:review`; si ya está `cerrado`, indica que para corregirlo se usa `/am:redo`.
2. Pregunta el estado final. Solo hay dos válidos:
   - **Resuelto**: la corrección se aplicó.
   - **Won't fix**: se decidió no corregir.

   Si el usuario dice que sigue pendiente, no cierres: deja estado y documentos como
   están, y termina.
3. **Si es Resuelto:**
   - Revisa `evidencia/`. Si no tiene imágenes, avisa y no generes el PDF final.
   - Fuente de la sección 4: si existe `implementacion.md`, úsalo (cambios realmente
     aplicados y desviaciones). Si no existe, pregunta si la solución aplicada fue la
     propuesta o cambió; si cambió, actualiza `solucion.md` con lo que realmente se hizo.
4. **Si es Won't fix:**
   - No exijas imágenes en `evidencia/` (si las hay, inclúyelas).
   - Pide una justificación escrita y quién aprobó la decisión. Sin ambas, no cierres.
5. Agrega (o reemplaza, si ya existe) al final de `solucion.md` una sección `## Cierre`
   con: estado final, fecha y, si es Won't fix, la justificación y quién la aprobó.
6. Regenera `solucion.pdf` (tipo `hallazgo`) como indica "Generación de PDF" en
   `/am:review`, sin la marca de borrador. Si no hay Python ni Node, avisa que el PDF
   final queda pendiente, no marques el hallazgo `cerrado` y pregunta cómo seguir.
   Contenido:
   - Sección 4 "Solución aplicada": lo realmente hecho. Para Won't fix, "No se aplica
     corrección", seguido de la solución que se había propuesto.
   - Sección 5: las imágenes de `evidencia/` con una línea que describa cada una. Para
     Won't fix, la justificación escrita (y las imágenes, si hay).
   - Sección 6: estado final y fecha; para Won't fix, además la justificación resumida
     y quién la aprobó.

   Abre el PDF y verifica que las seis secciones y las imágenes quedaron incluidas.
7. Actualiza la fila en `_progreso.md`: `Estado doc` = `cerrado`, `Estado final` =
   `Resuelto` o `Won't fix`, `Actualizado` = hoy.
8. Reporta la ruta del PDF y cuántos hallazgos quedan en `borrador`, `implementado` y
   `pendiente`.

No afirmes que la corrección fue validada en AI Mentor salvo que el usuario lo diga o
la evidencia lo muestre.
