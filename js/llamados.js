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
    // Fila principal (cabezal)
    const tr = document.createElement('tr');
    tr.className = 'llamado-row';
    tr.innerHTML = `
      <td><button class="toggle-detalle" title="Ver detalle" data-idx="${idx}">▶</button></td>
      <td>${l.id_llamado || ''}</td>
      <td>${l.nombre_puesto || ''}</td>
      <td>${formatFecha(l.fecha_inicio)}</td>
      <td>${formatFecha(l.fecha_fin)}</td>
      <td>${l.cant_finalistas || ''}</td>
      <td>${l.estado || ''}</td>
      <td>${calcularDiasActivos(l.fecha_inicio, l.fecha_fin)}</td>
      <td>${calcularConversionFinal(l.cant_postulantes, l.cant_finalistas)}</td>
      <td><button class="text-blue-600 underline hover:text-blue-900" onclick="editarLlamado(${idx})">Editar</button></td>
    `;
    tbody.appendChild(tr);

    // Fila detalle (oculta por defecto)
    const trDetalle = document.createElement('tr');
    trDetalle.className = 'detalle-row';
    trDetalle.style.display = 'none';
    trDetalle.innerHTML = `<td colspan="10">
      <div class="detalle-block" style="padding:0.5em 1em; background:#f8fafc; border-radius:0.5em;">
        <strong>Fechas y cantidades por etapa:</strong>
        <table style="width:auto; margin-top:0.5em; font-size:0.95em;">
          <tr><td>Postulación:</td><td>${formatFecha(l.fecha_postulacion)}</td><td>Postulantes:</td><td>${l.cant_postulantes || ''}</td></tr>
          <tr><td>Selección:</td><td>${formatFecha(l.fecha_seleccion)}</td><td>Seleccionados:</td><td>${l.cant_seleccionados || ''}</td></tr>
          <tr><td>Entrevista:</td><td>${formatFecha(l.fecha_entrevista)}</td><td>Entrevistados:</td><td>${l.cant_entrevistados || ''}</td></tr>
          <tr><td>Psicotécnico:</td><td>${formatFecha(l.fecha_psicotecnico)}</td><td>Psicotécnico OK:</td><td>${l.cant_psicotecnico || ''}</td></tr>
        </table>
      </div>
    </td>`;
    tbody.appendChild(trDetalle);
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
