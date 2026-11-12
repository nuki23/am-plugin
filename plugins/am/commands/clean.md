---
description: Archiva hallazgos pendientes, borradores o todo reports/ para empezar de nuevo, sin borrar nada
argument-hint: [pending|drafts|all]
disable-model-invocation: true
---

# /am:clean

Alcance recibido: `$ARGUMENTS`

Limpia `reports/` archivando, nunca borrando. No consulta ni modifica OutSystems, y no
toca `scripts/`.

Nunca copies a un `.md`, a un PDF ni al chat el valor de un secreto, credencial, token o
dato personal; solo el nombre y la ruta del elemento.

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

## Reglas

1. **Nunca borres.** Todo lo que se quita se mueve a `reports/_archive/<AAAA-MM-DD>/`
   (fecha de hoy). Si esa carpeta ya existe, usa `<AAAA-MM-DD>-2`, `-3`, etc.
2. **Las filas también se archivan.** Antes de quitar filas de `_progress.md`, cópialas
   (con el encabezado de la tabla) a `_archive/<fecha>/_progress-removed.md`.
3. **Primero el listado.** Antes de mover nada, lista exactamente qué filas y carpetas
   se van a mover y a dónde, y espera un sí explícito. Sin sí, no hagas nada.
4. Dentro del archivo conserva la estructura: una carpeta `reports/<Module>/<Folder>/`
   pasa a `_archive/<fecha>/<Module>/<Folder>/`.
5. **`Last` nunca baja.** Al quitar filas de `Findings` no cambies la columna `Last` ni
   quites filas de la sección `Prefixes`: así `/am:review` no vuelve a asignar un ID
   archivado.
6. Si `_progress.md` no existe, dilo y termina.

## Según el alcance

- **Sin argumento:** muestra cuántos hallazgos hay por estado (`pending`, `draft`,
  `implemented`, `closed`, `skipped`) y pregunta qué alcance usar.
- **`pending`:** quita las filas `pending` de `_progress.md` (no tienen carpeta) y las
  archiva en `_progress-removed.md`.
- **`drafts`:** mueve las carpetas de los hallazgos `draft` al archivo y quita sus
  filas (archivadas en `_progress-removed.md`). Los `implemented` no se tocan con este
  alcance: si hay alguno, avisa que su cambio ya está en OutSystems y que se cierran con
  `/am:close`.
- **`all`:** mueve todo el contenido de `reports/` (menos `_archive/`) a
  `_archive/<fecha>/`, incluidos `_progress.md` y `_summaries/`. Luego crea un
  `_progress.md` nuevo con el título, la sección `Prefixes` copiada tal cual (con sus
  valores de `Last`) y la tabla `Findings` solo con el encabezado, y deja el proyecto
  listo para un Excel nuevo con `/am:review <excel>`. Si hay `implemented`, avisa que
  su cambio ya está en OutSystems. Este alcance exige que el usuario escriba
  literalmente `ARCHIVAR TODO`; un "sí" no basta.
- **Otro valor:** indica los alcances válidos y termina.

## Al terminar

Reporta qué se movió, la ruta del archivo y cuántos hallazgos quedan por estado. No
cambies `Updated` de las filas que quedan.

Con `pending` o `drafts`, avisa además: si se vuelve a cargar un Excel donde esos
hallazgos sigan en `Open`, `/am:review` los agregará otra vez como `pending`, con un ID
nuevo.
