# Formato de datos para `generate_pdf.cjs` (versión 1)

El diseño del PDF está fijo en el script. Los comandos solo escriben un archivo de
datos y lo ejecutan:

```
node "<carpeta del plugin>/scripts/generate_pdf.cjs" "reports/_print.json" "<salida>.pdf"
```

- Solo requiere Node. La librería de PDF va incluida en `pdfkit.bundle.cjs`; no se
  instala nada con npm.
- `reports/_print.json` es un único archivo temporal: se sobrescribe en cada
  impresión y no se guarda por hallazgo.
- El script nunca se edita ni se copia modificado. Si el PDF no sale bien, se corrige
  el archivo de datos.

## Resultado

| Código de salida | Significa |
|---|---|
| 0 | PDF generado |
| 3 | PDF generado, pero faltó alguna imagen (se listan en `AVISO:`) |
| 1 | No se pudo escribir el PDF (por ejemplo, está abierto en un visor) |
| 2 | Datos no válidos o argumentos incompletos; lista qué falta y no genera nada |
| 4 | Error inesperado; muestra el mensaje y no genera nada |

En la salida estándar imprime una línea JSON: `{"ok":true,"pdf":"…","pages":3,"warnings":0}`.

## Campos obligatorios

El script revisa los datos antes de dibujar y, si falta algo, termina con código 2 y
dice qué falta.

- Hallazgo: `state`, `app`, `module`, `category`, `pattern`, `objectName`,
  `analysisDate`, y `path`, `affected`, `cause` y `solution` con al menos un elemento.
- Cualquier estado de cierre: `final.closedOn`.
- `fixed` y `already-fixed`: al menos una figura, todas con `file`. `already-fixed`
  además `final.verified`.
- `false-positive` y `wont-fix`: `final.justification` y `final.approvedBy`.
- Toda figura lleva `caption`.
- Resumen: `period` y `sections`, cada una con `title` y `blocks`. `cards` es opcional
  (de cero a cuatro fichas).

## Texto con formato

En cualquier texto se puede usar:

- `` `identificador` `` para módulos, pantallas, acciones, variables, clases y rutas;
- `**negrita**` y `*cursiva*`.

No se combinan entre sí (por ejemplo, negrita con un identificador dentro). Los
identificadores largos se parten solos en sus separadores (`>`, `/`, `.`) y, si hace
falta, entre palabras de un nombre compuesto. Los caracteres que las fuentes no tienen
se sustituyen (`→` por `->`); no uses emojis.

## Hallazgo (`"type": "finding"`)

```json
{
  "type": "finding",
  "state": "draft",
  "baseDir": "reports/Ventas/SRC-001-ValidarPedido",
  "app": "Ventas UI",
  "module": "Ventas_Pedidos",
  "category": "Performance",
  "pattern": "Server requests in client events",
  "parent": "PedidoDetalle",
  "objectName": "ValidarPedido",
  "objectType": "Client Action",
  "analysisDate": "12 nov 2026",
  "path": [
    { "name": "Ventas_Pedidos", "type": "eSpace" },
    { "name": "MainFlow", "type": "Web Flow" },
    { "name": "PedidoDetalle", "type": "Web Screen" },
    { "name": "ValidarPedido", "type": "Client Action" }
  ],
  "affected": [ ],
  "cause": [ ],
  "solution": [ ],
  "evidence": { },
  "final": { }
}
```

| Campo | Contenido |
|---|---|
| `state` | `draft`, `fixed`, `already-fixed`, `false-positive` o `wont-fix` |
| `baseDir` | Carpeta del hallazgo; las imágenes se buscan desde ahí |
| `parent` | Elemento padre del Object Path; se omite si no hay o es el propio módulo |
| `path` | Un elemento por tramo del Object Path; `type` se omite si no se conoce |
| `affected`, `cause`, `solution` | Listas de bloques (ver "Bloques") para las secciones 2, 3 y 4 |

El script pone solo, según `state`: la etiqueta del encabezado, el estado de la ficha,
el título de la sección 4 ("Solución propuesta" o "Solución aplicada") y el contenido
fijo de la sección 6. El ID interno no es un campo: no hay forma de que salga.

### Qué va en cada estado

| Campo | draft | fixed | already-fixed | false-positive | wont-fix |
|---|---|---|---|---|---|
| `solution` | Propuesta, pasos, alcance, cambio de comportamiento, alternativas | Lo realmente hecho | "No se requirió corrección…" y lo verificado | "No se aplica corrección…" y por qué | "No se aplica corrección." y la solución que se había propuesto |
| `evidence.figures` | Capturas previstas, sin `file`, con `expect` | Capturas | Capturas | Opcional | Opcional |
| `evidence.text` | — | — | — | Justificación | Justificación |
| `final` | — | `closedOn` | `closedOn`, `verified` | `closedOn`, `justification`, `approvedBy` | `closedOn`, `justification`, `approvedBy` |

`final.fixChange` solo se incluye si el hallazgo pasó por `/am:fix` y se cierra sin
`fixed`: "revertido" o "sigue en OutSystems".

### Evidencia

```json
"evidence": {
  "environment": "Desarrollo",
  "version": "1.4.2",
  "validatedOn": "14 nov 2026",
  "figures": [
    { "kind": "antes", "file": "evidence/01-antes.png", "caption": "Flujo con la Server Action." },
    { "kind": "despues", "file": "evidence/02-despues.png", "caption": "Flujo sin peticiones." },
    { "kind": "validacion", "file": "evidence/03-network.png", "caption": "Una sola petición al cargar." }
  ],
  "text": [ { "p": "Solo para False positive y Won't fix: la justificación." } ]
}
```

- `kind`: `antes`, `despues` o `validacion`.
- Un `antes` seguido de un `despues` se dibujan lado a lado; cualquier otra figura va a
  ancho completo. Ordena las figuras para que los pares queden juntos.
- En borrador, la figura no lleva `file` y `expect` dice qué captura se espera.
- `environment`, `version` y `validatedOn` son opcionales; los que falten salen como "—".
- Sin figuras ni `text`, la sección 5 muestra una línea fija: en borrador, que la
  evidencia se adjunta al cerrar; en un cierre, que el estado no requiere capturas.
- La sección 5 sigue en la misma página si cabe su primera figura; si no, pasa a la
  siguiente. Una figura nunca se parte entre páginas.
- Formatos: PNG y JPG.

### Estado final

```json
"final": {
  "closedOn": "14 nov 2026",
  "verified": "El flujo actual y el último análisis de AI Mentor.",
  "justification": "La pantalla se retira en la próxima versión.",
  "approvedBy": "Nombre de quien aprobó",
  "fixChange": "sigue en OutSystems"
}
```

## Bloques

Cada sección es una lista de bloques, en el orden en que deben salir.

```json
{ "p": "Párrafo con `Identificador` y **énfasis**." }
{ "h": "Pasos" }
{ "steps": [ "Paso simple.", { "text": "Paso con subpasos:", "sub": ["Primero.", "Segundo."] } ] }
{ "list": ["Elemento con viñeta.", "Otro elemento."] }
{ "callout": { "title": "Cambio de comportamiento · Requiere decisión funcional", "text": "Texto." } }
{ "callout": { "title": "Alcance", "text": ["Primer párrafo.", "Segundo párrafo."] } }
{ "note": "Durante el análisis se identificaron observaciones fuera del alcance de este hallazgo; se reportan por separado." }
{ "table": { "head": ["Alternativa", "Costo", "Riesgo"], "rows": [["Descripción (propuesta)", "Bajo", "Bajo"]], "widths": [0.5, 0.15, 0.35] } }
{ "flow": { "nodes": [ { "label": "Cliente", "name": "OnReady" }, { "label": "Request 1", "name": "GetDatos", "detail": "Módulo X", "hit": true } ], "caption": "Pie del diagrama." } }
{ "kv": [ ["Etiqueta", "Valor"], ["Otra", "Otro valor"] ] }
```

- `flow` es opcional: solo cuando hay una secuencia clara, entre 3 y 5 nodos. Los nodos
  con el problema llevan `"hit": true`.
- `table.widths` es opcional; son proporciones. Los encabezados se ajustan al ancho de
  su columna en varias líneas si hace falta.
- `note` con las observaciones fuera del alcance va al final de `cause`. Frase fija en
  presente (la del ejemplo); si al cerrar se confirmó que ya se reportaron, en pasado:
  "Durante el análisis se identificaron observaciones fuera del alcance de este
  hallazgo; se reportaron por separado."
- No hay bloque para fragmentos de código: no van en el PDF. Un nombre suelto va como
  identificador dentro del texto.

## Resumen (`"type": "summary"`)

```json
{
  "type": "summary",
  "period": "5 al 12 nov 2026",
  "cutoff": "12 nov 2026",
  "cards": [
    { "k": "Periodo", "v": "5 al 12 nov 2026" },
    { "k": "Cerrados en el periodo", "v": "4" },
    { "k": "Esperan cierre", "v": "6" },
    { "k": "Avance acumulado", "v": "13 %" }
  ],
  "sections": [
    { "title": "Cifras", "blocks": [ ] },
    { "title": "Hallazgos cerrados en el periodo", "blocks": [ ] }
  ]
}
```

Las secciones se numeran solas. Usan los mismos bloques. Sin ID internos: los hallazgos
se identifican por módulo, elemento y patrón.

## Licencias

`pdfkit.bundle.cjs` es PDFKit 0.20.2 con sus dependencias, empaquetado en un archivo.
PDFKit y esas dependencias se distribuyen bajo licencia MIT.
