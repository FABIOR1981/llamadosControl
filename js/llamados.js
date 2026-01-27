
// Lógica de gestión de llamados laborales
const FORM_ID = 'llamadoForm';
const TABLE_ID = 'tablaLlamados';
// Importar estados desde config.js
let ESTADOS_LLAMADO = ['Abierto','En Curso','Pausado','Cerrado'];
try {
  // Si se usa import/export, usar: import { ESTADOS_LLAMADO } from './config.js';
  // Pero para compatibilidad, cargar dinámicamente si existe window.ESTADOS_LLAMADO
  if (window.ESTADOS_LLAMADO) {
    ESTADOS_LLAMADO = window.ESTADOS_LLAMADO;
  }
} catch(e) {}

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


let editIdLlamado = null;

window.editarLlamado = function(id_llamado) {
  editIdLlamado = id_llamado;
  renderTabla();
};

function renderTabla() {
  const tbody = document.querySelector(`#${TABLE_ID} tbody`);
  const thead = document.getElementById('theadLlamados');
  if (!tbody || !thead) return;
  tbody.innerHTML = '';
  thead.innerHTML = '';

  // Renderizar encabezado dinámico
  const trHead = document.createElement('tr');
  // Botón de expandir/collapse
  const thExpand = document.createElement('th');
  thExpand.className = 'px-3 py-2';
  trHead.appendChild(thExpand);
  (window.LLAMADOS_COLUMNAS_CABECERA || []).filter(c => c.visible).forEach(col => {
    const th = document.createElement('th');
    th.className = 'px-3 py-2';
    th.textContent = col.label;
    trHead.appendChild(th);
  });
  thead.appendChild(trHead);

  // Fila para nuevo llamado
  const nuevo = {};
  (window.LLAMADOS_COLUMNAS_CABECERA || []).forEach(col => { nuevo[col.key] = ''; });
  // Detalle también
  (window.LLAMADOS_COLUMNAS_DETALLE || []).forEach(etapa => {
    nuevo[etapa.fecha] = '';
    nuevo[etapa.cantidad] = '';
    nuevo[etapa.obs] = '';
  });
  const tplNuevo = document.getElementById('template-fila-nueva');
  const trNuevo = tplNuevo.content.cloneNode(true).children[0];
  trNuevo.innerHTML = '';
  // Botón vacío para expandir
  const tdExpandNuevo = document.createElement('td');
  trNuevo.appendChild(tdExpandNuevo);
  (window.LLAMADOS_COLUMNAS_CABECERA || []).filter(c => c.visible).forEach(col => {
    let td = document.createElement('td');
    if (col.key === 'acciones') {
      const btn = document.createElement('button');
      btn.className = 'btn-guardar-nuevo';
      btn.textContent = 'Nuevo';
      td.appendChild(btn);
    } else if (col.key === 'estado') {
      const select = document.createElement('select');
      select.setAttribute('data-field', col.key);
      select.className = 'input-tw input-inline w-110';
      (window.ESTADOS_LLAMADO || []).forEach(e => {
        const opt = document.createElement('option');
        opt.value = e;
        opt.textContent = e;
        select.appendChild(opt);
      });
      td.appendChild(select);
    } else if (col.key === 'fecha_inicio' || col.key === 'fecha_fin') {
      const input = document.createElement('input');
      input.type = 'date';
      input.setAttribute('data-field', col.key);
      input.className = 'input-tw input-inline w-130';
      td.appendChild(input);
    } else if (col.key === 'cant_finalistas') {
      const input = document.createElement('input');
      input.type = 'number';
      input.setAttribute('data-field', col.key);
      input.className = 'input-tw input-inline w-70';
      td.appendChild(input);
    } else {
      const input = document.createElement('input');
      input.type = 'text';
      input.setAttribute('data-field', col.key);
      input.className = 'input-tw input-inline w-120';
      td.appendChild(input);
    }
    trNuevo.appendChild(td);
  });
  tbody.appendChild(trNuevo);
  const btnGuardarNuevo = trNuevo.querySelector('.btn-guardar-nuevo');
  if (btnGuardarNuevo) {
    btnGuardarNuevo.onclick = async function() {
      const inputs = trNuevo.querySelectorAll('input, select');
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
  }

  // Renderizar llamados ordenados usando template
  const llamadosOrdenados = [...llamados].sort((a, b) => {
    const fa = a.fecha_inicio ? new Date(a.fecha_inicio) : new Date(0);
    const fb = b.fecha_inicio ? new Date(b.fecha_inicio) : new Date(0);
    return fb - fa;
  });
  // Detectar si la columna acciones está visible
  const accionesVisible = (window.LLAMADOS_COLUMNAS_CABECERA || []).some(c => c.key === 'acciones' && c.visible);
  llamadosOrdenados.forEach((l) => {
    const tplFila = document.getElementById('template-fila-llamado');
    const tr = tplFila.content.cloneNode(true).children[0];
    tr.innerHTML = '';
    // Solo permitir edición si la columna acciones está visible
    let isEditing = accionesVisible && (editIdLlamado === l.id_llamado);
    // Botón expandir/collapse
    const tdExpand = document.createElement('td');
    const btnExpand = document.createElement('button');
    btnExpand.className = 'toggle-detalle';
    btnExpand.title = 'Ver detalle';
    btnExpand.textContent = '▶';
    tdExpand.appendChild(btnExpand);
    tr.appendChild(tdExpand);
    // Renderizar columnas dinámicas
    (window.LLAMADOS_COLUMNAS_CABECERA || []).filter(c => c.visible).forEach(col => {
      let td = document.createElement('td');
      if (col.key === 'acciones') {
        const btnEditar = document.createElement('button');
        btnEditar.className = 'btn-editar text-blue-600 underline hover:text-blue-900';
        btnEditar.textContent = 'Editar';
        const btnGuardar = document.createElement('button');
        btnGuardar.className = 'btn-guardar';
        btnGuardar.textContent = 'Guardar';
        btnGuardar.style.display = 'none';
        const btnCancelar = document.createElement('button');
        btnCancelar.className = 'btn-cancelar';
        btnCancelar.textContent = 'Cancelar';
        btnCancelar.style.display = 'none';
        td.appendChild(btnEditar);
        td.appendChild(btnGuardar);
        td.appendChild(btnCancelar);
      } else if (col.key === 'estado') {
        const select = document.createElement('select');
        select.className = 'input-tw input-inline input-estado w-110';
        select.setAttribute('data-field', col.key);
        (window.ESTADOS_LLAMADO || []).forEach(e => {
          const opt = document.createElement('option');
          opt.value = e;
          opt.textContent = e;
          select.appendChild(opt);
        });
        select.value = l.estado || (window.ESTADO_LLAMADO_DEFAULT || 'Abierto');
        td.appendChild(select);
      } else if (col.key === 'fecha_inicio' || col.key === 'fecha_fin') {
        const input = document.createElement('input');
        input.type = 'date';
        input.className = `input-tw input-inline input-${col.key} w-130`;
        input.setAttribute('data-field', col.key);
        input.value = toInputDate(l[col.key]);
        td.appendChild(input);
      } else if (col.key === 'cant_finalistas') {
        const input = document.createElement('input');
        input.type = 'number';
        input.className = 'input-tw input-inline input-finalistas w-70';
        input.setAttribute('data-field', col.key);
        input.value = l[col.key] || '';
        td.appendChild(input);
      } else if (col.key === 'dias_activos') {
        td.textContent = calcularDiasActivos(l.fecha_inicio, l.fecha_fin);
      } else if (col.key === 'conversion_final') {
        td.textContent = calcularConversionFinal(l.cant_postulantes, l.cant_finalistas);
      } else {
        td.textContent = l[col.key] || '';
      }
      tr.appendChild(td);
    });
    // Habilitar edición solo si existen los botones (columna acciones visible)
    const btnEditar = tr.querySelector('.btn-editar');
    const btnGuardar = tr.querySelector('.btn-guardar');
    const btnCancelar = tr.querySelector('.btn-cancelar');
    const inputs = tr.querySelectorAll('input, select');
    if (accionesVisible && (btnEditar || btnGuardar || btnCancelar)) {
      if (isEditing) {
        inputs.forEach(el => el.disabled = false);
        if (btnEditar) btnEditar.style.display = 'none';
        if (btnGuardar) btnGuardar.style.display = '';
        if (btnCancelar) btnCancelar.style.display = '';
      } else {
        inputs.forEach(el => el.disabled = true);
        if (btnEditar) btnEditar.style.display = '';
        if (btnGuardar) btnGuardar.style.display = 'none';
        if (btnCancelar) btnCancelar.style.display = 'none';
      }
      if (btnEditar) btnEditar.onclick = () => {
        editIdLlamado = l.id_llamado;
        renderTabla();
      };
      if (btnGuardar) btnGuardar.onclick = async () => {
        const idxOriginal = llamados.findIndex(x => x.id_llamado === l.id_llamado);
        if (idxOriginal !== -1) {
          // Guardar campos del cabezal
          (window.LLAMADOS_COLUMNAS_CABECERA || []).forEach(col => {
            if (col.key !== 'acciones' && col.key !== 'dias_activos' && col.key !== 'conversion_final') {
              const input = tr.querySelector(`[data-field='${col.key}']`);
              if (input) llamados[idxOriginal][col.key] = input.value;
            }
          });
          // Guardar campos del detalle
          const detalle = tr.nextElementSibling.querySelector('.detalle-block');
          if (detalle) {
            const detalleInputs = detalle.querySelectorAll('input, textarea');
            detalleInputs.forEach(input => {
              const field = input.getAttribute('data-field');
              let val = input.value;
              if (input.type === 'number') val = val ? Number(val) : '';
              llamados[idxOriginal][field] = val;
            });
          }
        }
        await guardarLlamados();
        editIdLlamado = null;
        renderTabla();
      };
      if (btnCancelar) btnCancelar.onclick = () => {
        editIdLlamado = null;
        renderTabla();
      };
    }
    tbody.appendChild(tr);

    // Fila detalle usando template
    const tplDetalle = document.getElementById('template-detalle-llamado');
    const trDetalle = tplDetalle.content.cloneNode(true).children[0];
    trDetalle.style.display = 'none'; // Siempre iniciar oculto
    const tablaDetalle = trDetalle.querySelector('.tabla-detalle');
    tablaDetalle.innerHTML = '';
    // Header detalle
    const trHeader = document.createElement('tr');
    ['Etapa', 'Fecha', 'Cantidad', 'Observaciones'].forEach(label => {
      const td = document.createElement('td');
      td.textContent = label;
      trHeader.appendChild(td);
    });
    tablaDetalle.appendChild(trHeader);
    // Renderizar etapas visibles
    (window.LLAMADOS_COLUMNAS_DETALLE || []).filter(e => e.visible).forEach(etapa => {
      const trEtapa = document.createElement('tr');
      trEtapa.className = `detalle-${etapa.etapa.toLowerCase()}`;
      // Etapa
      const tdEtapa = document.createElement('td');
      tdEtapa.textContent = etapa.etapa;
      trEtapa.appendChild(tdEtapa);
      // Fecha
      const tdFecha = document.createElement('td');
      const inputFecha = document.createElement('input');
      inputFecha.type = 'date';
      inputFecha.className = `input-tw input-inline w-130`;
      inputFecha.setAttribute('data-field', etapa.fecha);
      inputFecha.value = toInputDate(l[etapa.fecha]);
      trEtapa.appendChild(tdFecha);
      tdFecha.appendChild(inputFecha);
      // Cantidad
      const tdCant = document.createElement('td');
      const inputCant = document.createElement('input');
      inputCant.type = 'number';
      inputCant.className = 'input-tw input-inline w-70';
      inputCant.setAttribute('data-field', etapa.cantidad);
      inputCant.value = l[etapa.cantidad] || '';
      tdCant.appendChild(inputCant);
      trEtapa.appendChild(tdCant);
      // Observaciones
      const tdObs = document.createElement('td');
      const inputObs = document.createElement('textarea');
      inputObs.className = 'input-tw input-inline h-2em';
      inputObs.setAttribute('data-field', etapa.obs);
      inputObs.value = l[etapa.obs] || '';
      tdObs.appendChild(inputObs);
      trEtapa.appendChild(tdObs);
      // Habilitar edición si corresponde
      [inputFecha, inputCant, inputObs].forEach(el => { el.disabled = !isEditing; });
      tablaDetalle.appendChild(trEtapa);
    });
    tbody.appendChild(trDetalle);
    // Evento para expandir/colapsar detalle
    btnExpand.onclick = function() {
      if (trDetalle.style.display === 'none' || !trDetalle.style.display) {
        trDetalle.style.display = '';
        btnExpand.textContent = '▼';
      } else {
        trDetalle.style.display = 'none';
        btnExpand.textContent = '▶';
      }
    };
  });
}
document.addEventListener('DOMContentLoaded', () => {
  obtenerLlamados();
  
});
