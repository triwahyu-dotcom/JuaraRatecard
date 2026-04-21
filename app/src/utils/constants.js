/**
 * Master Category definition and fixed sort order
 */
export const MASTER_CATEGORIES = [
  'Planning & Development',
  'Permit & Retribusi',
  'Venue / Setup / System',
  'Multimedia / Creative',
  'Production / Fabrication',
  'Manpower / Crew',
  'Talent / Entertainment',
  'Transportation / Logistics',
  'Accommodation / Consumption',
  'Documentation / Reporting',
  'Miscellaneous / Additional Cost'
];

export const CATEGORY_COLORS = {
  'Planning & Development': '#93c5fd', // Bright Blue
  'Permit & Retribusi': '#fda4af',     // Soft Rose/Red
  'Venue / Setup / System': '#86efac', // Bright Green
  'Multimedia / Creative': '#d8b4fe',  // Bright Purple
  'Production / Fabrication': '#fde047', // Sun Yellow
  'Manpower / Crew': '#67e8f9',        // Bright Cyan
  'Talent / Entertainment': '#f9a8d4', // Bright Pink
  'Transportation / Logistics': '#c4b5fd', // Soft Violet
  'Accommodation / Consumption': '#5eead4', // Soft Teal
  'Documentation / Reporting': '#fdba74', // Bright Orange
  'Miscellaneous / Additional Cost': '#cbd5e1' // Modern Slate/Light Gray
};

export function getCategoryOrder(categoryName) {
  const index = MASTER_CATEGORIES.indexOf(categoryName);
  return index === -1 ? 999 : index;
}
