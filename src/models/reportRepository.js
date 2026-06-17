const reportColumns = {
  folio: 'folio',
  status: 'status',
  fecha: 'fecha',
  hora: 'hora',
  linea: 'linea',
  patio: 'patio',
  unidad: 'unidad',
  noEconomico: 'no_economico',
  placas: 'placas',
  marca: 'marca',
  modelo: 'modelo',
  anio: 'anio',
  kilometraje: 'kilometraje',
  operador: 'operador',
  expediente: 'expediente',
  telefono: 'telefono',
  responsableUnidad: 'responsable_unidad',
  responsableRecibe: 'responsable_recibe',
  supervisor: 'supervisor',
  fallas: 'fallas',
  otroDanio: 'otro_danio',
  areaSintoma: 'area_sintoma',
  frecuencia: 'frecuencia',
  modoOperacion: 'modo_operacion',
  condiciones: 'condiciones',
  velocidad: 'velocidad',
  cuando: 'cuando',
  temperaturaMotor: 'temperatura_motor',
  descripcion: 'descripcion',
  diagnostico: 'diagnostico',
  prioridadManual: 'prioridad_manual',
  prioridadCalculada: 'prioridad_calculada',
  areaSugerida: 'area_sugerida',
  firmaOperador: 'firma_operador',
  firmaRecepcion: 'firma_recepcion'
};

const writableFields = Object.keys(reportColumns).filter((field) => field !== 'folio');

function parseJson(value, fallback) {
  if (Array.isArray(value)) return value;
  if (!value) return fallback;

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function reportFromRow(row) {
  if (!row) return null;

  return {
    folio: row.folio,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    status: row.status,
    fecha: row.fecha,
    hora: row.hora,
    linea: row.linea,
    patio: row.patio,
    unidad: row.unidad,
    noEconomico: row.no_economico,
    placas: row.placas,
    marca: row.marca,
    modelo: row.modelo,
    anio: row.anio,
    kilometraje: row.kilometraje,
    operador: row.operador,
    expediente: row.expediente,
    telefono: row.telefono,
    responsableUnidad: row.responsable_unidad,
    responsableRecibe: row.responsable_recibe,
    supervisor: row.supervisor,
    fallas: parseJson(row.fallas, []),
    otroDanio: row.otro_danio || '',
    areaSintoma: row.area_sintoma,
    frecuencia: row.frecuencia,
    modoOperacion: row.modo_operacion,
    condiciones: parseJson(row.condiciones, []),
    velocidad: row.velocidad,
    cuando: row.cuando,
    temperaturaMotor: row.temperatura_motor,
    descripcion: row.descripcion || '',
    diagnostico: row.diagnostico || '',
    prioridadManual: row.prioridad_manual,
    prioridadCalculada: row.prioridad_calculada,
    areaSugerida: row.area_sugerida,
    firmaOperador: row.firma_operador || '',
    firmaRecepcion: row.firma_recepcion || ''
  };
}

function valueForDb(field, report) {
  if (field === 'fallas' || field === 'condiciones') {
    return JSON.stringify(report[field] || []);
  }

  return report[field] ?? '';
}

export async function listReports(db, { status, q, limit = 50, offset = 0 }) {
  const where = [];
  const params = [];

  if (status) {
    where.push('status = ?');
    params.push(status);
  }

  if (q) {
    where.push(`(
      folio LIKE ?
      OR unidad LIKE ?
      OR no_economico LIKE ?
      OR operador LIKE ?
      OR expediente LIKE ?
      OR placas LIKE ?
    )`);
    const like = `%${q}%`;
    params.push(like, like, like, like, like, like);
  }

  const sql = `
    SELECT *
    FROM reception_reports
    ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `;

  const { results: rows } = await db.prepare(sql).bind(...params, limit, offset).all();
  return rows.map((row) => reportFromRow(row));
}

export async function getReport(db, folio) {
  const row = await db.prepare('SELECT * FROM reception_reports WHERE folio = ?').bind(folio).first();
  return reportFromRow(row);
}

export async function insertReport(db, report) {
  const fields = Object.keys(reportColumns);
  const columns = fields.map((field) => reportColumns[field]);
  const placeholders = fields.map(() => '?');
  const values = fields.map((field) => valueForDb(field, report));

  await db.prepare(
    `INSERT INTO reception_reports (${columns.join(', ')}) VALUES (${placeholders.join(', ')})`
  ).bind(...values).run();

  return getReport(db, report.folio);
}

export async function updateReport(db, folio, report) {
  const assignments = writableFields.map((field) => `${reportColumns[field]} = ?`);
  const values = writableFields.map((field) => valueForDb(field, report));

  const result = await db.prepare(
    `UPDATE reception_reports
     SET ${assignments.join(', ')}, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
     WHERE folio = ?`
  ).bind(...values, folio).run();

  return result.meta.changes > 0 ? getReport(db, folio) : null;
}

export async function updateStatus(db, folio, status) {
  const result = await db.prepare(
    `UPDATE reception_reports
     SET status = ?, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
     WHERE folio = ?`
  ).bind(status, folio).run();

  return result.meta.changes > 0 ? getReport(db, folio) : null;
}

export default {
  getReport,
  insertReport,
  listReports,
  updateReport,
  updateStatus
};

