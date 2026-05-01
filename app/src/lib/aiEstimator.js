import { ITEM_BUNDLES } from '../data/bundles';

// ============================================
// FALLBACK: Keyword matching lama (tetap ada)
// ============================================
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
  'registration': ['pkg-reg-area', 'pkg-manpower-ushers'],
  'stage': ['pkg-basic-stage-sound'],
  'panggung': ['pkg-basic-stage-sound'],
  'sound': ['pkg-basic-stage-sound'],
  'lighting': ['pkg-lighting-standard'],
  'usher': ['pkg-manpower-ushers'],
  'streaming': ['pkg-broadcast-streaming'],
  'broadcast': ['pkg-broadcast-streaming'],
  'dokumentasi': ['pkg-after-movie-afm'],
  'concert': ['pkg-main-led-system', 'pkg-lighting-standard', 'pkg-basic-stage-sound'],
  'gala': ['pkg-vip-lounge', 'pkg-main-led-system', 'pkg-lighting-standard'],
  'meeting': ['pkg-vip-lounge', 'pkg-reg-area', 'pkg-branding-basic'],
};

export function suggestBundlesFallback(input) {
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

// Alias for backward compatibility
export const suggestBundles = suggestBundlesFallback;

// ============================================
// MAIN: AI Estimator dengan Claude API
// ============================================
export async function suggestBundlesAI({
  userInput,
  availableBundles = [],
  ratecardSummary = [],
  inputType = 'text',
  runAction,
  apiRef,
}) {
  try {
    const result = await runAction(apiRef.aiEstimator.estimateWithAI, {
      userInput,
      availableBundles,
      ratecardSummary,
      inputType,
    });

    const suggestedBundles = availableBundles.filter(b =>
      result.suggested_bundle_ids?.includes(b._id?.toString() || b.id)
    );

    return {
      bundles: suggestedBundles,
      suggestedCategories: result.suggested_categories || [],
      estimatedBudget: result.estimated_budget_range,
      eventSummary: result.event_summary,
      reasoning: result.reasoning,
      missingInfo: result.missing_info || [],
      newItemsNeeded: result.new_items_needed || [],
      confidence: result.confidence,
      source: 'ai',
    };
  } catch (error) {
    console.warn('AI Estimator gagal, fallback ke keyword matching:', error);
    const fallbackBundles = suggestBundlesFallback(userInput);
    return {
      bundles: fallbackBundles,
      suggestedCategories: [],
      estimatedBudget: null,
      eventSummary: null,
      reasoning: 'Hasil berdasarkan keyword matching (AI tidak tersedia)',
      missingInfo: [],
      newItemsNeeded: [],
      confidence: 'low',
      source: 'fallback',
      error: error.message,
    };
  }
}

// ============================================
// HELPER: Get items from selected bundles
// ============================================
export function getItemsFromBundles(bundleIds) {
  const selectedBundles = ITEM_BUNDLES.filter(b => bundleIds.includes(b.id));
  let allItems = [];
  selectedBundles.forEach(bundle => {
    allItems = [...allItems, ...bundle.items.map(item => ({
      ...item,
      section_name: bundle.name,
    }))];
  });
  return allItems;
}