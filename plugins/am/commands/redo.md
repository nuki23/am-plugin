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
PDF ni en `solution.md`.

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
- **Versiones anteriores:** si el proyecto tiene `reports/_template/`, algún
  `solution.html` o un script propio en `scripts/`, se ignoran: no se usan, no se
  actualizan y no se borran.
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
     van entre comillas invertidas; el PDF los muestra en fuente monoespaciada y los
     parte solo en sus separadores.
6. Estado al terminar. Regenera el PDF de solución como indican "Script de PDF" y
   "Generar un PDF" en "Referencia rápida":
   - Comprueba que hay Node con `node --version`. Si no hay, deja `solution.md`
     actualizado, avisa que el PDF queda pendiente porque falta Node y no instales
     nada.
   - Lee `PDF-FORMAT.md` completo y escribe `reports/_print.json` de nuevo (se
     sobrescribe), con `baseDir` = la carpeta del hallazgo.
   - Ejecuta el script reutilizando el nombre del `.pdf` que ya está en la carpeta.
     Si el hallazgo no tenía PDF, usa el nombre de la regla de "PDF de solución".
   - Interpreta el código de salida: 0, correcto; 3, faltó una imagen (corrige la
     ruta y repite); 1, no se pudo escribir (suele ser el PDF abierto en un visor:
     avisa y pide cerrarlo); 2, datos no válidos (corrige `_print.json` con lo que
     lista y repite); 4, error inesperado (muestra el mensaje y detente).
   - Comprueba el resultado: el PDF existe, su fecha es de esta ejecución y, al
     leerlo, están las seis secciones y las figuras esperadas. Sin esa comprobación
     no lo des por terminado.

   El contenido sigue el formato de `/am:review`:
   - `state`: `draft` si el hallazgo queda `draft` o `implemented`; `fixed`,
     `already-fixed`, `false-positive` o `wont-fix`, según `Final status`, si sigue
     `closed`. El script pone solo la etiqueta, el título de la sección 4 y la
     sección 6.
   - `affected` y `cause` (secciones 2 y 3) se arman con el contenido de
     `solution.md`. Si solo cambió la redacción, copia el texto tal cual, sin
     redactarlo otra vez. Correspondencia: listas con viñetas en `list`; los
     fragmentos de código no van al PDF. El diagrama `flow`, solo si el análisis
     tiene una secuencia clara de 3 a 5 pasos.
   - `solution` (sección 4) se escribe según el estado:
     - `draft`: la propuesta, con los pasos manuales en `steps`, el `callout`
       "Cambio de comportamiento · Requiere decisión funcional" si el apartado existe
       en `solution.md`, y las alternativas consideradas en `table`.
     - Si sigue `closed`, con las reglas de `/am:close`. En `fixed`: lo que se hizo,
       en pasado, a partir de `implementation.md` si existe o de lo que registra
       `## Cierre`; si la solución aplicada fue la propuesta, los pasos de
       `solution.md` convertidos a pasado sin cambiar su contenido, bajo un `h`
       "Cambios aplicados". En `already-fixed`, `false-positive` y `wont-fix`, lo
       que define `PDF-FORMAT.md`. El recuadro, si corresponde, se titula solo
       "Cambio de comportamiento". En ningún cierre va la tabla de alternativas.
     - No describas como hecho o validado nada que esas fuentes no confirmen.
   - `parent` y `path` según `Object Path`; si no se conoce el tipo de un tramo, se
     omite su `type`. Fechas en formato `12 nov 2026`.
   - `cause`: si hay observaciones fuera del alcance, termina con una sola `note`,
     con la frase fija de `PDF-FORMAT.md`. Solo va en pasado ("se reportaron por
     separado") en un PDF final cuya sección `## Cierre` registra que el usuario
     confirmó que ya las reportó; si quitas `## Cierre`, vuelve al presente.
   - Evidencia. En `draft`: una figura por cada captura de "Qué pantallazos tomar",
     sin `file` y con `expect`. Si sigue `closed`: una figura por imagen de
     `evidence/`, con `kind` según el nombre del archivo (`antes`, `despues`; las de
     validación, `validacion`) y cada `antes` seguido de su `despues`; si un nombre
     no deja claro el tipo, pregunta. El ambiente, la versión publicada, la fecha de
     validación y los datos de `final` salen de `## Cierre`; lo que no esté ahí se
     omite.
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
