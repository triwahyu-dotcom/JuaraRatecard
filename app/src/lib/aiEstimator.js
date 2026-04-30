import { ITEM_BUNDLES } from '../data/bundles';

/**
 * AI Estimator Prototype
 * Matches user input keywords to existing item bundles.
 */

const KEYWORD_MAP = {
  'led': ['pkg-main-led-system', 'pkg-program-wing-led', 'pkg-floor-led'],
  'video': ['pkg-main-led-system', 'pkg-program-wing-led'],
  'screen': ['pkg-main-led-system'],
  'vip': ['pkg-vip-lounge'],
  'lounge': ['pkg-vip-lounge'],
  'hospitality': ['pkg-vip-lounge'],
  'makan': ['pkg-fb-area'],
  'f&b': ['pkg-fb-area'],
  'food': ['pkg-fb-area'],
  'tent': ['pkg-fb-area'],
  'medical': ['pkg-medical-vvip'],
  'medis': ['pkg-medical-vvip'],
  'ambulance': ['pkg-medical-vvip'],
  'icu': ['pkg-medical-vvip'],
  'registration': ['pkg-reg-area', 'pkg-manpower-ushers'],
  'reg': ['pkg-reg-area'],
  'tiket': ['pkg-reg-area'],
  'vouchers': ['pkg-reg-area'],
  'stage': ['pkg-basic-stage-sound'],
  'panggung': ['pkg-basic-stage-sound'],
  'sound': ['pkg-basic-stage-sound'],
  'lighting': ['pkg-lighting-standard'],
  'lampu': ['pkg-lighting-standard'],
  'usher': ['pkg-manpower-ushers'],
  'spg': ['pkg-manpower-ushers'],
  'branding': ['pkg-branding-basic'],
  'id card': ['pkg-branding-basic'],
  'streaming': ['pkg-broadcast-streaming'],
  'broadcast': ['pkg-broadcast-streaming'],
  'zoom': ['pkg-broadcast-streaming'],
  'afm': ['pkg-after-movie-afm'],
  'after movie': ['pkg-after-movie-afm'],
  'dokumentasi': ['pkg-after-movie-afm'],
  'video': ['pkg-after-movie-afm', 'pkg-main-led-system'],
  'cinematic': ['pkg-after-movie-afm'],
  'audience': ['pkg-audience-flow'],
  'flow': ['pkg-audience-flow'],
  'queue': ['pkg-audience-flow'],
  'antrian': ['pkg-audience-flow'],
  'crowd': ['pkg-audience-flow'],
  'booth': ['pkg-booth-games', 'pkg-reg-area'],
  'games': ['pkg-booth-games'],
  'ps5': ['pkg-booth-games'],
  'console': ['pkg-booth-games'],
  'event': ['pkg-fb-area', 'pkg-reg-area'], // Basic defaults
  'gala': ['pkg-vip-lounge', 'pkg-main-led-system', 'pkg-lighting-standard'],
  'concert': ['pkg-main-led-system', 'pkg-lighting-standard', 'pkg-basic-stage-sound', 'pkg-after-movie-afm'],
  'meeting': ['pkg-vip-lounge', 'pkg-reg-area', 'pkg-branding-basic', 'pkg-audience-flow']
};

export function suggestBundles(input) {
  if (!input) return [];
  
  const text = input.toLowerCase();
  const matchedIds = new Set();
  
  Object.keys(KEYWORD_MAP).forEach(keyword => {
    if (text.includes(keyword)) {
      KEYWORD_MAP[keyword].forEach(id => matchedIds.add(id));
    }
  });
  
  return ITEM_BUNDLES.filter(b => matchedIds.has(b.id));
}

export function getItemsFromBundles(bundleIds) {
  const selectedBundles = ITEM_BUNDLES.filter(b => bundleIds.includes(b.id));
  let allItems = [];
  
  selectedBundles.forEach(bundle => {
    allItems = [...allItems, ...bundle.items.map(item => ({
      ...item,
      section_name: bundle.name, // Assign bundle name as section
    }))];
  });
  
  return allItems;
}
