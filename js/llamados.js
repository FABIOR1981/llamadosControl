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

let editIdx = null;

window.editarLlamado = function(idx) {
  editIdx = idx;
  renderTabla();
};

function renderTabla() {
  const tbody = document.querySelector(`#${TABLE_ID} tbody`);
  if (!tbody) return;
  tbody.innerHTML = '';
  llamados.forEach((l, idx) => {
    const tr = document.createElement('tr');
    tr.className = 'llamado-row';
    let isEditing = (editIdx === idx);
    tr.innerHTML = `
      <td><button class="toggle-detalle" title="Ver detalle" data-idx="${idx}">▶</button></td>
      <td>${l.id_llamado || ''}</td>
      <td>${l.nombre_puesto || ''}</td>
      <td>${isEditing ? `<input type='date' value='${l.fecha_inicio ? new Date(l.fecha_inicio).toISOString().slice(0,10) : ''}' data-field='fecha_inicio' class='input-tw input-inline' style='width:130px;'>` : formatFecha(l.fecha_inicio)}</td>
      <td>${isEditing ? `<input type='date' value='${l.fecha_fin ? new Date(l.fecha_fin).toISOString().slice(0,10) : ''}' data-field='fecha_fin' class='input-tw input-inline' style='width:130px;'>` : formatFecha(l.fecha_fin)}</td>
      <td style="text-align:center;">${isEditing ? `<input type='number' value='${l.cant_finalistas || ''}' data-field='cant_finalistas' class='input-tw input-inline' style='width:70px;'>` : (l.cant_finalistas || '')}</td>
      <td>${isEditing ? `<select data-field='estado' class='input-tw input-inline' style='width:110px;'><option value='Abierto' ${l.estado==='Abierto'?'selected':''}>Abierto</option><option value='En Curso' ${l.estado==='En Curso'?'selected':''}>En Curso</option><option value='Pausado' ${l.estado==='Pausado'?'selected':''}>Pausado</option><option value='Cerrado' ${l.estado==='Cerrado'?'selected':''}>Cerrado</option></select>` : (l.estado || '')}</td>
      <td style="text-align:center;">${calcularDiasActivos(l.fecha_inicio, l.fecha_fin)}</td>
      <td style="text-align:center;">${calcularConversionFinal(l.cant_postulantes, l.cant_finalistas)}</td>
      <td>${isEditing ? `<button class='btn-guardar' data-idx='${idx}'>Guardar</button> <button class='btn-cancelar' data-idx='${idx}'>Cancelar</button>` : `<button class="text-blue-600 underline hover:text-blue-900" onclick="editarLlamado(${idx})">Editar</button>`}</td>
    `;
    tbody.appendChild(tr);

    // Fila detalle (oculta por defecto)
    const trDetalle = document.createElement('tr');
    trDetalle.className = 'detalle-row';
    trDetalle.style.display = 'none';
    trDetalle.innerHTML = `<td colspan="10">
      <div class="detalle-block" style="padding:0.5em 1em; background:#f8fafc; border-radius:0.5em;">
        <strong style="font-size:1.08em; color:#1d4ed8;">Fechas y cantidades por etapa:</strong>
        <table style="width:auto; margin-top:0.5em; font-size:1em; border-radius:0.75em; overflow:hidden; border-collapse:separate; border-spacing:0; box-shadow:0 2px 8px rgba(30,64,175,0.06);">
          <tr style="font-weight:700; background:#dbeafe; color:#2563eb;">
            <td style="padding:6px 18px; font-family:'Segoe UI',Arial,sans-serif;">Etapa</td>
            <td style="padding:6px 18px; font-family:'Segoe UI',Arial,sans-serif;">Fecha</td>
            <td style="padding:6px 18px; text-align:center; font-family:'Segoe UI',Arial,sans-serif;">Cantidad</td>
          </tr>
          <tr style="background:#fff;">
            <td style="padding:4px 12px;">Postulación</td><td style="padding:4px 12px;">${isEditing ? `<input type='date' value='${l.fecha_postulacion ? new Date(l.fecha_postulacion).toISOString().slice(0,10) : ''}' data-field='fecha_postulacion' class='input-tw input-inline' style='width:130px;'>` : formatFecha(l.fecha_postulacion)}</td><td style="text-align:center; padding:4px 12px;">${isEditing ? `<input type='number' value='${l.cant_postulantes || ''}' data-field='cant_postulantes' class='input-tw input-inline' style='width:70px;'>` : (l.cant_postulantes || '')}</td>
          </tr>
          <tr style="background:#f1f5f9;">
            <td style="padding:4px 12px;">Selección</td><td style="padding:4px 12px;">${isEditing ? `<input type='date' value='${l.fecha_seleccion ? new Date(l.fecha_seleccion).toISOString().slice(0,10) : ''}' data-field='fecha_seleccion' class='input-tw input-inline' style='width:130px;'>` : formatFecha(l.fecha_seleccion)}</td><td style="text-align:center; padding:4px 12px;">${isEditing ? `<input type='number' value='${l.cant_seleccionados || ''}' data-field='cant_seleccionados' class='input-tw input-inline' style='width:70px;'>` : (l.cant_seleccionados || '')}</td>
          </tr>
          <tr style="background:#fff;">
            <td style="padding:4px 12px;">Entrevista</td><td style="padding:4px 12px;">${isEditing ? `<input type='date' value='${l.fecha_entrevista ? new Date(l.fecha_entrevista).toISOString().slice(0,10) : ''}' data-field='fecha_entrevista' class='input-tw input-inline' style='width:130px;'>` : formatFecha(l.fecha_entrevista)}</td><td style="text-align:center; padding:4px 12px;">${isEditing ? `<input type='number' value='${l.cant_entrevistados || ''}' data-field='cant_entrevistados' class='input-tw input-inline' style='width:70px;'>` : (l.cant_entrevistados || '')}</td>
          </tr>
          <tr style="background:#f1f5f9;">
            <td style="padding:4px 12px;">Psicotécnico</td><td style="padding:4px 12px;">${isEditing ? `<input type='date' value='${l.fecha_psicotecnico ? new Date(l.fecha_psicotecnico).toISOString().slice(0,10) : ''}' data-field='fecha_psicotecnico' class='input-tw input-inline' style='width:130px;'>` : formatFecha(l.fecha_psicotecnico)}</td><td style="text-align:center; padding:4px 12px;">${isEditing ? `<input type='number' value='${l.cant_psicotecnico || ''}' data-field='cant_psicotecnico' class='input-tw input-inline' style='width:70px;'>` : (l.cant_psicotecnico || '')}</td>
          </tr>
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

  // Renderizar fila para nuevo llamado
  const nuevo = {
    id_llamado: '', nombre_puesto: '', fecha_inicio: '', fecha_fin: '', cant_finalistas: '', estado: 'Abierto',
    fecha_postulacion: '', cant_postulantes: '', fecha_seleccion: '', cant_seleccionados: '', fecha_entrevista: '', cant_entrevistados: '', fecha_psicotecnico: '', cant_psicotecnico: ''
  };
  const trNuevo = document.createElement('tr');
  trNuevo.className = 'llamado-row';
  trNuevo.innerHTML = `
    <td></td>
    <td><input type='text' data-field='id_llamado' class='input-tw input-inline' style='width:80px;'></td>
    <td><input type='text' data-field='nombre_puesto' class='input-tw input-inline' style='width:140px;'></td>
    <td><input type='date' data-field='fecha_inicio' class='input-tw input-inline' style='width:130px;'></td>
    <td><input type='date' data-field='fecha_fin' class='input-tw input-inline' style='width:130px;'></td>
    <td style="text-align:center;"><input type='number' data-field='cant_finalistas' class='input-tw input-inline' style='width:70px;'></td>
    <td><select data-field='estado' class='input-tw input-inline' style='width:110px;'><option value='Abierto'>Abierto</option><option value='En Curso'>En Curso</option><option value='Pausado'>Pausado</option><option value='Cerrado'>Cerrado</option></select></td>
    <td style="text-align:center;"></td>
    <td style="text-align:center;"></td>
    <td><button class='btn-guardar-nuevo'>Guardar</button></td>
  `;
  tbody.appendChild(trNuevo);
  // Fila detalle para nuevo llamado
  const trDetalleNuevo = document.createElement('tr');
  trDetalleNuevo.className = 'detalle-row';
  trDetalleNuevo.style.display = '';
  trDetalleNuevo.innerHTML = `<td colspan="10">
    <div class="detalle-block" style="padding:0.5em 1em; background:#f8fafc; border-radius:0.5em;">
      <strong style="font-size:1.08em; color:#1d4ed8;">Fechas y cantidades por etapa:</strong>
      <table style="width:auto; margin-top:0.5em; font-size:1em; border-radius:0.75em; overflow:hidden; border-collapse:separate; border-spacing:0; box-shadow:0 2px 8px rgba(30,64,175,0.06);">
        <tr style="font-weight:700; background:#dbeafe; color:#2563eb;">
          <td style="padding:6px 18px; font-family:'Segoe UI',Arial,sans-serif;">Etapa</td>
          <td style="padding:6px 18px; font-family:'Segoe UI',Arial,sans-serif;">Fecha</td>
          <td style="padding:6px 18px; text-align:center; font-family:'Segoe UI',Arial,sans-serif;">Cantidad</td>
        </tr>
        <tr style="background:#fff;">
          <td style="padding:4px 12px;">Postulación</td><td style="padding:4px 12px;"><input type='date' data-field='fecha_postulacion' class='input-tw input-inline' style='width:130px;'></td><td style="text-align:center; padding:4px 12px;"><input type='number' data-field='cant_postulantes' class='input-tw input-inline' style='width:70px;'></td>
        </tr>
        <tr style="background:#f1f5f9;">
          <td style="padding:4px 12px;">Selección</td><td style="padding:4px 12px;"><input type='date' data-field='fecha_seleccion' class='input-tw input-inline' style='width:130px;'></td><td style="text-align:center; padding:4px 12px;"><input type='number' data-field='cant_seleccionados' class='input-tw input-inline' style='width:70px;'></td>
        </tr>
        <tr style="background:#fff;">
          <td style="padding:4px 12px;">Entrevista</td><td style="padding:4px 12px;"><input type='date' data-field='fecha_entrevista' class='input-tw input-inline' style='width:130px;'></td><td style="text-align:center; padding:4px 12px;"><input type='number' data-field='cant_entrevistados' class='input-tw input-inline' style='width:70px;'></td>
        </tr>
        <tr style="background:#f1f5f9;">
          <td style="padding:4px 12px;">Psicotécnico</td><td style="padding:4px 12px;"><input type='date' data-field='fecha_psicotecnico' class='input-tw input-inline' style='width:130px;'></td><td style="text-align:center; padding:4px 12px;"><input type='number' data-field='cant_psicotecnico' class='input-tw input-inline' style='width:70px;'></td>
        </tr>
      </table>
    </div>
  </td>`;
  tbody.appendChild(trDetalleNuevo);
  // Evento guardar nuevo
  trNuevo.querySelector('.btn-guardar-nuevo').onclick = async function() {
    const inputs = trNuevo.querySelectorAll('.input-inline, select.input-inline');
    const inputsDetalle = trDetalleNuevo.querySelectorAll('.input-inline, select.input-inline');
    const nuevoLlamado = {};
    inputs.forEach(input => {
      const field = input.getAttribute('data-field');
      let val = input.value;
      if (input.type === 'number') val = val ? Number(val) : '';
      nuevoLlamado[field] = val;
    });
    inputsDetalle.forEach(input => {
      const field = input.getAttribute('data-field');
      let val = input.value;
      if (input.type === 'number') val = val ? Number(val) : '';
      nuevoLlamado[field] = val;
    });
    // Validación mínima: id y puesto
    if (!nuevoLlamado.id_llamado || !nuevoLlamado.nombre_puesto) {
      alert('Debe completar al menos ID y Nombre Puesto');
      return;
    }
    llamados.push(nuevoLlamado);
    await guardarLlamados();
    renderTabla();
  };
}

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
