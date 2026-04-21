/**
 * Dice's Coefficient: returns a similarity score between 0 and 1
 */
export function diceCoefficient(s1, s2) {
  const first = s1.replace(/\s+/g, '').toLowerCase();
  const second = s2.replace(/\s+/g, '').toLowerCase();

  if (first === second) return 1;
  if (first.length < 2 || second.length < 2) return 0;

  const firstBigrams = new Map();
  for (let i = 0; i < first.length - 1; i++) {
    const bigram = first.substring(i, i + 2);
    const count = firstBigrams.has(bigram) ? firstBigrams.get(bigram) + 1 : 1;
    firstBigrams.set(bigram, count);
  }

  let intersectionSize = 0;
  for (let i = 0; i < second.length - 1; i++) {
    const bigram = second.substring(i, i + 2);
    const count = firstBigrams.has(bigram) ? firstBigrams.get(bigram) : 0;

    if (count > 0) {
      firstBigrams.set(bigram, count - 1);
      intersectionSize++;
    }
  }

  return (2.0 * intersectionSize) / (first.length + second.length - 2);
}

/**
 * Normalizes units to a standard set
 */
export function standardizeUnit(val) {
  if (!val) return 'unit';
  const u = String(val).toLowerCase().trim();
  
  if (u.includes('pckg') || u.includes('package') || u.includes('paket')) return 'Pckg';
  if (u.includes('unit') || u === 'unt' || u === 'unt.') return 'Unit';
  if (u.includes('pax') || u.includes('orang') || u === 'org' || u.includes('peserta')) return 'Pax';
  if (u.includes('hari') || u.includes('day')) return 'Day';
  if (u.includes('jam') || u.includes('hour')) return 'Hour';
  if (u.includes('bulan') || u.includes('month')) return 'Month';
  if (u.includes('kali') || u.includes('time')) return 'Time';
  if (u.includes('set')) return 'Set';
  
  // Capitalize first letter as fallback
  return u.charAt(0).toUpperCase() + u.slice(1);
}

/**
 * Guesses category based on item name keywords
 */
export function predictCategory(name) {
  const n = String(name || '').toLowerCase();
  
  const rules = [
    { cat: 'Operational / Permit', keys: ['permit', 'izin', 'polisi', 'polda', 'medis', 'ambulance', 'damkar', 'security', 'keamanan', 'safety'] },
    { cat: 'Talent & Artist', keys: ['band', 'guest', 'star', 'singer', 'penyanyi', 'mc', 'host', 'moderator', 'dancer'] },
    { cat: 'Production / System', keys: ['genset', 'listrik', 'sound', 'system', 'lighting', 'led', 'screen', 'rigging', 'stage', 'cable', 'kabel', 'mixer', 'switcher'] },
    { cat: 'Creative & Planning', keys: ['design', 'visual', 'content', 'concept', 'creative', 'registration', 'multimedia', 'animation'] },
    { cat: 'Branding & Decoration', keys: ['branding', 'cetak', 'pasang', 'backdrop', 'booth', 'dekor', 'furniture', 'sofa', 'table', 'carpet', 'karpet', 'banner', 'baliho', 't-banner'] },
    { cat: 'Logistic & Transport', keys: ['rent', 'mobil', 'transport', 'loading', 'mobilization', 'truck', 'hiace', 'alphard', 'inova', 'avanza'] },
    { cat: 'Documentation', keys: ['documentation', 'photo', 'video', 'highlight', 'shoot', 'film', 'drone'] }
  ];

  for (const rule of rules) {
    if (rule.keys.some(k => n.includes(k))) return rule.cat;
  }
  
  return 'General Items';
}
