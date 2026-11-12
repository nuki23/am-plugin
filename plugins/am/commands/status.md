---
description: Muestra el avance de los hallazgos por estado (pending, draft, implemented, closed, skipped) sin modificar nada
---

# /am:status

Lee `reports/_progress.md` (formato definido en `/am:review`) y muestra, sin escribir
ningún archivo:

- Totales por estado: `pending`, `draft`, `implemented`, `closed`, `skipped`.
- Los `closed`, desglosados por `Final status`: Fixed, Already fixed, False positive,
  Won't fix.
- Los `skipped` guardan en `Final status` el motivo de AI Mentor (`Snooze Reason
  Label`): puedes desglosarlos por ese motivo, pero nunca los sumes a los `closed`,
  aunque el texto coincida.
- Avance por módulo.
- Los `draft` e `implemented` que esperan cierre (ID, módulo, elemento, `Updated`),
  para saber qué falta corregir o cerrar.
- El siguiente `pending` que tomaría `/am:review` (el primero de la tabla).

Ignora `reports/_archive/`.

Nunca muestres en el chat el valor de un secreto, credencial, token o dato personal;
solo el nombre y la ruta del elemento.

Si el archivo no existe, indica que primero hay que correr `/am:review <excel>`.
