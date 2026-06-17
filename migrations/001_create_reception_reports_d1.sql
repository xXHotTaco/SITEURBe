CREATE TABLE IF NOT EXISTS reception_reports (
  folio TEXT PRIMARY KEY,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  status TEXT NOT NULL DEFAULT 'Recepcion'
    CHECK (status IN ('Recepcion', 'Diagnostico', 'Autorizado', 'En reparacion', 'Listo', 'Cerrado')),

  fecha TEXT NOT NULL,
  hora TEXT NOT NULL,
  linea TEXT NOT NULL DEFAULT '',
  patio TEXT NOT NULL DEFAULT '',

  unidad TEXT NOT NULL DEFAULT '',
  no_economico TEXT NOT NULL DEFAULT '',
  placas TEXT NOT NULL DEFAULT '',
  marca TEXT NOT NULL DEFAULT '',
  modelo TEXT NOT NULL DEFAULT '',
  anio TEXT NOT NULL DEFAULT '',
  kilometraje TEXT NOT NULL DEFAULT '',

  operador TEXT NOT NULL DEFAULT '',
  expediente TEXT NOT NULL DEFAULT '',
  telefono TEXT NOT NULL DEFAULT '',
  responsable_unidad TEXT NOT NULL DEFAULT '',
  responsable_recibe TEXT NOT NULL DEFAULT '',
  supervisor TEXT NOT NULL DEFAULT '',

  fallas TEXT NOT NULL DEFAULT '[]',
  otro_danio TEXT NOT NULL DEFAULT '',
  area_sintoma TEXT NOT NULL DEFAULT '',
  frecuencia TEXT NOT NULL DEFAULT '',
  modo_operacion TEXT NOT NULL DEFAULT '',
  condiciones TEXT NOT NULL DEFAULT '[]',
  velocidad TEXT NOT NULL DEFAULT '',
  cuando TEXT NOT NULL DEFAULT '',
  temperatura_motor TEXT NOT NULL DEFAULT '',

  descripcion TEXT NOT NULL DEFAULT '',
  diagnostico TEXT NOT NULL DEFAULT '',

  prioridad_manual TEXT NOT NULL DEFAULT 'Auto'
    CHECK (prioridad_manual IN ('Auto', 'Baja', 'Media', 'Alta', 'Critica')),
  prioridad_calculada TEXT NOT NULL DEFAULT 'Media'
    CHECK (prioridad_calculada IN ('Baja', 'Media', 'Alta', 'Critica')),
  area_sugerida TEXT NOT NULL DEFAULT 'Sin asignar'
    CHECK (area_sugerida IN ('Mecanica', 'Electrico', 'Carroceria', 'Servicio', 'Sin asignar')),

  firma_operador TEXT NOT NULL DEFAULT '',
  firma_recepcion TEXT NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_reception_reports_status
  ON reception_reports (status);

CREATE INDEX IF NOT EXISTS idx_reception_reports_created_at
  ON reception_reports (created_at);

CREATE INDEX IF NOT EXISTS idx_reception_reports_no_economico
  ON reception_reports (no_economico);

CREATE INDEX IF NOT EXISTS idx_reception_reports_expediente
  ON reception_reports (expediente);

