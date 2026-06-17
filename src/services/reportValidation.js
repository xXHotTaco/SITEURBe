import ApiError from '../utils/apiError.js';
import { AREAS, PRIORITIES, STATUSES, calculatePriority, suggestArea } from './reportRules.js';

const DEFAULT_REPORT = {
  status: 'Recepcion',
  fecha: '',
  hora: '',
  linea: '',
  patio: '',
  unidad: '',
  noEconomico: '',
  placas: '',
  marca: '',
  modelo: '',
  anio: '',
  kilometraje: '',
  operador: '',
  expediente: '',
  telefono: '',
  responsableUnidad: '',
  responsableRecibe: '',
  supervisor: '',
  fallas: [],
  otroDanio: '',
  areaSintoma: '',
  frecuencia: '',
  modoOperacion: '',
  condiciones: [],
  velocidad: '',
  cuando: '',
  temperaturaMotor: '',
  descripcion: '',
  diagnostico: '',
  prioridadManual: 'Auto',
  firmaOperador: '',
  firmaRecepcion: ''
};

function todayParts() {
  const now = new Date();
  return {
    fecha: [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, '0'),
      String(now.getDate()).padStart(2, '0')
    ].join('-'),
    hora: [
      String(now.getHours()).padStart(2, '0'),
      String(now.getMinutes()).padStart(2, '0')
    ].join(':')
  };
}

function cleanString(value) {
  if (value === null || value === undefined) return '';
  return String(value).trim();
}

function cleanStringArray(value) {
  if (!Array.isArray(value)) return [];
  return value.map(cleanString).filter(Boolean);
}

function normalizeReportPayload(payload, existing = {}) {
  const dateDefaults = todayParts();
  const report = {
    ...DEFAULT_REPORT,
    fecha: dateDefaults.fecha,
    hora: dateDefaults.hora,
    ...existing,
    ...payload
  };

  for (const key of Object.keys(DEFAULT_REPORT)) {
    if (key === 'fallas' || key === 'condiciones') {
      report[key] = cleanStringArray(report[key]);
    } else {
      report[key] = cleanString(report[key]);
    }
  }

  if (!STATUSES.includes(report.status)) {
    throw ApiError.badRequest('Estado de reporte invalido.', { status: report.status, allowed: STATUSES });
  }

  if (!PRIORITIES.includes(report.prioridadManual)) {
    throw ApiError.badRequest('Prioridad manual invalida.', {
      prioridadManual: report.prioridadManual,
      allowed: PRIORITIES
    });
  }

  report.prioridadCalculada = calculatePriority(report);
  report.areaSugerida = AREAS.includes(report.areaSugerida) ? report.areaSugerida : suggestArea(report);

  return report;
}

function validateMinimumReportFields(report) {
  const errors = [];

  if (!report.unidad && !report.noEconomico) {
    errors.push('Captura unidad o numero economico.');
  }

  if (!report.operador && !report.expediente) {
    errors.push('Captura operador o expediente.');
  }

  if (report.fallas.length === 0 && !report.otroDanio) {
    errors.push('Captura al menos una falla o describe otro dano.');
  }

  if (!report.responsableUnidad) {
    errors.push('Captura el responsable de la unidad.');
  }

  if (!report.responsableRecibe) {
    errors.push('Captura el responsable que recibe.');
  }

  if (errors.length > 0) {
    throw ApiError.badRequest('El reporte no cumple los campos minimos.', errors);
  }
}

function validateStatus(status) {
  if (!STATUSES.includes(status)) {
    throw ApiError.badRequest('Estado de reporte invalido.', { status, allowed: STATUSES });
  }
}

export {
  normalizeReportPayload,
  validateMinimumReportFields,
  validateStatus
};
