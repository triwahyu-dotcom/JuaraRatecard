/**
 * Master Category definition and fixed sort order
 * Updated for 2026 Ratecard Structure
 */
export const MASTER_CATEGORIES = [
  'A. PLANNING & DEVELOPMENT',
  'B. PERMIT & RETRIBUSI',
  'C. HSE & SAFETY',
  'D. VENUE SETUP & SYSTEM',
  'E. TALENTS',
  'F. PARTICIPANT & AUDIENCE',
  'G. SHOW MANAGEMENT',
  'H. COMMITTEE & MANPOWER',
  'I. TRANSPORT & AKOMODASI',
  'J. F&B & KONSUMSI',
  'K. OPERATIONAL & MISCELLANEOUS'
];

export const CATEGORY_COLORS = {
  'A. PLANNING & DEVELOPMENT': '#93c5fd', 
  'B. PERMIT & RETRIBUSI': '#fda4af',     
  'C. HSE & SAFETY': '#fbbf24',           
  'D. VENUE SETUP & SYSTEM': '#86efac',   
  'E. TALENTS': '#f9a8d4',                
  'F. PARTICIPANT & AUDIENCE': '#d8b4fe', 
  'G. SHOW MANAGEMENT': '#67e8f9',        
  'H. COMMITTEE & MANPOWER': '#c4b5fd',   
  'I. TRANSPORT & AKOMODASI': '#5eead4',  
  'J. F&B & KONSUMSI': '#fdba74',         
  'K. OPERATIONAL & MISCELLANEOUS': '#94a3b8'
};

export function getCategoryOrder(categoryName) {
  if (!categoryName) return 999;
  const index = MASTER_CATEGORIES.findIndex(c => categoryName.toUpperCase().includes(c.toUpperCase()));
  return index === -1 ? 999 : index;
}
