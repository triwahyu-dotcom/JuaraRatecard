/**
 * Format number to Indonesian style: 1.234.567
 */
export function fmt(n) {
  if (n === null || n === undefined || n === 0) return '-';
  return Math.round(n).toLocaleString('id-ID');
}

/**
 * Format with Rp prefix
 */
export function fmtRp(n) {
  if (n === null || n === undefined) return '-';
  return 'Rp ' + Math.round(n).toLocaleString('id-ID');
}

/**
 * Generate quotation number
 * Format: [SEQ]/QUOT/JBBS/[CLIENT-EVENT]/[MONTH_ROMAN]/[YEAR]
 */
export function generateQuotNumber(client, event, date) {
  const romans = ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII'];
  const d = date ? new Date(date) : new Date();
  const month = romans[d.getMonth()];
  const year = d.getFullYear();
  const slug = `${client}-${event}`
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .slice(0, 20);
  const seq = String(Math.floor(Math.random() * 99) + 1).padStart(2, '0');
  return `${seq}/QUOT/JBBS/${slug}/${month}/${year}`;
}

/**
 * Format date to Indonesian string: "15 Mei 2026"
 */
export function fmtDate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return '';
  try {
    const months = ['Januari','Februari','Maret','April','Mei','Juni',
      'Juli','Agustus','September','Oktober','November','Desember'];
    const parts = dateStr.split('T')[0].split('-');
    if (parts.length < 3) return dateStr; // fallback
    const d = new Date(dateStr + 'T00:00:00');
    if (isNaN(d.getTime())) return dateStr;
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  } catch (e) {
    return dateStr || '';
  }
}
