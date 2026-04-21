import * as xlsx from 'xlsx';
import { calcLineSell, calcSummary, calcAllSectionSellTotals, getUniqueSections, getQuotationLines } from './calc';
import { fmtDate } from './fmt';

export function exportQuotationToXls(quotation) {
  const items = getQuotationLines(quotation);
  const eventData = quotation;
  const sections = getUniqueSections(items);
  const sectionTotals = calcAllSectionSellTotals(items);
  
  const summary = calcSummary(items, {
    discount_type:  eventData.discount_type,
    discount_value: eventData.discount_value,
    mgmt_value:     Math.round((eventData.mgmt_fee_rate || 0.1) * 100),
    ppn_rate:       Math.round((eventData.ppn_rate || 0.12) * 100),
  });


  // First we build the data rows for the sheet
  const rows = [];
  
  // Header Infos
  rows.push(['CLIENT', eventData.client]);
  rows.push(['EVENT TITLE', eventData.event_title]);
  rows.push(['DATE', eventData.event_date ? fmtDate(eventData.event_date) : '']);
  rows.push(['VENUE', eventData.venue]);
  rows.push(['CITY', eventData.city]);
  rows.push(['NUMBER', eventData.quot_number]);
  rows.push([]); // empty row
  
  // Table Headers
  rows.push(['NO', 'SECTION', 'CATEGORY', 'ZONE', 'ITEM / TASK', 'VARIANT', 'SPECIFICATION', 'QTY', 'UNIT', 'DUR', 'DUR UNIT', 'PRICE', 'AMOUNT']);
  
  // Details
  let globalIndex = 1;
  
  sections.forEach((sec) => {
    const secItems = items.filter(i => i.section_code === sec.code);
    rows.push([globalIndex++, `${sec.code} - ${sec.name}`, '', '', '', '', '', '', '', sectionTotals[sec.code] || 0]);
    
    const categories = [...new Set(secItems.map(i => i.category))];
    
    categories.forEach(cat => {
      rows.push(['', '', cat, '', '', '', '', '', '', '', '', '', '']); // category row
      
      const catItems = secItems.filter(i => i.category === cat);
      catItems.forEach(item => {
        const amount = calcLineSell(item);
        const priceStr = item.is_complimentary ? 'complimentary' : item.unit_sell || 0;
        const amountStr = item.is_complimentary ? 'complimentary' : amount || 0;
        
        // duration support (old freq or new duration)
        const dQty = item.duration_qty ?? item.freq ?? 1;
        const dUnit = item.duration_unit ?? item.freq_unit ?? 'day';

        rows.push([
          '', // NO
          '', // SECTION
          '', // CATEGORY
          item.zone_name || '',
          item.item_name,
          item.variant_name || '',
          item.spec || '',
          item.qty,
          item.qty_unit,
          dQty,
          dUnit,
          priceStr,
          amountStr
        ]);
      });
    });
  });

  const mgmtPct = Math.round((eventData.mgmt_fee_rate || 0.1) * 100);
  const ppnPct = Math.round((eventData.ppn_rate || 0.12) * 100);

  rows.push([]);
  rows.push(['', '', '', '', '', '', '', '', '', '', '', 'Total Cost (Subtotal)', summary.subtotal]);
  if (summary.discountAmount > 0) {
    rows.push(['', '', '', '', '', '', '', '', '', '', '', 'Diskon', -summary.discountAmount]);
  }
  rows.push(['', '', '', '', '', '', '', '', '', '', '', `Management Fee ${mgmtPct}%`, summary.mgmtFeeAmount]);
  rows.push(['', '', '', '', '', '', '', '', '', '', '', 'Dasar Pengenaan Pajak (DPP)', summary.taxBase]);
  rows.push(['', '', '', '', '', '', '', '', '', '', '', `PPN ${ppnPct}%`, summary.ppnAmount]);
  rows.push(['', '', '', '', '', '', '', '', '', '', '', 'GRAND TOTAL', summary.grandTotal]);
  
  // Create workbook
  const worksheet = xlsx.utils.aoa_to_sheet(rows);
  const workbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(workbook, worksheet, "Quotation");
  
  // File name
  const safeTitle = (eventData.event_title || '').replace(/[^a-zA-Z0-9]/g, '_') || 'quotation';
  const fileName = `${eventData.quot_number || 'draft'}_${safeTitle}.xlsx`;
  
  // Save
  xlsx.writeFile(workbook, fileName);
}
