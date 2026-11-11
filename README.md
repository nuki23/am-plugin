<div align="center">

# am

**Documenta hallazgos de AI Mentor (OutSystems) con Claude Code**

Un PDF formal y una guía paso a paso por cada hallazgo, sin que la IA toque tu aplicación.

![versión](https://img.shields.io/badge/versión-0.2.0-2563eb)
![Claude Code](https://img.shields.io/badge/Claude_Code-plugin-d97757)
![OutSystems](https://img.shields.io/badge/OutSystems-AI_Mentor-cc0000)
![modo](https://img.shields.io/badge/por_defecto-solo_lectura-16a34a)

[Instalación](#instalación) · [Inicio rápido](#inicio-rápido) · [Comandos](#comandos) · [Flujo](#flujo-de-trabajo) · [Salida](#qué-genera)

</div>

---

## Qué hace

AI Mentor exporta un Excel con los hallazgos de deuda técnica. `am` lo recorre **uno por uno** y, para cada hallazgo:

- lee el elemento afectado en OutSystems y encuentra la causa concreta;
- escribe una **guía `.md`** con los pasos exactos para corregirlo a mano en Service Studio;
- genera un **PDF de solución** con las seis secciones que suelen pedir los equipos de calidad;
- se detiene y te pregunta antes de pasar al siguiente.

Tú aplicas la corrección, guardas los pantallazos y cierras el hallazgo con un comando.

## Instalación

Dentro de Claude Code:

```
/plugin marketplace add nuki23/am-plugin
/plugin install am@nuki23
```

Para traer una versión nueva:

```
/plugin marketplace update nuki23
```

### Requisitos

| Necesitas | Para qué |
|---|---|
| Claude Code con una conexión a OutSystems | Leer módulos, pantallas, acciones y aggregates |
| Python 3 **o** Node.js | Generar los PDF (el plugin usa el que encuentre) |
| El Excel "Code Quality Report" de AI Mentor | Lista de hallazgos a trabajar |

> Sin Python ni Node, el plugin genera las guías `.md` y deja el PDF pendiente; nunca instala un lenguaje por su cuenta.

## Inicio rápido

```
/am:review reporte.xlsx      # analiza y documenta, un hallazgo a la vez
                             # ...aplicas la corrección en Service Studio...
/am:close SRC-003            # genera el PDF final con tu evidencia
/am:summary                  # resumen de la semana
```

## Comandos

| Comando | Qué hace | Escribe en OutSystems |
|---|---|:---:|
| `/am:review [excel]` | Carga el Excel y documenta los hallazgos uno a uno. Sin argumento, continúa donde quedó. | No |
| `/am:close <ID>` | Cierra un hallazgo como **Resuelto** (con evidencia) o **Won't fix** (con justificación). | No |
| `/am:redo <ID> [nota]` | Rehace el análisis de un hallazgo cuando algo salió mal. | No |
| `/am:status` | Muestra el avance por estado y por módulo. | No |
| `/am:summary [desde]` | Genera el reporte resumen del periodo (últimos 7 días por defecto). | No |
| `/am:fix <ID>` | *Opcional.* Implementa la solución ya documentada. Requiere conexión con escritura. | **Sí** |

## Flujo de trabajo

```mermaid
stateDiagram-v2
    direction LR
    [*] --> pendiente: Excel cargado
    pendiente --> borrador: /am:review
    borrador --> implementado: /am:fix (opcional)
    borrador --> cerrado: /am:close
    implementado --> cerrado: /am:close
    borrador --> borrador: /am:redo
    pendiente --> omitido: ya gestionado en AI Mentor
    cerrado --> [*]
```

| Estado | Significa |
|---|---|
| `pendiente` | Está en el Excel y aún no se analiza |
| `borrador` | Tiene guía y PDF en borrador; falta corregirlo |
| `implementado` | La corrección se aplicó con `/am:fix`; falta validar y cerrar |
| `cerrado` | Resuelto o Won't fix, con PDF final |
| `omitido` | Ya venía gestionado en AI Mentor |

## Qué genera

Todo queda en la carpeta donde ejecutas Claude Code:

```
reportes/
├── _progreso.md                  avance de todos los hallazgos
├── _resumenes/                   reportes de /am:summary
└── <Módulo>/
    └── <ID>-<Elemento>/
        ├── solucion.md           guía para corregirlo a mano
        ├── solucion.pdf          documento formal
        ├── implementacion.md     solo si usaste /am:fix
        └── evidencia/            tus pantallazos
scripts/
└── generar_pdf.py | .mjs         se crea una vez y se reutiliza
```

### El PDF de solución

Siempre con estas seis secciones:

1. Identificación del hallazgo
2. Módulo afectado
3. Descripción de la causa identificada
4. Solución aplicada
5. Evidencia de corrección
6. Estado final de la atención

Mientras el hallazgo está en `borrador`, el PDF sale marcado como **BORRADOR** y las secciones 5 y 6 quedan pendientes. `/am:close` genera la versión final.

### Identificadores

El Excel de AI Mentor no trae ID, así que el plugin asigna uno corto por patrón:

| Prefijo | Patrón |
|---|---|
| `SRC` | Server requests in client events |
| `MSR` | Multiple server requests inside Client Actions |
| `CSS` | CSS in the screen's style sheet |
| `SCA` | Sequence of connected Aggregates |
| `URA` | Unlimited records in Aggregate |
| `LST` | Long Server Requests Timeout |

Los patrones nuevos reciben su propio prefijo y quedan registrados en `_progreso.md`.

## Garantías de diseño

- **Solo lectura por defecto.** Cinco de los seis comandos nunca publican, editan ni cambian estados en OutSystems.
- **Un hallazgo a la vez.** El plugin se detiene y pregunta antes de continuar.
- **Sin invenciones.** Lo que no se pudo leer en OutSystems queda marcado como "No verificado".
- **Implementado no es validado.** Ningún documento afirma que algo fue corregido sin tu confirmación.

### Sobre `/am:fix`

Es el único comando que modifica OutSystems, y solo lo ejecutas tú. Antes de tocar nada comprueba que la conexión permita escritura, que el ambiente sea Desarrollo y que el análisis siga vigente; luego te muestra el plan de cambio y espera tu confirmación. Con una conexión de solo lectura, simplemente te avisa y termina.

## Privacidad

`reportes/` contiene información de tu aplicación. Trabaja en una carpeta distinta a este repositorio y no la subas a un repo público.
