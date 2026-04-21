/**
 * Quotation Templates for Juara Ratecard
 * -------------------------------------
 * Each template contains a list of items that are commonly used for specific event types.
 * items can reference master item names or categories.
 */

export const EVENT_TEMPLATES = [
  {
    id: 'indoor-concert',
    name: 'Indoor Concert (Orchestra/Magical)',
    description: 'Fokus pada Orchestral Sound, Lighting System, Area Foyer & F&B, serta Safety & Security.',
    items: [
      { category: 'Safety & Security Management', subcategory: 'Safety Support', item_name: 'Ambulance' },
      { category: 'Safety & Security Management', subcategory: 'Safety Support', item_name: 'DAMKAR' },
      { category: 'Venue / Setup / System', subcategory: 'Entrance & Security Gate', item_name: 'Main Gate Entrance' },
      { category: 'Venue / Setup / System', subcategory: 'Entrance & Security Gate', item_name: 'Gate Category' },
      { category: 'Venue / Setup / System', subcategory: 'Redemption Booth', item_name: 'R8 Ticket Booth' },
      { category: 'Venue / Setup / System', subcategory: 'Heating & Cooling (HVAC)', item_name: 'AC Portable' },
      { category: 'Venue / Setup / System', subcategory: 'Queue Management', item_name: 'Queue Line' },
      { category: 'Venue / Setup / System', subcategory: 'Perimeter', item_name: 'Baricade' },
      { category: 'Venue / Setup / System', subcategory: 'Branding Production', item_name: 'Brandingan Theatre Entrance' },
      { category: 'Venue / Setup / System', subcategory: 'Branding Production', item_name: 'Brandingan Pillar' },
      { category: 'Venue / Setup / System', subcategory: 'Photobooth Fabrication', item_name: 'Photobooth Glambot' },
      { category: 'Technical System', subcategory: 'Lighting System', item_name: 'Moving Head BSW 400' },
      { category: 'Technical System', subcategory: 'Lighting System', item_name: 'Follow Spot 4000' },
      { category: 'Technical System', subcategory: 'Lighting System', item_name: 'Freshnell LED Zoom' },
      { category: 'Technical System', subcategory: 'Lighting Support', item_name: 'Hazer' },
      { category: 'Technical System', subcategory: 'Lighting Control', item_name: 'Tiger Touch 2' },
      { category: 'Technical System', subcategory: 'Rigging System', item_name: 'Rigging Aluminium point 60x80' },
      { category: 'Technical System', subcategory: 'Sound System', item_name: 'Sound System 60.000 watt' },
      { category: 'Project Team', subcategory: 'Project Management', item_name: 'Project Manager' },
      { category: 'Project Team', subcategory: 'Project Management', item_name: 'Project Officer' },
      { category: 'Show Management', subcategory: 'Show Direction', item_name: 'Show Director' },
      { category: 'Show Management', subcategory: 'Stage Management', item_name: 'Stage Manager' },
      { category: 'Show Management', subcategory: 'Stage Management', item_name: 'Stage Crew' },
      { category: 'Safety / Security Team', subcategory: 'Guard Team', item_name: 'Internal Guard' },
      { category: 'Safety / Security Team', subcategory: 'Crowd Control', item_name: 'Crowd Control' },
      { category: 'Operational Tools & Supplies', subcategory: 'Communication Tools', item_name: 'Handy Talky' },
      { category: 'Operational Tools & Supplies', subcategory: 'Communication Tools', item_name: 'Clearcomm' },
      { category: 'Accommodation & Consumption', subcategory: 'Team Meals & Refreshment', item_name: 'Meals GR' },
      { category: 'Accommodation & Consumption', subcategory: 'Team Meals & Refreshment', item_name: 'Meals D-day' },
      { category: 'Permit & Retribusi', subcategory: 'Police Permit', item_name: 'Ijin Keramaian' }
    ]
  },
  {
    id: 'gala-dinner',
    name: 'Gala Dinner',
    description: 'Fokus pada Hospitality, VIP Setup, dan Dokumentasi.',
    items: [
      { category: 'Venue / Setup / System', subcategory: 'VIP / Holding Room Setup', item_name: 'Sofa' },
      { category: 'Venue / Setup / System', subcategory: 'VIP / Holding Room Setup', item_name: 'Round Table' },
      { category: 'Accommodation & Consumption', subcategory: 'Participant Consumption', item_name: 'Buffet Catering' },
      { category: 'Multimedia Support', subcategory: 'Motion & Video Content', item_name: 'Bumper Video' },
      { category: 'Event Documentation', subcategory: 'Video Documentation', item_name: 'Highlight Video' }
    ]
  },
  {
    id: 'launching-events',
    name: 'Launching Events',
    description: 'Fokus pada Branding, Fabrikasi (Backdrop/Stage), dan Creative Design.',
    items: [
      { category: 'Planning & Development', subcategory: 'Creative Design', item_name: '3D Visual' },
      { category: 'Venue / Setup / System', subcategory: 'Backdrop & Display Fabrication', item_name: 'Main Stage Backdrop' },
      { category: 'Venue / Setup / System', subcategory: 'Branding Production', item_name: 'Signage' },
      { category: 'Venue / Setup / System', subcategory: 'Stage', item_name: 'Stage' }
    ]
  },
  {
    id: 'afm',
    name: 'AFM (Audience Flow Management)',
    description: 'Fokus pada Keamanan, Crowd Control, dan Alur Pengunjung.',
    items: [
      { category: 'Permit & Retribusi', subcategory: 'Security Support', item_name: 'PAM' },
      { category: 'Venue / Setup / System', subcategory: 'Safety and Security Management', item_name: 'Security Assessment' },
      { category: 'Venue / Setup / System', subcategory: 'Perimeter', item_name: 'Mojo Barricade' },
      { category: 'Venue / Setup / System', subcategory: 'Entrance & Security Gate', item_name: 'Gate Entrance System' },
      { category: 'Venue / Setup / System', subcategory: 'Entrance & Security Gate', item_name: 'Secdoor' },
      { category: 'Operational Support', subcategory: 'Operational Tools & Supplies', item_name: 'Handy Talky' },
      { category: 'Manpower / Crew', subcategory: 'Safety / Security Team', item_name: 'Safety Security Officer' }
    ]
  }
];

export function findItemsInRatecard(templateItems, ratecardLines) {
  const result = [];
  templateItems.forEach(tItem => {
    // Try to find a match in ratecard lines
    const match = ratecardLines.find(rItem => 
      (rItem.master_item?.item_name || rItem.item_name)?.toLowerCase().includes(tItem.item_name.toLowerCase()) ||
      (rItem.master_category?.name || rItem.category)?.toLowerCase().includes(tItem.category.toLowerCase())
    );
    
    if (match) {
      result.push({
        ...match,
        qty: match.qty_default || 1,
        duration_qty: 1,
        frequency_qty: match.freq_default || 1,
        unit_price: match.unit_price || 0,
        unit_cost: match.unit_cost || 0,
      });
    } else {
      // Create a dummy line if not found
      result.push({
        id: crypto.randomUUID(),
        section: tItem.category,
        category: tItem.category,
        subcategory: tItem.subcategory,
        item_name: tItem.item_name,
        qty: 1,
        duration_qty: 1,
        frequency_qty: 1,
        unit_price: 0,
        unit_cost: 0,
        _is_placeholder: true
      });
    }
  });
  return result;
}
