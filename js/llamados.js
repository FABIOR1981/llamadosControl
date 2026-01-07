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

function formatFecha(fecha) {
  if (!fecha) return '';
  const d = new Date(fecha);
  if (isNaN(d)) return fecha;
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function renderTabla() {
  const tbody = document.querySelector(`#${TABLE_ID} tbody`);
  if (!tbody) return;
  tbody.innerHTML = '';
  llamados.forEach((l, idx) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${l.id_llamado || ''}</td>
      <td>${l.nombre_puesto || ''}</td>
      <td>${formatFecha(l.fecha_inicio)}</td>
      <td>${formatFecha(l.fecha_fin)}</td>
      <td>${formatFecha(l.fecha_postulacion)}</td>
      <td>${l.cant_postulantes || ''}</td>
      <td>${formatFecha(l.fecha_seleccion)}</td>
      <td>${l.cant_seleccionados || ''}</td>
      <td>${formatFecha(l.fecha_entrevista)}</td>
      <td>${l.cant_entrevistados || ''}</td>
      <td>${formatFecha(l.fecha_psicotecnico)}</td>
      <td>${l.cant_psicotecnico || ''}</td>
      <td>${l.cant_finalistas || ''}</td>
      <td>${l.estado || ''}</td>
      <td>${calcularDiasActivos(l.fecha_inicio, l.fecha_fin)}</td>
      <td>${calcularConversionFinal(l.cant_postulantes, l.cant_finalistas)}</td>
      <td><button class="text-blue-600 underline hover:text-blue-900" onclick="editarLlamado(${idx})">Editar</button></td>
    `;
    tbody.appendChild(tr);
  });
}

let editIdx = null;

window.editarLlamado = function(idx) {
  editIdx = idx;
  const l = llamados[idx];
  const form = document.getElementById(FORM_ID);
  for (const k in l) {
    if (form.elements[k]) {
      form.elements[k].value = l[k];
    }
  }
  form.scrollIntoView({ behavior: 'smooth' });
  form.querySelector('button[type="submit"]').textContent = 'Guardar Cambios';
};

document.addEventListener('DOMContentLoaded', () => {
  obtenerLlamados();
  document.getElementById(FORM_ID).addEventListener('submit', async function(e) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(this).entries());
    ['cant_postulantes','cant_seleccionados','cant_entrevistados','cant_psicotecnico','cant_finalistas'].forEach(k => {
      data[k] = data[k] ? Number(data[k]) : '';
    });
    if (editIdx !== null) {
      llamados[editIdx] = data;
      editIdx = null;
      this.querySelector('button[type="submit"]').textContent = '➕ Agregar Llamado';
    } else {
      llamados.push(data);
    }
    await guardarLlamados();
    renderTabla();
    this.reset();
  });
});
