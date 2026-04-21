import * as pdfjsLib from 'pdfjs-dist';
import { standardizeUnit } from './stringUtils';

// Use CDN for worker to avoid complex bundler configurations with Vite
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

/**
 * Extracts and reconstructs data from a PDF file using structural analysis.
 */
export async function importFromPDFSync(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const typedarray = new Uint8Array(e.target.result);
        const pdf = await pdfjsLib.getDocument(typedarray).promise;
        const numPages = pdf.numPages;
        const itemsList = [];

        let currentSection = { code: 'A', name: '' };
        let itemCounter = 0;
        let lastItem = null;

        for (let pageNum = 1; pageNum <= numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const textContent = await page.getTextContent();
          
          if (textContent.items.length === 0) continue;

          // Group by Y with grouping tolerance
          const itemsByY = {};
          textContent.items.forEach(item => {
            const y = Math.round(item.transform[5] / 4) * 4; 
            if (!itemsByY[y]) itemsByY[y] = [];
            itemsByY[y].push({ text: item.str.trim(), x: item.transform[4], w: item.width });
          });

          const sortedY = Object.keys(itemsByY).map(Number).sort((a,b) => b - a);
          
          for (let y of sortedY) {
            const rowItems = itemsByY[y].sort((a,b) => a.x - b.x);
            if (rowItems.length === 0) continue;

            const lineText = rowItems.map(i => i.text).join(' ');
            const upperLine = lineText.toUpperCase();
            
            // Skip noisy lines
            if (upperLine.includes('TOTAL') || upperLine.includes('SPECIFICATION') || upperLine.includes('PPN')) continue;
            if (upperLine.includes('PAGE') && upperLine.includes('OF')) continue;
            if (lineText.length < 2) continue;

            // Detect Section (e.g. "A PLANNING")
            const sectionMatch = lineText.match(/^([A-Z])(?:\s+(.+))?$/);
            if (sectionMatch && !lineText.match(/\d/)) { 
               currentSection.code = sectionMatch[1];
               currentSection.name = sectionMatch[2] || '';
               lastItem = null; // reset multi-line context
               continue;
            }

            const numberTokens = rowItems.filter(ri => isNumeric(ri.text));
            
            if (numberTokens.length >= 1) {
               // Item Row Detected
               const nums = numberTokens.map(nt => parsePrice(nt.text));
               const qty = nums[0] || 1;
               const price = nums.length >= 2 ? nums[nums.length - 2] : (nums[0] > 1000 ? nums[0] : 0);

               // Find name
               const firstNumIdx = rowItems.findIndex(ri => isNumeric(ri.text));
               let name = firstNumIdx > 0 ? rowItems.slice(0, firstNumIdx).map(ri => ri.text).join(' ') : lineText.split(/\s\d/)[0];
               name = name.replace(/^[\d\s\.\-]+/, '').trim();

               // Find units
               const unitTokens = rowItems.map(ri => ri.text.toUpperCase());
               const unitMatch = unitTokens.find(t => ['PCKG', 'UNIT', 'ORG', 'HARI', 'DAY', 'TIME', 'PC', 'PAX'].includes(t));
               const unit = standardizeUnit(unitMatch || 'unit');

               if (name.length > 2 && name.toUpperCase() !== 'ITEM') {
                  lastItem = {
                    _ratecard_key: `imported-pdf-${Date.now()}-${itemCounter++}`,
                    section_code: currentSection.code,
                    section_name: currentSection.name,
                    category: '',
                    item_name: name,
                    qty: qty,
                    qty_unit: unit,
                    duration_qty: 1,
                    duration_unit: 'time',
                    unit_sell: price,
                    unit_cost: 0,
                    sort_order: itemCounter
                  };
                  itemsList.push(lastItem);
               }
            } else if (lastItem && lineText.length > 3 && !upperLine.includes('DATE')) {
               // Potential Multi-line wrap
               // If this row has no numbers and we have a lastItem, append this text to lastItem name
               lastItem.item_name += ' ' + lineText;
            }
          }
        }

        if (itemsList.length === 0) {
           throw new Error("File PDF tidak memiliki data item yang bisa dibaca. Pastikan PDF memiliki lapisan teks (bukan hasil scan).");
        }
        
        resolve(itemsList);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
}

function isNumeric(val) {
  const clean = val.replace(/[,.]/g, '');
  return /^\d+$/.test(clean) && clean.length > 0;
}

function parsePrice(val) {
  return Number(val.replace(/[,.]/g, '')) || 0;
}
