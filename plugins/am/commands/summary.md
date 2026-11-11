---
description: Genera el reporte resumen de avance para la sesión de seguimiento (por defecto, últimos 7 días)
argument-hint: [desde AAAA-MM-DD]
---

# /am:summary

Argumento: `$ARGUMENTS` (fecha de inicio opcional; por defecto, los últimos 7 días).

Genera el resumen para la sesión de seguimiento y calibración. No consultes ni
modifiques OutSystems: trabaja solo con `reportes/`. No modifiques `_progreso.md`.

Nunca copies a un `.md`, a un PDF ni al chat el valor de un secreto, credencial, token o
dato personal; solo el nombre y la ruta del elemento. Si un documento de origen lo
contiene, omítelo en el resumen y avisa.

1. Lee `reportes/_progreso.md`. Un hallazgo está "en el periodo" si su columna
   `Actualizado` cae entre la fecha de inicio y hoy. Si falta la columna o hay filas sin
   fecha, avisa cuántas no se pudieron ubicar en el periodo y no las inventes.
2. Lee `solucion.md` (incluida su sección `## Cierre`) e `implementacion.md`, si existe,
   de los hallazgos `cerrado`, `implementado` o `borrador` del periodo.
3. Escribe `reportes/_resumenes/resumen-<AAAA-MM-DD>.md` con:
   - Periodo cubierto.
   - Cifras del periodo: cerrados (Resuelto / Won't fix), implementados y en borrador.
     Resuelto y Won't fix se cuentan solo entre filas `cerrado`; un `omitido` guarda en
     `Estado final` el motivo de AI Mentor y nunca cuenta como ninguno de los dos.
     Cifras acumuladas: pendientes, borrador, implementados, cerrados, omitidos, total
     y porcentaje de avance.
   - Tabla de hallazgos cerrados en el periodo: ID, módulo, elemento, estado final,
     solución en una línea.
   - Tabla de hallazgos implementados en el periodo que esperan cierre.
   - Won't fix: los hallazgos `cerrado` con `Estado final` = `Won't fix`, con la justificación y
     quién la aprobó (de `## Cierre`). Aparte, los `borrador` cuyo análisis propone
     Won't fix y esperan decisión.
   - Patrones de causa que se repiten y lecciones aprendidas.
   - Dudas técnicas o funcionales abiertas para llevar a la sesión.
   - Plan propuesto para la semana siguiente (qué módulo sigue).
4. Genera el mismo contenido en PDF junto al .md (tipo `resumen`) como indica
   "Generación de PDF" en `/am:review`: reutiliza el script existente o, si no hay,
   créalo con Python o Node según lo disponible. Si no hay ninguno de los dos, deja solo
   el .md, avisa que el PDF queda pendiente y pregunta cómo seguir.
5. Muestra el resumen en pantalla.

Las cifras salen del archivo de progreso, no de estimaciones. Si el porcentaje de AI
Mentor no está disponible, deja el espacio para que el usuario lo complete con el
pantallazo de la sesión.
