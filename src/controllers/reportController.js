import ApiError from '../utils/apiError.js';
import { generateFolio } from '../utils/folio.js';
import repository from '../models/reportRepository.js';
import {
  normalizeReportPayload,
  validateMinimumReportFields,
  validateStatus
} from '../services/reportValidation.js';


function toPositiveInt(value, fallback, max) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 0) return fallback;
  return Math.min(parsed, max);
}

function getDb(c) {
  if (!c.env?.DB) {
    throw new ApiError(500, 'No esta configurado el binding DB de D1.');
  }

  return c.env.DB;
}

async function readJson(c) {
  try {
    return await c.req.json();
  } catch {
    return {};
  }
}

function isUniqueConflict(error) {
  return /unique|constraint/i.test(String(error?.message || ''));
}

export async function listReports(c) {
  const reports = await repository.listReports(getDb(c), {
    status: c.req.query('status'),
    q: c.req.query('q'),
    limit: toPositiveInt(c.req.query('limit'), 50, 200),
    offset: toPositiveInt(c.req.query('offset'), 0, 100000)
  });

  return c.json({ data: reports });
}

export async function getReport(c) {
  const report = await repository.getReport(getDb(c), c.req.param('folio'));
  if (!report) throw ApiError.notFound('Reporte no encontrado.');

  return c.json({ data: report });
}

export async function createReport(c) {
  const payload = await readJson(c);
  let lastError;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const report = normalizeReportPayload({ ...payload, folio: generateFolio() });
    validateMinimumReportFields(report);

    try {
      const created = await repository.insertReport(getDb(c), report);
      return c.json({ data: created }, 201);
    } catch (error) {
      lastError = error;
      if (!isUniqueConflict(error)) throw error;
    }
  }

  throw lastError || ApiError.conflict('No se pudo generar un folio unico.');
}

export async function updateReport(c) {
  const folio = c.req.param('folio');
  const existing = await repository.getReport(getDb(c), folio);
  if (!existing) throw ApiError.notFound('Reporte no encontrado.');

  const payload = await readJson(c);
  const report = normalizeReportPayload({ ...existing, ...payload, folio }, existing);
  validateMinimumReportFields(report);

  const updated = await repository.updateReport(getDb(c), folio, report);
  return c.json({ data: updated });
}

export async function updateReportStatus(c) {
  const payload = await readJson(c);
  const status = String(payload.status || '').trim();
  validateStatus(status);

  const report = await repository.updateStatus(getDb(c), c.req.param('folio'), status);
  if (!report) throw ApiError.notFound('Reporte no encontrado.');

  return c.json({ data: report });
}

export default {
  createReport,
  getReport,
  listReports,
  updateReport,
  updateReportStatus
};

