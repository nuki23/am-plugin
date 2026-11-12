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

Formato de `reports/_progress.md`: como lo define `/am:review`.

## Reglas

1. **Nunca borres.** Todo lo que se quita se mueve a `reports/_archive/<AAAA-MM-DD>/`
   (fecha de hoy). Si esa carpeta ya existe, usa `<AAAA-MM-DD>-2`, `-3`, etc.
2. **Las filas también se archivan.** Antes de quitar filas de `_progress.md`, cópialas
   (con el encabezado de la tabla) a `_archive/<fecha>/_progress-removed.md`.
3. **Primero el listado.** Antes de mover nada, lista exactamente qué filas y carpetas
   se van a mover y a dónde, y espera un sí explícito. Sin sí, no hagas nada.
4. Dentro del archivo conserva la estructura: una carpeta `reports/<Module>/<Folder>/`
   pasa a `_archive/<fecha>/<Module>/<Folder>/`.
5. Si `_progress.md` no existe, dilo y termina.

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
  `_archive/<fecha>/`, incluidos `_progress.md` y `_summaries/`, y deja el proyecto
  listo para un Excel nuevo con `/am:review <excel>`. Si hay `implemented`, avisa que
  su cambio ya está en OutSystems. Este alcance exige que el usuario escriba
  literalmente `ARCHIVAR TODO`; un "sí" no basta.
- **Otro valor:** indica los alcances válidos y termina.

## Al terminar

Reporta qué se movió, la ruta del archivo y cuántos hallazgos quedan por estado. No
cambies `Updated` de las filas que quedan.
