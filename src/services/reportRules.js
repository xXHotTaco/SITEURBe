const STATUSES = ['Recepcion', 'Diagnostico', 'Autorizado', 'En reparacion', 'Listo', 'Cerrado'];
const PRIORITIES = ['Auto', 'Baja', 'Media', 'Alta', 'Critica'];
const AREAS = ['Mecanica', 'Electrico', 'Carroceria', 'Servicio', 'Sin asignar'];

function normalizeText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function textBag(report) {
  return [
    ...(Array.isArray(report.fallas) ? report.fallas : []),
    ...(Array.isArray(report.condiciones) ? report.condiciones : []),
    report.otroDanio,
    report.areaSintoma,
    report.descripcion,
    report.temperaturaMotor
  ].map(normalizeText).join(' ');
}

function numericTemperature(value) {
  const match = String(value || '').match(/\d+(\.\d+)?/);
  return match ? Number(match[0]) : null;
}

function calculatePriority(report) {
  if (report.prioridadManual && report.prioridadManual !== 'Auto') {
    return report.prioridadManual;
  }

  const bag = textBag(report);
  const temperature = numericTemperature(report.temperaturaMotor);

  const critical = [
    'freno',
    'direccion',
    'incendio',
    'combustible',
    'fuga de diesel',
    'sobrecalentamiento',
    'temperatura alta'
  ];

  const high = [
    'motor',
    'transmision',
    'suspension',
    'llanta',
    'neumatico',
    'bateria',
    'alternador',
    'arranque'
  ];

  if (critical.some((word) => bag.includes(word)) || (temperature !== null && temperature >= 105)) {
    return 'Critica';
  }

  if (high.some((word) => bag.includes(word)) || (temperature !== null && temperature >= 95)) {
    return 'Alta';
  }

  if (bag.includes('ruido') || bag.includes('vibracion') || bag.includes('intermitente')) {
    return 'Media';
  }

  return 'Baja';
}

function suggestArea(report) {
  const bag = textBag(report);

  const checks = [
    ['Electrico', ['electrico', 'luz', 'luces', 'bateria', 'alternador', 'fusible', 'arnes', 'sensor']],
    ['Carroceria', ['carroceria', 'golpe', 'puerta', 'cristal', 'parabrisas', 'espejo', 'defensa']],
    ['Servicio', ['servicio', 'mantenimiento', 'aceite', 'filtro', 'limpieza', 'nivel']],
    ['Mecanica', ['motor', 'freno', 'direccion', 'transmision', 'suspension', 'temperatura', 'fuga', 'llanta']]
  ];

  for (const [area, words] of checks) {
    if (words.some((word) => bag.includes(word))) {
      return area;
    }
  }

  return 'Sin asignar';
}

export {
  AREAS,
  PRIORITIES,
  STATUSES,
  calculatePriority,
  suggestArea
};
