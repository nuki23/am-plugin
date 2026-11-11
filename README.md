# am — documentación de hallazgos de AI Mentor (OutSystems)

Plugin de Claude Code. Analiza hallazgos de AI Mentor en solo lectura y genera, por
cada uno, un PDF de solución y una guía `.md` para aplicar la corrección a mano. De forma
opcional, `/am:fix` implementa la solución documentada cuando la conexión a OutSystems
permite escritura.

## Instalación

Dentro de Claude Code:

```
/plugin marketplace add nuki23/am-plugin
/plugin install am@nuki23
```

Para actualizar después de un `git push`:

```
/plugin marketplace update nuki23
```

## Comandos

| Comando | Uso |
|---|---|
| `/am:review <excel>` | Carga el Excel de AI Mentor y procesa los hallazgos uno a uno. Sin argumento, continúa donde quedó. |
| `/am:close <ID>` | Cierra un hallazgo como Resuelto (con pantallazos en `evidencia/`) o Won't fix (con justificación escrita y quién la aprobó) y genera el PDF final. |
| `/am:fix <ID>` | Opcional. Implementa en OutSystems la solución documentada. Solo funciona con una conexión con escritura, en Desarrollo, y pide confirmación del plan antes de tocar nada. |
| `/am:status` | Avance por estado y por módulo. |
| `/am:redo <ID> [nota]` | Rehace el análisis de un hallazgo. |
| `/am:summary [desde]` | Reporte resumen para la sesión semanal. |

Estados de un hallazgo: `pendiente`, `borrador`, `implementado`, `cerrado`, `omitido`.

## Requisitos

- Claude Code con una conexión de lectura a OutSystems. Solo `/am:fix` necesita una
  conexión con escritura; sin ella, el resto del plugin funciona igual y la corrección
  se aplica a mano.
- Para los PDF, Python 3 (reportlab) o Node.js (pdfkit); la librería se instala sola si
  falta. Si no hay ninguno de los dos, se generan igual los `.md` y el PDF queda
  pendiente: el plugin no instala lenguajes por su cuenta.

## Salida

```
reportes/
  _progreso.md
  _resumenes/
  <Modulo>/<ID>-<Elemento>/solucion.md, solucion.pdf, implementacion.md (solo con /am:fix), evidencia/
scripts/
  generar_pdf.py  (o generar_pdf.mjs con Node)
```

`reportes/` contiene información del cliente: no la subas a este repositorio.
