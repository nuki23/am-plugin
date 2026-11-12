# Plantilla del PDF de solución (versión 1)

Cuatro archivos fijos: `finding.html` (esqueleto del PDF de solución), `summary.html`
(esqueleto del resumen de avance), `finding.css` (estilos de ambos) y este documento
(reglas). El comando copia `finding.html` como `solution.html` en la carpeta del
hallazgo, reemplaza los `{{CAMPOS}}` y lo imprime a PDF con Edge o Chrome. El resumen
sigue el mismo método con `summary.html` (ver "Resumen de avance").

Los tres archivos que se copian al proyecto (`finding.css`, `finding.html` y
`summary.html`) llevan la misma versión en su primer comentario. La que se compara es
la de `finding.css`.

## Reglas

- No se agregan estilos. Nada de `style="..."`, ni clases nuevas, ni `<style>` extra.
  El único bloque `<style>` es el que ya viene en el esqueleto, con el nombre de la app.
- No se cambia el orden ni el título de las seis secciones.
- Todo identificador (módulo, pantalla, acción, variable, clase CSS, ruta) va en
  `<code>`. Los largos siguen la regla de "Identificadores largos".
- El ID interno (`SRC-001`) no aparece en el documento.
- Nunca se copia el valor de un secreto, credencial, token o dato personal.
- El texto usa la misma cautela que `solution.md` ("no verificado", "probable").
- Escapa `&`, `<` y `>` en los textos. En `{{APP}}` dentro de `@page` escapa además
  las comillas dobles.

## Identificadores largos

Un `<code>` normal no se parte: si no cabe en lo que queda del renglón, pasa entero al
siguiente. Un identificador de más de 60 caracteres (o de más de 30 dentro de una
tabla o de un nodo del diagrama) puede no caber en un renglón completo. En ese caso:

- usa `<code class="wrap">`;
- inserta `<wbr>` después de cada separador: `>`, `/`, `.` y los espacios dentro de
  una ruta.

```html
<code class="wrap">Ventas/<wbr>MainFlow/<wbr>PedidoDetalle/<wbr>ValidarPedido</code>
<code class="wrap">Ventas &gt; <wbr>MainFlow &gt; <wbr>PedidoDetalle &gt; <wbr>ValidarPedido</code>
```

En una ruta con ` > `, el separador incluye su espacio final: el `<wbr>` va después
de ese espacio.

Así el corte cae en un separador y nunca dentro de un nombre. Solo cuando un nombre
por sí solo es más largo que el renglón se parte por dentro; eso lo resuelve
`finding.css`, sin nada más que hacer. `<wbr>` no es un estilo: es el único elemento
de control permitido además de los componentes del catálogo. No lo uses en un
`<code>` sin `wrap` (no tiene efecto) ni fuera de un identificador.

Cada identificador va en su propio `<code>`: una lista de clases CSS o de acciones
son varios `<code>` separados por texto normal, no uno solo con todo dentro.

## Estilo fijo

El color de acento, el texto del encabezado ("AI Mentor · Atención de hallazgo") y el
del pie ("Confidencial — uso interno") están en `finding.css`. No hay logo ni archivo
de marca: no se configura nada por proyecto.

`{{CSS_HREF}}` es la ruta relativa a `reports/_template/finding.css` desde la carpeta
del hallazgo (normalmente `../../_template/finding.css`).

## Campos del encabezado y la sección 01

| Campo | Contenido |
|---|---|
| `{{TITULO_DOC}}` | `<Parent> › <Object Name> — Atención de hallazgo` |
| `{{TITULO}}` | `<Parent><span class="sep">›</span><Object Name>`; sin padre, solo el objeto |
| `{{APP}}`, `{{MODULO}}`, `{{CATEGORIA}}`, `{{PATRON}}`, `{{OBJETO}}`, `{{TIPO_OBJETO}}` | Del Excel de AI Mentor |
| `{{FECHA_ANALISIS}}` | `12 nov 2026` |
| `{{RUTA}}` | Un `<li>` por tramo del Object Path: `<li>Nombre<span class="t">Tipo</span></li>`. Si no se conoce el tipo de un tramo, se omite el `<span>`; no se inventa |

## Qué cambia según el estado

| Campo | Borrador | Fixed | Already fixed | False positive | Won't fix |
|---|---|---|---|---|---|
| `{{ETIQUETA_ESTADO}}` | Borrador | Fixed | Already fixed | False positive | Won't fix |
| `{{ESTADO_BADGE}}` | `badge-soft` "Pendiente de implementación" | `badge-dark` con el estado | igual | igual | igual |
| `{{TITULO_SOLUCION}}` | Solución propuesta | Solución aplicada | Solución aplicada | Solución aplicada | Solución aplicada |
| `{{SOLUCION}}` | Propuesta, pasos, alcance, cambio de comportamiento y alternativas | Lo realmente hecho | "No se requirió corrección…" y lo verificado | "No se aplica corrección…" y por qué | "No se aplica corrección." y la solución que se había propuesto |
| `{{CLASE_EVIDENCIA}}` | `page-break` | `page-break` | `page-break` | vacío | vacío |
| `{{EVIDENCIA}}` | Marcos vacíos con los pies de las capturas previstas | Capturas | Capturas | Justificación (y capturas si hay) | Justificación (y capturas si hay) |
| `{{ESTADO_FINAL}}` | Fila de estado pendiente | Fila de estado y tabla | igual | igual, con justificación y quién aprobó | igual, con justificación y quién aprobó |

`Remind me later` no genera PDF.

## Catálogo de componentes

Párrafos: `<p>…</p>`, con `<strong>` y `<em>` cuando haga falta.

Subtítulo dentro de una sección:

```html
<h3>Pasos</h3>
```

Pasos numerados (sección 04):

```html
<ol class="steps">
  <li>Texto del paso con <code>Identificador</code>.</li>
  <li>Paso con subpasos:
    <ul>
      <li>– Subpaso.</li>
    </ul>
  </li>
</ol>
```

Recuadro destacado (alcance, cambio de comportamiento):

```html
<div class="callout">
  <div class="ttl">Cambio de comportamiento · Requiere decisión funcional</div>
  Texto.
</div>
```

Nota neutra (observaciones fuera del alcance; va al final de la sección 03):

```html
<div class="note">Durante el análisis se identificaron observaciones fuera del alcance de este hallazgo; se reportan por separado.</div>
```

Alternativas consideradas (sección 04, solo en borrador):

```html
<h3>Alternativas consideradas</h3>
<table class="alt">
  <tr><th>Alternativa</th><th>Costo</th><th>Riesgo</th></tr>
  <tr><td>Descripción (propuesta)</td><td>Bajo</td><td>Bajo</td></tr>
</table>
```

Diagrama de secuencia (sección 03, opcional: solo si hay una secuencia clara; entre 3
y 5 nodos; los nodos con el problema llevan `hit`):

```html
<div class="keep">
  <div class="flow">
    <div class="node"><div class="lbl">Etiqueta</div><div class="name">Nombre</div></div>
    <div class="arrow">→</div>
    <div class="node hit"><div class="lbl">Request 1</div><div class="name">Nombre</div><div class="caption">→ detalle</div></div>
  </div>
  <p class="caption">Pie del diagrama.</p>
</div>
```

Evidencia (sección 05). Datos de validación, par antes/después e imagen a ancho
completo. Las rutas de imagen son relativas a la carpeta del hallazgo:

```html
<div class="ev-meta">
  <span>Ambiente: <b>Desarrollo</b></span>
  <span>Versión publicada: <b>—</b></span>
  <span>Fecha de validación: <b>14 nov 2026</b></span>
</div>
<div class="ev-pair">
  <figure>
    <span class="tag antes">Antes</span>
    <div class="frame"><img src="evidence/01-antes.png" alt=""></div>
    <figcaption><b>Figura 1.</b> Descripción.</figcaption>
  </figure>
  <figure>
    <span class="tag despues">Después</span>
    <div class="frame"><img src="evidence/02-despues.png" alt=""></div>
    <figcaption><b>Figura 2.</b> Descripción.</figcaption>
  </figure>
</div>
<figure class="ev-full">
  <span class="tag despues">Validación</span>
  <div class="frame"><img src="evidence/03-validacion.png" alt=""></div>
  <figcaption><b>Figura 3.</b> Descripción.</figcaption>
</figure>
```

En borrador, el marco va vacío y el texto dice qué captura se espera:

```html
<div class="frame empty">Captura antes de la corrección</div>
```

Reparto de las capturas: las de antes y después van en pares (`ev-pair`); las de
validación (Network, AI Mentor) y las que sobren, a ancho completo (`ev-full`). Si
solo hay capturas de un tipo, todas van en `ev-full`.

Estado final (sección 06). Fila de estado y, al cerrar, tabla con el detalle:

```html
<div class="status-row">
  <p>Atención cerrada con la evidencia adjunta.</p>
  <span class="badge badge-dark">Fixed</span>
</div>
<div class="status-detail">
  <table class="kv">
    <tr><th>Estado final</th><td>Fixed</td></tr>
    <tr><th>Fecha de cierre</th><td>14 nov 2026</td></tr>
    <tr><th>Justificación</th><td>Solo en False positive y Won't fix.</td></tr>
    <tr><th>Aprobó</th><td>Solo en False positive y Won't fix.</td></tr>
    <tr><th>Cambio de /am:fix</th><td>Solo si aplica: «revertido» o «sigue en OutSystems».</td></tr>
  </table>
</div>
```

En borrador:

```html
<div class="status-row">
  <p>Se actualiza al cerrar la atención con la evidencia adjunta.</p>
  <span class="badge badge-soft">Pendiente de implementación</span>
</div>
```

## Resumen de avance

`/am:summary` copia `summary.html` como `summary-<AAAA-MM-DD>.html` en
`reports/_summaries/`, reemplaza los campos y lo imprime igual que un hallazgo. Valen
las mismas reglas: sin estilos propios, solo las clases de `finding.css`, sin ID
interno y sin secretos ni datos personales. No se cambia el orden ni el título de sus
ocho secciones.

El único bloque `<style>` es el del esqueleto: redefine el encabezado izquierdo de la
página a "AI Mentor · Resumen de avance" y pone el periodo a la derecha.

`{{CSS_HREF}}` es `../_template/finding.css`.

| Campo | Contenido |
|---|---|
| `{{PERIODO}}` | `5 nov 2026 – 12 nov 2026`. En `@page` escapa las comillas dobles |
| `{{FECHA_CORTE}}` | Fecha del resumen: `12 nov 2026` |
| `{{CERRADOS_PERIODO}}` | Número de hallazgos cerrados en el periodo |
| `{{ESPERAN_CIERRE}}` | Número de hallazgos `implemented` |
| `{{AVANCE}}` | Porcentaje acumulado, por ejemplo `42 %` |
| `{{CIFRAS}}` | Dos tablas `kv`, cada una bajo un `<h3>`: "Periodo" y "Acumulado" |
| `{{CERRADOS}}`, `{{IMPLEMENTADOS}}`, `{{SIN_CORRECCION}}`, `{{POSPUESTOS}}` | Tabla `alt` con las columnas que correspondan |
| `{{LECCIONES}}`, `{{DUDAS}}`, `{{PLAN}}` | Párrafos, o una lista `<ol class="steps">` |

En el resumen, la tabla `alt` lleva las columnas de cada sección en lugar de
Alternativa, Costo y Riesgo:

```html
<table class="alt">
  <tr><th>Módulo</th><th>Elemento</th><th>Patrón</th><th>Estado final</th><th>Solución</th></tr>
  <tr><td><code>Ventas</code></td><td><code>ValidarPedido</code></td><td>Server requests in client events</td><td>Fixed</td><td>Una línea.</td></tr>
</table>
```

Una sección sin datos no se quita; lleva una línea:

```html
<p class="muted">Sin hallazgos en el periodo.</p>
```

## Impresión

```
"<navegador>" --headless --disable-gpu --no-pdf-header-footer --print-to-pdf="<salida>.pdf" "file:///<ruta>/solution.html"
```

`<navegador>` es la ruta completa del ejecutable, entre comillas: Edge y Chrome no
suelen estar en el PATH. Se busca en este orden y se usa el primero que exista:

| Sistema | Rutas |
|---|---|
| Windows | `C:\Program Files\Microsoft\Edge\Application\msedge.exe`, `C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe`, `C:\Program Files\Google\Chrome\Application\chrome.exe`, `C:\Program Files (x86)\Google\Chrome\Application\chrome.exe`, `%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe` |
| macOS | `/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge`, `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome` |
| Linux | `microsoft-edge`, `google-chrome`, `chromium` o `chromium-browser`, el primero que responda en el PATH |

`<salida>` y `<ruta>` son rutas absolutas. En la URL `file:///` se usan barras `/` y
se codifican los espacios (`%20`) y los demás caracteres no válidos en una URL.

El encabezado, el pie y la numeración de páginas salen del CSS (`@page`), por eso el
encabezado y pie del navegador se desactivan. Requiere un Edge o Chrome reciente; con
uno antiguo, el documento se genera sin encabezado ni pie.

El navegador puede escribir mensajes de error en la consola aunque el PDF salga bien,
y puede terminar sin error aunque no lo haya escrito (por ejemplo, si el PDF anterior
está abierto en un visor). El resultado se comprueba en el archivo, no en la salida
del comando.

Antes de imprimir: comprobar que no queda ningún `{{CAMPO}}` sin reemplazar, que no
hay `style="..."` ni otro `<style>`, y que el archivo de cada `<img src>` existe.

Después de imprimir, comprobar que:

- el PDF existe, no está vacío y su fecha de modificación es de esta ejecución;
- tiene las seis secciones, del 01 al 06, con sus títulos (ocho en el resumen);
- las imágenes cargaron: cada figura muestra su captura, no un marco en blanco;
- el texto se puede extraer (al leer el PDF se obtiene el texto de las secciones, no
  solo imágenes de las páginas).

Si algo falla, se corrige el `.html` y se imprime de nuevo. Nunca se edita
`finding.css` ni su copia en el proyecto.
