// Lógica de gestión de llamados laborales
const FORM_ID = 'llamadoForm';
const TABLE_ID = 'tablaLlamados';

let llamados = [];

async function obtenerLlamados() {
  try {
    const resp = await fetch('data/llamados.json');
    llamados = await resp.json();
  } catch {
    llamados = [];
  }
  renderTabla();
}

async function guardarLlamados() {
  await fetch('/.netlify/functions/update-llamados', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: llamados })
  });
}

function calcularDiasActivos(inicio, fin) {
  if (!inicio || !fin) return '';
  const d1 = new Date(inicio);
  const d2 = new Date(fin);
  const diff = (d2 - d1) / (1000 * 60 * 60 * 24);
  return diff >= 0 ? diff : '';
}

function calcularConversionFinal(cant_postulantes, cant_finalistas) {
  if (!cant_postulantes || cant_postulantes == 0) return '0%';
  return ((cant_finalistas / cant_postulantes) * 100).toFixed(1) + '%';
}


// Formatea fecha para mostrar en tabla, sin errores de zona horaria
function formatFecha(fecha) {
  if (!fecha) return '';
  // yyyy-mm-dd
  if (/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    const [y, m, d] = fecha.split('-');
    return `${d}/${m}/${y}`;
  }
  // dd/mm/yyyy
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(fecha)) {
    return fecha;
  }
  // Otro formato, intentar parsear
  const dt = new Date(fecha);
  if (!isNaN(dt)) {
    const day = String(dt.getDate()).padStart(2, '0');
    const month = String(dt.getMonth() + 1).padStart(2, '0');
    const year = dt.getFullYear();
    return `${day}/${month}/${year}`;
  }
  return fecha;
}


// Convierte fecha dd/mm/yyyy o yyyy-mm-dd a yyyy-mm-dd para input type date
function toInputDate(fecha) {
  if (!fecha) return '';
  // Si ya es formato yyyy-mm-dd
  if (/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return fecha;
  // Si es formato dd/mm/yyyy
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(fecha)) {
    const [d, m, y] = fecha.split('/');
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  // Si es formato Date
  const d = new Date(fecha);
  if (!isNaN(d)) return d.toISOString().slice(0,10);
  return '';
}

let editIdx = null;

window.editarLlamado = function(idx) {
  editIdx = idx;
  renderTabla();
};

function renderTabla() {
  const tbody = document.querySelector(`#${TABLE_ID} tbody`);
  if (!tbody) return;
  tbody.innerHTML = '';
  // Ordenar llamados por fecha_inicio descendente
  const llamadosOrdenados = [...llamados].sort((a, b) => {
    const fa = a.fecha_inicio ? new Date(a.fecha_inicio) : new Date(0);
    const fb = b.fecha_inicio ? new Date(b.fecha_inicio) : new Date(0);
    return fb - fa;
  });

  // Fila para nuevo llamado primero usando template
  const nuevo = {
    id_llamado: '', empresa: '', nombre_puesto: '', fecha_inicio: '', fecha_fin: '', cant_finalistas: '', estado: 'Abierto',
    fecha_postulacion: '', cant_postulantes: '', fecha_seleccion: '', cant_seleccionados: '', fecha_entrevista: '', cant_entrevistados: '', fecha_psicotecnico: '', cant_psicotecnico: ''
  };
  const tplNuevo = document.getElementById('template-fila-nueva');
  const trNuevo = tplNuevo.content.cloneNode(true).children[0];
  tbody.appendChild(trNuevo);
  trNuevo.querySelector('.btn-guardar-nuevo').onclick = async function() {
    const inputs = trNuevo.querySelectorAll('.input-inline, select.input-inline');
    const nuevoLlamado = { ...nuevo };
    inputs.forEach(input => {
      const field = input.getAttribute('data-field');
      let val = input.value;
      if (input.type === 'number') val = val ? Number(val) : '';
      nuevoLlamado[field] = val;
    });
    if (!nuevoLlamado.id_llamado || !nuevoLlamado.nombre_puesto) {
      alert('Debe completar al menos ID y Nombre Puesto');
      return;
    }
    llamados.push(nuevoLlamado);
    await guardarLlamados();
    renderTabla();
  };

  // Renderizar llamados ordenados usando template
  llamadosOrdenados.forEach((l, idx) => {
    const tplFila = document.getElementById('template-fila-llamado');
    const tr = tplFila.content.cloneNode(true).children[0];
    let isEditing = (editIdx === idx);
    // Asignar datos a la fila principal
    tr.querySelector('.td-id').textContent = l.id_llamado || '';
    tr.querySelector('.td-empresa').textContent = l.empresa || '';
    tr.querySelector('.td-nombre').textContent = l.nombre_puesto || '';
    tr.querySelector('.input-fecha-inicio').value = toInputDate(l.fecha_inicio);
    tr.querySelector('.input-fecha-fin').value = toInputDate(l.fecha_fin);
    tr.querySelector('.input-finalistas').value = l.cant_finalistas || '';
    tr.querySelector('.input-estado').value = l.estado || 'Abierto';
    tr.querySelector('.td-dias').textContent = calcularDiasActivos(l.fecha_inicio, l.fecha_fin);
    tr.querySelector('.td-conversion').textContent = calcularConversionFinal(l.cant_postulantes, l.cant_finalistas);

    // Habilitar edición si corresponde
    const editarBtn = tr.querySelector('.btn-editar');
    const guardarBtn = tr.querySelector('.btn-guardar');
    const cancelarBtn = tr.querySelector('.btn-cancelar');
    const inputs = tr.querySelectorAll('input, select');
    if (isEditing) {
      inputs.forEach(el => el.disabled = false);
      editarBtn.style.display = 'none';
      guardarBtn.style.display = '';
      cancelarBtn.style.display = '';
    } else {
      inputs.forEach(el => el.disabled = true);
      editarBtn.style.display = '';
      guardarBtn.style.display = 'none';
      cancelarBtn.style.display = 'none';
    }

    editarBtn.onclick = () => {
      editIdx = idx;
      renderTabla();
    };
    guardarBtn.onclick = async () => {
      l.fecha_inicio = tr.querySelector('.input-fecha-inicio').value;
      l.fecha_fin = tr.querySelector('.input-fecha-fin').value;
      l.cant_finalistas = tr.querySelector('.input-finalistas').value;
      l.estado = tr.querySelector('.input-estado').value;
      await guardarLlamados();
      editIdx = null;
      renderTabla();
    };
    cancelarBtn.onclick = () => {
      editIdx = null;
      renderTabla();
    };

    tbody.appendChild(tr);

    // Fila detalle usando template
    const tplDetalle = document.getElementById('template-detalle-llamado');
    const trDetalle = tplDetalle.content.cloneNode(true).children[0];
    // Asignar datos a los campos de detalle
    const detalle = trDetalle.querySelector('.detalle-block');
    // Postulación
    detalle.querySelector('.input-fecha-postulacion').value = toInputDate(l.fecha_postulacion);
    detalle.querySelector('.input-cant-postulantes').value = l.cant_postulantes || '';
    detalle.querySelector('.input-obs-postulacion').value = l.obs_postulacion || '';
    // Selección
    detalle.querySelector('.input-fecha-seleccion').value = toInputDate(l.fecha_seleccion);
    detalle.querySelector('.input-cant-seleccionados').value = l.cant_seleccionados || '';
    detalle.querySelector('.input-obs-seleccion').value = l.obs_seleccion || '';
    // Entrevista
    detalle.querySelector('.input-fecha-entrevista').value = toInputDate(l.fecha_entrevista);
    detalle.querySelector('.input-cant-entrevistados').value = l.cant_entrevistados || '';
    detalle.querySelector('.input-obs-entrevista').value = l.obs_entrevista || '';
    // Psicotécnico
    detalle.querySelector('.input-fecha-psicotecnico').value = toInputDate(l.fecha_psicotecnico);
    detalle.querySelector('.input-cant-psicotecnico').value = l.cant_psicotecnico || '';
    detalle.querySelector('.input-obs-psicotecnico').value = l.obs_psicotecnico || '';

    // Habilitar edición en detalle si corresponde
    const detalleInputs = detalle.querySelectorAll('input, textarea');
    if (isEditing) {
      detalleInputs.forEach(el => el.disabled = false);
    } else {
      detalleInputs.forEach(el => el.disabled = true);
    }

    tbody.appendChild(trDetalle);

    // Evento para expandir/colapsar detalle
    tr.querySelector('.toggle-detalle').onclick = function() {
      if (trDetalle.style.display === 'none') {
        trDetalle.style.display = '';
        this.textContent = '▼';
      } else {
        trDetalle.style.display = 'none';
        this.textContent = '▶';
      }
    };
  });

  // Eventos para expandir/colapsar detalle
  tbody.querySelectorAll('.toggle-detalle').forEach(btn => {
    btn.onclick = function() {
      const idx = this.getAttribute('data-idx');
      const row = this.closest('tr');
      const detalle = row.nextElementSibling;
      if (detalle.style.display === 'none') {
        detalle.style.display = '';
        this.textContent = '▼';
      } else {
        detalle.style.display = 'none';
        this.textContent = '▶';
      }
    };
  });
  tbody.querySelectorAll('.btn-guardar').forEach(btn => {
    btn.onclick = async function() {
      const idx = Number(this.getAttribute('data-idx'));
      const tr = this.closest('tr');
      const trDetalle = tr.nextElementSibling;
      const inputs = tr.querySelectorAll('.input-inline, select.input-inline');
      const inputsDetalle = trDetalle ? trDetalle.querySelectorAll('.input-inline, select.input-inline') : [];
      const l = llamados[idx];
      inputs.forEach(input => {
        const field = input.getAttribute('data-field');
        let val = input.value;
        if (input.type === 'number') val = val ? Number(val) : '';
        l[field] = val;
      });
      inputsDetalle.forEach(input => {
        const field = input.getAttribute('data-field');
        let val = input.value;
        if (input.type === 'number') val = val ? Number(val) : '';
        l[field] = val;
      });
      await guardarLlamados();
      editIdx = null;
      renderTabla();
    };
  });
  tbody.querySelectorAll('.btn-cancelar').forEach(btn => {
    btn.onclick = function() {
      editIdx = null;
      renderTabla();
    };
  });
}
document.addEventListener('DOMContentLoaded', () => {
  obtenerLlamados();
  // Eliminado: ya no existe el formulario de alta
  // document.getElementById(FORM_ID).addEventListener('submit', async function(e) {
  //   e.preventDefault();
  //   const data = Object.fromEntries(new FormData(this).entries());
  //   ['cant_postulantes','cant_seleccionados','cant_entrevistados','cant_psicotecnico','cant_finalistas'].forEach(k => {
  //     data[k] = data[k] ? Number(data[k]) : '';
  //   });
  //   if (editIdx !== null) {
  //     llamados[editIdx] = data;
  //     editIdx = null;
  //     this.querySelector('button[type="submit"]').textContent = '➕ Agregar Llamado';
  //   } else {
  //     llamados.push(data);
  //   }
  //   await guardarLlamados();
  //   renderTabla();
  //   this.reset();
  // });
});
