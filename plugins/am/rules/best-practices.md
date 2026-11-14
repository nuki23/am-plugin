# Buenas prácticas de codificación · OutSystems 11 (versión 1)

Lista de 29 reglas que debe cumplir toda solución que el plugin proponga. Los comandos la
leen antes de definir una solución y la citan por código (`DOC-3`, `PERF-7`…) en la
guía `solution.md`. No se citan en el PDF.

## Cómo se usa

1. Define la solución del hallazgo.
2. Recorre esta lista y marca las reglas que la solución toca: por lo que crea, por lo
   que modifica o por el mecanismo que elige.
3. Si la solución incumple una regla, cámbiala. Si no hay forma de cumplirla, dilo y
   justifícalo; no la ignores.
4. Agrega a los pasos manuales las acciones que la regla exige (escribir una
   descripción, limitar las filas, crear el Aggregate a mano).
5. Lo que ya incumplía una regla antes del cambio y no es parte del hallazgo no se
   corrige de paso: va a "Observaciones fuera del alcance". No audites el módulo
   entero; reporta solo lo que viste en los elementos que leíste para el análisis.

Las reglas marcadas **Por confirmar** tienen una interpretación por defecto. Si esa
interpretación cambia la solución de un hallazgo, la duda va a "Consultar antes de
implementar".

## Documentación

| Código | Regla | Al proponer una solución |
|---|---|---|
| DOC-1 | Las entidades se nombran `<PrefijoAplicacion>_<NombreEntidad>`, por ejemplo `Aut_Usuario`. | Toda entidad nueva sigue el formato. **Por confirmar:** por defecto no se renombran entidades existentes. |
| DOC-2 | El código se documenta con comentarios y descripciones. | La lógica nueva que no sea evidente lleva un comentario en el flujo. |
| DOC-3 | Toda acción pública y cada uno de sus parámetros tiene descripción. | Cada acción y parámetro que se cree lleva su descripción; el paso lo dice de forma explícita. |
| DOC-4 | Toda pantalla y todo bloque tiene descripción. | Igual para pantallas y bloques nuevos. |
| DOC-5 | El modelo de datos refleja las necesidades del negocio: atributos obligatorios y claves foráneas, bien descritos. | Si se agrega un atributo o una entidad, se define si es obligatorio, su referencia y su descripción. |
| DOC-6 | Cada flujo de acción tiene pocos elementos, para que sea simple y reutilizable. | Si el cambio alarga un flujo, se extrae la lógica nueva a una acción propia. |
| DOC-7 | Los flujos van de arriba hacia abajo y se entienden a primera vista. | Los nodos nuevos respetan esa orientación. |
| DOC-8 | Site Properties, Timers y Procesos tienen descripción, y esa descripción dice su impacto. | Aplica a cada uno que se cree o cuyo uso cambie. |
| DOC-9 | Las acciones públicas que manejan la transacción (confirmar o abortar) están claramente identificadas. | Si una acción nueva hace commit o abort, su nombre y su descripción lo indican. |
| DOC-10 | El módulo no tiene warnings. | El cambio no deja warnings nuevos, y "qué probar" incluye revisarlo. **Por confirmar:** por defecto los warnings que ya existían se reportan, no se corrigen. |
| DOC-11 | Cada consumo de una API lleva un comentario: para qué sirve y cuál es su propósito. | Todo consumo de API que se agregue lleva ese comentario. |

## Performance

| Código | Regla | Al proponer una solución |
|---|---|---|
| PERF-0 | **Destacada.** Un Aggregate se arma a mano, agregando solo las entidades y los cruces que se necesitan. Nunca se arrastran entidades desde la pestaña Data. | Todo paso que cree un Aggregate dice cómo: crear el Aggregate vacío y añadir cada entidad necesaria. |
| PERF-1 | Para saber si una consulta trajo resultados se revisa si la lista está vacía, no se cuentan los registros. | Usar la propiedad `Empty` de la lista. |
| PERF-2 | Cuando los datos salen de un SQL avanzado, la estructura de salida es optimizada. | La estructura de salida trae solo los atributos que se usan. |
| PERF-3 | Las condiciones de Aggregates y SQL no llevan conversiones de tipo. | Comparar valores del mismo tipo; convertir antes, fuera del filtro. |
| PERF-4 | No se definen funciones de JavaScript en las pantallas. | Si hace falta JavaScript, va en un script del módulo o en un nodo JavaScript de una acción, no en la pantalla. |
| PERF-5 | Los elementos de pantalla no llevan estilos inline. | Los estilos van en clases del tema. |
| PERF-6 | El modelo de datos refleja las restricciones del negocio con índices y restricciones. | Si la solución agrega un filtro u orden frecuente sobre una entidad propia, se evalúa el índice. |
| PERF-7 | Se controla cuántas filas se traen de la base de datos. | Todo Aggregate o SQL nuevo o modificado define su máximo de registros. |
| PERF-8 | Las Site Properties no se usan para datos que cambian con frecuencia. | No proponer escribir una Site Property desde lógica que se ejecuta seguido. |
| PERF-9 | Las operaciones masivas sobre la base de datos se hacen con SQL avanzado. | No recorrer una lista haciendo una operación por registro. |
| PERF-10 | Un Timer no se diseña para ejecutarse mucho tiempo; hace commits frecuentes. | Si la solución usa o toca un Timer, procesa por lotes con commit y puede retomarse. |

## Integraciones

| Código | Regla | Al proponer una solución |
|---|---|---|
| INT-1 | El mecanismo para integrar módulos se elige por el acoplamiento aceptable. **API:** cuando las aplicaciones deben ser independientes, sin acoplamiento. **Service Action:** cuando se acepta un acoplamiento leve, con contrato administrado por la plataforma. **Server Action:** solo dentro del mismo dominio o aplicación, porque crea una dependencia directa y un acoplamiento fuerte. | Antes de proponer una llamada a otro módulo, determina si es de la misma aplicación o de otra y elige según esta regla. Explica la elección. Si no sabes a qué aplicación pertenece el módulo, es una consulta pendiente. |
| INT-2 | Toda API REST tiene token de autenticación. No se expone ninguna sin autenticación. | Toda API que se exponga lleva autenticación. Al consumir una, el token se maneja en el servidor y nunca llega al navegador. |

## Seguridad y robustez

| Código | Regla | Al proponer una solución |
|---|---|---|
| SEG-1 | La aplicación define varios roles, según sus necesidades. | Una pantalla o acción nueva se asigna a los roles que corresponden, no a todos. |
| SEG-2 | La información confidencial (contraseñas y similares) no viaja en parámetros de pantalla. | No proponer pasar esos datos por parámetros de entrada de una pantalla. |
| SEG-3 | La información confidencial se oculta con lógica de servidor, no solo con CSS. | Si un dato no debe verse, no se envía al cliente. |
| SEG-4 | Las excepciones se manejan correctamente; se evita el manejo estándar. | Toda acción nueva que pueda fallar define qué hace ante el error. **Por confirmar:** por defecto no se propone un manejador de "All Exceptions" que oculte el error sin registrarlo ni informarlo. |
| SEG-5 | Los errores esperados de la lógica de la aplicación se manejan con excepciones de usuario. | Para una validación o un caso de negocio previsto, usar una User Exception con su mensaje. |

## Relación con los patrones de AI Mentor

Cuando el hallazgo es de uno de estos patrones, la regla respalda la corrección y se
cita en "Buenas prácticas aplicadas".

| Regla | Patrones de AI Mentor |
|---|---|
| DOC-3, DOC-4 | Missing descriptions on public element or parameter |
| DOC-6 | Long undocumented flow |
| DOC-9 | Unidentified public action managing transaction |
| PERF-1 | Inefficient empty list test |
| PERF-5 | Inline CSS style |
| PERF-7 | Unlimited records in Aggregate; Unlimited records in SQL query |
| PERF-8 | Site Property update |
| PERF-9 | Aggregate or SQL query inside a cycle |
| PERF-10 | Avoid long-running Timers |
| INT-2 | Exposed REST services are not secured; Automatically generated publicly exposed REST endpoint |
| SEG-1 | Avoid setting Anonymous Roles to access Screens; Avoid setting Registered Roles to access Screens |
| SEG-3 | Screen Aggregate exposing System entities on Anonymous screen; Screen Aggregate exposing System entities on Registered screen |
