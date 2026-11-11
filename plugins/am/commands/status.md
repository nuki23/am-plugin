---
description: Muestra el avance de los hallazgos por estado (pendiente, borrador, implementado, cerrado, omitido) sin modificar nada
---

# /am:status

Lee `reportes/_progreso.md` y muestra, sin escribir ningún archivo:

- Totales por estado: pendiente, borrador, implementado, cerrado, omitido. Los
  `cerrado`, desglosados por `Estado final` (Resuelto / Won't fix).
- Avance por módulo.
- Los `borrador` e `implementado` que esperan cierre (ID, módulo, elemento,
  `Actualizado`), para saber qué falta corregir o cerrar.
- El siguiente `pendiente` que tomaría `/am:review` (el primero de la tabla).

Si el archivo no tiene las columnas `Estado final` o `Actualizado`, trátalas como vacías
y avisa que el próximo comando que cambie un estado las agregará; no edites el archivo.

Si el archivo no existe, indica que primero hay que correr `/am:review <excel>`.
