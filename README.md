# Gestión de Llamados Laborales

Aplicación web para hacer el seguimiento de llamados laborales (procesos de selección). Registra cada etapa del proceso y calcula indicadores como los días activos y el porcentaje de conversión final.

Sitio publicado: https://llamadoscontrol.netlify.app

## Documentación

El manual de usuario está en [documentacion-central](https://github.com/FABIOR1981/documentacion-central/tree/main/llamadosControl/documentacion) ([PDF](https://github.com/FABIOR1981/documentacion-central/blob/main/llamadosControl/documentacion/MANUAL_USUARIO.pdf)). También se puede consultar desde la bitácora de proyectos.

## Funcionalidades

- **Tabla de llamados** con ID, publicado, empresa, puesto, fechas de inicio y fin, finalistas, estado, días activos y % de conversión final.
- **Estados**: Iniciado, Abierto, En Curso, Pausado y Cerrado.
- **Detalle por etapa**: Postulación, Selección, Entrevista y Psicotécnico, con fecha, cantidad de personas y observaciones.
- **Alta y edición** de llamados.
- **Cálculos automáticos**:
  - días que el llamado estuvo activo;
  - conversión final, es decir, la proporción de finalistas sobre postulantes.

## Cómo se usa

1. Abrí la app. Se muestran los llamados ingresados.
2. Agregá un llamado o tocá **Editar** en uno existente.
3. Completá los datos generales y las etapas a medida que avanza el proceso.
4. Guardá. Los cambios quedan disponibles para todos los que usan la app.

## Configuración

En `js/config.js` se definen:

- los estados posibles y el estado por defecto;
- qué columnas se ven en la tabla principal;
- qué etapas se ven en el detalle.

## Cómo funciona

- El frontend es HTML, CSS y JavaScript, sin build.
- Los datos están en `data/llamados.json`.
- Para guardar, la app llama a la Netlify Function `netlify/functions/update-llamados.js`, que actualiza el JSON en este repositorio (rama `main`) a través de la API de GitHub.

## Publicación en Netlify

Configurar esta variable de entorno:

| Variable | Para qué sirve |
|---|---|
| `GITHUB_TOKEN` | Token con permiso de escritura sobre este repositorio. |

El repositorio, la ruta del archivo y la rama están definidos al principio de `update-llamados.js`.

## Estructura

```
index.html                              Pantalla principal
css/llamados.css                        Estilos
js/config.js                            Estados y columnas configurables
js/llamados.js                          Lógica: tabla, detalle, cálculos y guardado
data/llamados.json                      Datos de los llamados
netlify/functions/update-llamados.js    Guarda el JSON en GitHub
```
