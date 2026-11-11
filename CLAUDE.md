# CLAUDE.md — mantenimiento del plugin `am`

Plugin de Claude Code que documenta hallazgos de deuda técnica que AI Mentor reporta
sobre aplicaciones OutSystems. Repo público: github.com/nuki23/am-plugin.

## Estructura

```
.claude-plugin/marketplace.json     marketplace "nuki23" (owner "nuki23")
plugins/am/.claude-plugin/plugin.json   plugin "am" + versión (author "nuki23")
plugins/am/commands/<nombre>.md     un archivo por comando → /am:<nombre>
README.md
```

- Plugin `am`, marketplace `nuki23`: `/plugin marketplace add nuki23/am-plugin`,
  `/plugin install am@nuki23`, `/plugin marketplace update nuki23`. Si cambia el nombre,
  actualizar `marketplace.json`, `plugin.json` y el README a la vez.
- Comandos actuales: `review`, `close`, `fix`, `redo`, `status`, `summary`.
- Salida que generan los comandos (en el proyecto del usuario, nunca en este repo):
  `reportes/_progreso.md`, `reportes/_resumenes/`,
  `reportes/<Modulo>/<ID>-<Object Name>/` con `solucion.md`, `solucion.pdf`,
  `implementacion.md` (solo si pasó por `/am:fix`) y `evidencia/`.
- PDF: la regla canónica es la sección "Generación de PDF" de `commands/review.md`;
  redo, close y summary la referencian. El plugin no asume Python: reutiliza un script
  existente (`scripts/generar_pdf.py` o `scripts/generar_pdf.mjs`); si no hay, detecta
  Python 3 (reportlab) o Node (pdfkit) y crea el script. Puede instalar la librería,
  nunca el lenguaje. Sin ninguno, se generan los `.md`, el PDF queda pendiente y se
  pregunta al usuario. El script soporta dos tipos: `hallazgo` (seis secciones, modo
  borrador o final; review, redo, close) y `resumen` (summary).

## Formato de `_progreso.md`

La definición canónica está en `commands/review.md`; los demás comandos la referencian.

```
# Progreso AI Mentor

## Prefijos
| Prefijo | Pattern Name |

## Hallazgos
| ID | Módulo | Patrón | Elemento | Object Path | Estado doc | Estado final | Actualizado | Carpeta |
```

- `Estado doc`: `pendiente`, `borrador`, `implementado`, `cerrado`, `omitido`.
- `Estado final`: en `cerrado`, `Resuelto` o `Won't fix` (close); en `omitido`, el valor
  de `Snooze Reason Label` del Excel (review); vacío en los demás. Los conteos de
  Resuelto y Won't fix (status, summary) solo consideran filas `cerrado`.
- `Actualizado`: `AAAA-MM-DD` del último cambio de estado; lo actualiza todo comando que
  cambie el estado (review, fix, close, redo). summary filtra el periodo por esta columna.
- Las filas van en el orden de trabajo confirmado en review: el primer `pendiente` es
  el siguiente.
- Compatibilidad: si un `_progreso.md` existente no tiene estas columnas o la sección
  `Prefijos`, los comandos que escriben las agregan sin perder datos; status y summary
  no lo modifican.
- `solucion.md` lleva una sección `## Cierre` (estado final, fecha y, para Won't fix,
  justificación y quién aprobó) que escribe close y lee summary.

## Reglas de diseño que no se rompen

- **OutSystems es solo lectura** en todos los comandos, excepto `/am:fix`, que exige:
  conexión con escritura, ambiente de Desarrollo y confirmación explícita del plan de
  cambio dentro de esa misma invocación. `/am:fix` mantiene `disable-model-invocation: true`.
  Ningún comando cambia el estado del hallazgo en AI Mentor.
- **Un hallazgo a la vez:** `/am:review` se detiene tras cada hallazgo y pregunta antes de
  seguir; `/am:fix` atiende un solo ID por invocación.
- **Nunca afirmar que algo fue corregido o validado** sin confirmación del usuario.
  Lo no verificado se marca "No verificado: ...". Implementado no es validado.
- **Estados del progreso:** `pendiente`, `borrador`, `implementado`, `cerrado`,
  `omitido`. Si un cambio agrega o renombra un estado, actualizarlo en todos los
  comandos que lo usan (hoy: review, close, fix, redo, status, summary) y en el README.
- **PDF de solución, siempre seis secciones:**
  1. Identificación del hallazgo
  2. Módulo afectado
  3. Descripción de la causa identificada
  4. Solución aplicada ("Solución propuesta" mientras es borrador)
  5. Evidencia de corrección
  6. Estado final de la atención
- **Sin secretos ni datos personales en la salida:** ningún comando copia a `.md`, PDF ni
  al chat el valor de un secreto, credencial, token o dato personal; solo el nombre y la
  ruta del elemento. Todo comando nuevo debe incluir esta regla.
- **Repo genérico y público:** nada de nombres de clientes, correos, rutas de la máquina
  del usuario, reportes, Excel ni PDF. Si el usuario pasa un ejemplo real para explicar
  un cambio, no se copia al repo. `.gitignore` excluye `reportes/`, `*.xlsx` y `*.pdf`;
  no quitar esas entradas.

## Al hacer cualquier cambio

1. Antes de editar, decir qué archivos se van a tocar y por qué.
2. Mantener la coherencia entre comandos: si cambia la estructura de carpetas, el formato
   de `_progreso.md` o el de los documentos, revisar los seis archivos de `commands/`.
3. Actualizar el README si cambia un comando, su argumento o su uso.
4. Subir la versión en `plugins/am/.claude-plugin/plugin.json` (semver: patch para
   ajustes de texto, minor para comandos o comportamiento nuevo).
5. Validar que `marketplace.json` y `plugin.json` siguen siendo JSON válido.
6. Mostrar el diff resumido.
7. **Nunca ejecutar `git commit` ni `git push`, ni siquiera si el usuario lo pide.** El
   usuario hace los commits. Al terminar cada cambio, proponer un mensaje en formato
   Conventional Commits:
   - Tipos: `feat`, `fix`, `docs`, `chore`.
   - Alcance: el nombre del comando cuando aplique, p. ej. `feat(close): ...`.
   - En español; primera línea de máximo 72 caracteres.
   - Nunca incluir líneas `Co-Authored-By` ni "Generated with".
