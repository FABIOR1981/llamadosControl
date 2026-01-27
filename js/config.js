// Configuración global para llamadosControl
// Estados posibles para el combo de estado en la cabecera

window.ESTADOS_LLAMADO = [
  'Iniciado',
  'Abierto',
  'En Curso',
  'Pausado',
  'Cerrado'
];

// Estado por defecto al crear un llamado
window.ESTADO_LLAMADO_DEFAULT = 'Iniciado';

// Columnas visibles en la tabla principal (cabecera)
window.LLAMADOS_COLUMNAS_CABECERA = [
  { key: 'id_llamado', label: 'ID', visible: true },
  { key: 'publicado', label: 'Publicado', visible: true },
  { key: 'empresa', label: 'Empresa', visible: true },
  { key: 'nombre_puesto', label: 'Puesto', visible: true },
  { key: 'fecha_inicio', label: 'Inicio', visible: true },
  { key: 'fecha_fin', label: 'Fin', visible: true },
  { key: 'cant_finalistas', label: 'Finalistas', visible: true },
  { key: 'estado', label: 'Estado', visible: true },
  { key: 'dias_activos', label: 'Días Activos', visible: true },
  { key: 'conversion_final', label: '% Conversión Final', visible: true },
  { key: 'acciones', label: 'Editar', visible: true }
];

// Columnas visibles en el detalle
window.LLAMADOS_COLUMNAS_DETALLE = [
  { etapa: 'Postulación', fecha: 'fecha_postulacion', cantidad: 'cant_postulantes', obs: 'obs_postulacion', visible: true },
  { etapa: 'Selección', fecha: 'fecha_seleccion', cantidad: 'cant_seleccionados', obs: 'obs_seleccion', visible: true },
  { etapa: 'Entrevista', fecha: 'fecha_entrevista', cantidad: 'cant_entrevistados', obs: 'obs_entrevista', visible: true },
  { etapa: 'Psicotécnico', fecha: 'fecha_psicotecnico', cantidad: 'cant_psicotecnico', obs: 'obs_psicotecnico', visible: true }
];
