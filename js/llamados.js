// Lógica de gestión de llamados laborales
const FORM_ID = 'llamadoForm';
const TABLE_ID = 'tablaLlamados';
const STORAGE_KEY = 'llamadosLaborales';

function obtenerLlamados() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

function guardarLlamados(llamados) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(llamados));
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

function renderTabla() {
  const tbody = document.querySelector(`#${TABLE_ID} tbody`);
  tbody.innerHTML = '';
  const llamados = obtenerLlamados();
  llamados.forEach(l => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${l.id_llamado}</td>
      <td>${l.nombre_puesto}</td>
      <td>${l.fecha_inicio}</td>
      <td>${l.fecha_fin}</td>
      <td>${l.fecha_postulacion}</td>
      <td>${l.cant_postulantes}</td>
      <td>${l.fecha_seleccion}</td>
      <td>${l.cant_seleccionados}</td>
      <td>${l.fecha_entrevista}</td>
      <td>${l.cant_entrevistados}</td>
      <td>${l.fecha_psicotecnico}</td>
      <td>${l.cant_psicotecnico}</td>
      <td>${l.cant_finalistas}</td>
      <td>${l.estado}</td>
      <td>${calcularDiasActivos(l.fecha_inicio, l.fecha_fin)}</td>
      <td>${calcularConversionFinal(l.cant_postulantes, l.cant_finalistas)}</td>
    `;
    tbody.appendChild(tr);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderTabla();
  document.getElementById(FORM_ID).addEventListener('submit', function(e) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(this).entries());
    // Convertir a número los campos numéricos
    ['cant_postulantes','cant_seleccionados','cant_entrevistados','cant_psicotecnico','cant_finalistas'].forEach(k => {
      data[k] = Number(data[k]);
    });
    const llamados = obtenerLlamados();
    llamados.push(data);
    guardarLlamados(llamados);
    renderTabla();
    this.reset();
  });
});
