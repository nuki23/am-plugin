---
description: Rehace el análisis y los documentos de un hallazgo, con la corrección que indique el usuario
argument-hint: <ID> [nota]
---

# /am:redo

Argumentos: `$ARGUMENTS` (el primero es el ID; el resto, si existe, es la nota con lo
que hay que corregir del análisis anterior).

OutSystems es solo lectura: consulta, no publiques ni edites. Nunca cambies el estado
del hallazgo en AI Mentor.

Nunca copies a un `.md`, a un PDF ni al chat el valor de un secreto, credencial, token o
dato personal; solo el nombre y la ruta del elemento. El ID es interno: no va en el PDF
ni en `solution.md`.

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
  `<Parent> > <Object Name>`. No lleva el ID.
- **Script de PDF:** reutiliza `scripts/generate_pdf.py` o `scripts/generate_pdf.mjs`
  si existe. Si no, detecta Python 3 (reportlab) o Node (pdfkit) y créalo con dos tipos
  de documento: `finding` (seis secciones, borrador o final) y `summary`. Puedes
  instalar la librería, nunca el lenguaje. Sin Python ni Node, el PDF queda pendiente:
  avisa y pregunta cómo seguir.
- `reports/_archive/` lo gestiona `/am:clean`; los demás comandos lo ignoran.

## Pasos

1. Ubica la carpeta del hallazgo en `_progress.md`. Si el ID no existe, dilo y
   detente. Si está `pending` o `skipped`, no hay análisis que rehacer: indica que se
   usa `/am:review`.
2. Lee el `solution.md` actual, `implementation.md` si existe, y la nota del usuario.
   Si no dio nota, pregunta qué está mal antes de rehacer.
3. Si el hallazgo está `closed`, pregunta antes de sobrescribir: puede bastar con
   corregir la redacción y conservar evidencia y estado final.
4. Vuelve a leer en OutSystems los elementos involucrados; no reutilices conclusiones
   del análisis anterior sin verificarlas.
5. Reescribe `solution.md` con estas secciones, en este orden y sin el ID:
   - Identificación (App, Module, Category, Pattern Name, Object Name, Object Type,
     Object Path y Fecha de análisis, con esas etiquetas y en ese orden)
   - Estado sugerido en AI Mentor, con su justificación de una línea
   - Consultar antes de implementar (`## Consultar antes de implementar`), solo si hay
     algo que consultar
   - Resumen del hallazgo
   - Dónde está
   - Por qué AI Mentor lo marca
   - Cómo se llegó a la solución
   - Cambio de comportamiento (`## Cambio de comportamiento`), solo si aplica
   - Pasos manuales
   - Alternativas consideradas, siempre con la "Alternativa mínima"
   - Impacto y qué probar después
   - Cómo verificar en AI Mentor
   - Qué pantallazos tomar para la evidencia
   - Puntos no verificados, si los hay
   - Hallazgos relacionados (`## Hallazgos relacionados`), solo si hay
   - Observaciones fuera del alcance (`## Observaciones fuera del alcance`), solo si hay

   Reevalúa el "Estado sugerido en AI Mentor" (nunca `False positive` ni `Won't fix`
   sin explicar qué se verificó). Conserva la sección `## Pospuesto` si existía, después
   de las anteriores. No toques la carpeta `evidence/`.

   Aplica las mismas reglas de análisis que `/am:review`:
   - **Alternativa mínima:** incluye siempre la opción de menor cambio que elimina el
     patrón sin alterar el comportamiento actual, aunque no sea la recomendada; si no
     existe, dilo y explica por qué.
   - **Retirar lo que no tiene efecto:** si el análisis concluye que el código hoy no
     tiene efecto, "Retirarlo" aparece entre las alternativas, con lo que habría que
     confirmar antes.
   - **Referencia antes que REST:** antes de proponer consumir un REST de otro módulo
     del mismo ambiente, considera referenciar una Server Action o una Service Action
     de ese módulo.
   - **Cambio de comportamiento:** si la solución hace algo más que eliminar el patrón
     (arregla un bug, activa lógica que hoy no se ejecuta, cambia datos que se escriben
     o se borran, crea integraciones), escribe el apartado: primera línea "Requiere
     decisión funcional"; luego qué hace hoy, qué hará después, qué se ve afectado y
     que la alternativa mínima lo evita. Si la solución nueva ya no cambia el
     comportamiento, quita el apartado.
   - **Hallazgos relacionados:** revisa en `_progress.md` si otro hallazgo toca el
     mismo elemento, tema o acción compartida. Si los hay, escribe el apartado
     identificándolos por pantalla (o elemento) y patrón, nunca por el ID, e indica si
     conviene corregirlos juntos para publicar una sola vez. Si ya no hay ninguno,
     quita el apartado.
   - **Observaciones fuera del alcance:** lo que encuentres de otra categoría
     (seguridad, datos, bug) va en ese apartado, no en la solución; conserva las
     observaciones anteriores que sigan vigentes.
   - **Consultar antes de implementar:** vuelve a evaluar si hay algo que consultar:
     "Cambio de comportamiento", "Observaciones fuera del alcance", una alternativa que
     depende de algo que no está en este módulo, o puntos no verificados que el usuario
     no puede confirmar solo. Si lo hay, escribe el apartado justo después de "Estado
     sugerido en AI Mentor": una lista corta, cada punto redactado como pregunta lista
     para copiar, sin indicar a quién va ni mencionar personas, roles ni equipos, y sin
     secretos ni datos personales. Si ya no hay nada que consultar (por ejemplo, la
     nota del usuario trae la respuesta), quita el apartado. No va en el PDF.
   - **Identificadores:** clases CSS, nombres de acciones y demás elementos, y rutas,
     van entre comillas invertidas; el PDF los muestra en fuente monoespaciada y sin
     partirlos al final de la línea.
6. Estado al terminar. Regenera el PDF de solución (tipo `finding`), reutilizando el
   nombre del `.pdf` que ya está en la carpeta; si no hay Python ni Node, avisa que el
   PDF queda pendiente y pregunta cómo seguir. El PDF sigue el formato de `/am:review`:
   título `<Parent> > <Object Name>` en fuente normal (no monoespaciada), las ocho etiquetas de la sección 1 (App, Module,
   Category, Pattern Name, Object Name, Object Type, Object Path, Fecha de análisis),
   el apartado "Cambio de comportamiento" en la sección 4 si existe en `solution.md`,
   una sola línea al final de la sección 3 si hay observaciones fuera del alcance
   ("Durante el análisis se identificaron observaciones fuera del alcance de este
   hallazgo; se reportan por separado."), los identificadores en monoespaciada y sin
   partirse, y ninguna sección sola en la última página. Esa línea solo va en pasado
   ("se reportaron por separado") en un PDF final cuya sección `## Cierre` registra
   que el usuario confirmó que ya las reportó; si quitas `## Cierre`, vuelve al
   presente. El PDF nunca afirma algo con más certeza que `solution.md`: si allí dice
   "No verificado" o "probable", el PDF usa la misma cautela.
   - **Si la solución cambió, queda `draft`**: PDF en modo borrador, vacía
     `Final status` y quita la sección `## Cierre` de `solution.md` si existía. Si
     estaba `implemented`, además avisa claramente que lo implementado en OutSystems ya
     no coincide con el documento; conserva `implementation.md` y agrega al inicio una
     nota: "Corresponde a la solución anterior, reemplazada el AAAA-MM-DD por /am:redo".
   - **Si solo cambió la redacción** (misma causa y misma solución), conserva el estado:
     `draft` e `implemented` siguen igual (PDF en modo borrador); `closed` sigue
     `closed`, con `Final status`, la sección `## Cierre` y el PDF en modo final con la
     evidencia existente.
7. Si el estado cambió, actualiza la fila en `_progress.md`: `Doc status`,
   `Final status` si corresponde, y `Updated` = hoy.
8. Resume qué cambió respecto a la versión anterior, el estado sugerido en AI Mentor y
   en qué estado quedó el hallazgo. Destaca, cuando aplique, **Requiere consulta**
   (con esas palabras y cuántos puntos), **Requiere decisión
   funcional** (qué comportamiento cambia y cuál es la alternativa mínima), los
   **Hallazgos relacionados** (en el chat sí con su ID, y si conviene corregirlos
   juntos) y las **Observaciones fuera del alcance**, para que el usuario las reporte
   aparte.

Lo que no puedas verificar va marcado como "No verificado: ...".
