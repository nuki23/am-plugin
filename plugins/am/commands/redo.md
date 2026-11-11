---
description: Rehace el análisis y los documentos de un hallazgo, con la corrección que indique el usuario
argument-hint: <ID> [nota]
---

# /am:redo

Argumentos: `$ARGUMENTS` (el primero es el ID; el resto, si existe, es la nota con lo
que hay que corregir del análisis anterior).

OutSystems es solo lectura: consulta, no publiques ni edites.

Nunca copies a un `.md`, a un PDF ni al chat el valor de un secreto, credencial, token o
dato personal; solo el nombre y la ruta del elemento.

Si `reportes/_progreso.md` no tiene las columnas `Estado final` y `Actualizado`,
agrégalas (vacías) sin perder datos antes de seguir (formato en `/am:review`).

1. Ubica la carpeta del hallazgo en `_progreso.md`. Si el ID no existe, dilo y
   detente. Si está `pendiente` u `omitido`, no hay análisis que rehacer: indica que se
   usa `/am:review`.
2. Lee el `solucion.md` actual, `implementacion.md` si existe, y la nota del usuario. Si
   no dio nota, pregunta qué está mal antes de rehacer.
3. Si el hallazgo está `cerrado`, pregunta antes de sobrescribir: puede bastar con
   corregir la redacción y conservar evidencia y estado final.
4. Vuelve a leer en OutSystems los elementos involucrados; no reutilices conclusiones
   del análisis anterior sin verificarlas.
5. Reescribe `solucion.md` con la misma estructura que usa `/am:review`. No toques la
   carpeta `evidencia/`.
6. Estado al terminar. Regenera `solucion.pdf` (tipo `hallazgo`) como indica
   "Generación de PDF" en `/am:review`; si no hay Python ni Node, avisa que el PDF queda
   pendiente y pregunta cómo seguir.
   - **Si la solución cambió, queda `borrador`**: PDF en modo borrador, vacía
     `Estado final` y quita la sección `## Cierre` de `solucion.md` si existía. Si
     estaba `implementado`, además avisa claramente que lo implementado en OutSystems ya
     no coincide con el documento; conserva `implementacion.md` y agrega al inicio una
     nota: "Corresponde a la solución anterior, reemplazada el AAAA-MM-DD por /am:redo".
   - **Si solo cambió la redacción** (misma causa y misma solución), conserva el estado:
     `borrador` e `implementado` siguen igual (PDF en modo borrador); `cerrado` sigue
     `cerrado`, con `Estado final`, la sección `## Cierre` y el PDF en modo final con la
     evidencia existente.
7. Si el estado cambió, actualiza la fila en `_progreso.md`: `Estado doc`,
   `Estado final` si corresponde, y `Actualizado` = hoy.
8. Resume qué cambió respecto a la versión anterior y en qué estado quedó el hallazgo.

Lo que no puedas verificar va marcado como "No verificado: ...".
