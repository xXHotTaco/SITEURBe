function pad(value) {
  return String(value).padStart(2, '0');
}

export function generateFolio(date = new Date()) {
  const yyyy = date.getFullYear();
  const mm = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const hh = pad(date.getHours());
  const mi = pad(date.getMinutes());
  const ss = pad(date.getSeconds());
  const suffix = crypto.randomUUID().replace(/-/g, '').slice(0, 4).toUpperCase();

  return `RDU-${yyyy}${mm}${dd}-${hh}${mi}${ss}-${suffix}`;
}
