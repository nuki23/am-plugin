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
dato personal; solo el nombre y la ruta del elemento. El ID es interno: no va en el
PDF, en `solution.html` ni en `solution.md`.

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
6. Estado al terminar. Regenera `solution.html` y el PDF de solución como indica
   "Generar un PDF" en "Referencia rápida":
   - Lee `TEMPLATE.md` completo y comprueba la copia de `reports/_template/` (cópiala o
     reemplázala si falta o su versión es menor).
   - Escribe `solution.html` de nuevo a partir de `reports/_template/finding.html`,
     aunque ya exista: no edites el anterior. Sin estilos propios, solo los campos y
     los componentes del catálogo.
   - Imprime con Edge o Chrome reutilizando el nombre del `.pdf` que ya está en la
     carpeta. Si el hallazgo no tenía PDF, usa el nombre de la regla de "PDF de
     solución".
   - Comprueba el resultado: el PDF existe y es de esta ejecución, tiene las seis
     secciones, las imágenes cargaron y el texto se puede extraer.
   - Si no hay Edge ni Chrome, o la impresión falla, deja `solution.html`, avisa que
     el PDF queda pendiente y pregunta cómo seguir.

   El contenido sigue el formato de `/am:review`:
   - Título `<Parent> › <Object Name>`, en la fuente normal de los títulos.
   - Sección 1 con sus cuatro filas (App, Módulo, Objeto con su tipo y Ruta del
     objeto); categoría, patrón y fecha de análisis van en la ficha del encabezado y
     no se repiten en la tabla. Si no se conoce el tipo de un tramo de la ruta, se
     omite.
   - Sección 3, "Causa identificada": si hay observaciones fuera del alcance, termina
     con una sola línea en una nota (`note`): "Durante el análisis se identificaron
     observaciones fuera del alcance de este hallazgo; se reportan por separado." Esa
     línea solo va en pasado ("se reportaron por separado") en un PDF final cuya
     sección `## Cierre` registra que el usuario confirmó que ya las reportó; si
     quitas `## Cierre`, vuelve al presente.
   - Sección 4: el recuadro "Cambio de comportamiento · Requiere decisión funcional"
     si el apartado existe en `solution.md`.
   - Identificadores en `<code>`, cada uno en el suyo; los largos, con
     `<code class="wrap">` y `<wbr>` después de cada separador, para que no se partan
     dentro de un nombre.
   - Lo que cambia según el estado (etiqueta, título de la sección 4, evidencia,
     estado final) sale de la tabla "Qué cambia según el estado" de `TEMPLATE.md`:
     columna "Borrador" si queda `draft` o `implemented`; la del estado final si
     sigue `closed`.
   - El PDF nunca afirma algo con más certeza que `solution.md`: si allí dice "No
     verificado" o "probable", el PDF usa la misma cautela. Sin el ID y sin valores de
     secretos ni datos personales.

   Según lo que cambió:
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
   en qué estado quedó el hallazgo. Si el PDF quedó pendiente, dilo. Destaca, cuando aplique, **Requiere consulta**
   (con esas palabras y cuántos puntos), **Requiere decisión
   funcional** (qué comportamiento cambia y cuál es la alternativa mínima), los
   **Hallazgos relacionados** (en el chat sí con su ID, y si conviene corregirlos
   juntos) y las **Observaciones fuera del alcance**, para que el usuario las reporte
   aparte.

Lo que no puedas verificar va marcado como "No verificado: ...".
