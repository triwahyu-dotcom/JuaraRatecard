import * as pdfjsLib from 'pdfjs-dist';
import { standardizeUnit } from './stringUtils';

// Use CDN for worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export async function importFromPDFSync(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const typedarray = new Uint8Array(e.target.result);
        const pdf = await pdfjsLib.getDocument(typedarray).promise;
        const numPages = pdf.numPages;
        const itemsList = [];

        let currentSection = { code: 'A', name: 'Imported' };
        let currentCategory = '';
        let itemCounter = 0;
        
        // 0. METADATA EXTRACTION (Scan first page)
        const metadata = { event_name: '', event_date: '', event_venue: '', client_name: '' };
        const firstPage = await pdf.getPage(1);
        const firstPageText = await firstPage.getTextContent();
        const headerLines = [];
        const linesMapHeader = {};
        firstPageText.items.forEach(item => {
          const y = Math.round(item.transform[5]);
          if (!linesMapHeader[y]) linesMapHeader[y] = [];
          linesMapHeader[y].push({ text: item.str, x: item.transform[4] });
        });
        Object.keys(linesMapHeader).sort((a,b) => b-a).forEach(y => {
          headerLines.push(linesMapHeader[y].sort((a,b) => a.x-b.x).map(i => i.text).join(' ').trim());
        });

        headerLines.slice(0, 15).forEach(line => {
          if (/^event/i.test(line))   metadata.event_name  = line.replace(/^event\s*:?\s*/i, '').trim();
          if (/^date/i.test(line))    metadata.event_date  = line.replace(/^date\s*:?\s*/i, '').trim();
          if (/^venue/i.test(line))   metadata.event_venue = line.replace(/^venue\s*:?\s*/i, '').trim();
          if (/^quot to/i.test(line)) metadata.client_name = line.replace(/^quot to\s*:?\s*/i, '').trim();
        });

        for (let pageNum = 1; pageNum <= numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const textContent = await page.getTextContent();
          
          if (textContent.items.length === 0) continue;

          // Group by Y coordinates
          const linesMap = {};
          textContent.items.forEach(item => {
            const y = Math.round(item.transform[5]); 
            if (!linesMap[y]) linesMap[y] = [];
            linesMap[y].push({ text: item.str, x: item.transform[4], w: item.width });
          });

          const sortedY = Object.keys(linesMap).map(Number).sort((a,b) => b - a);
          
          for (let y of sortedY) {
            let rowItems = linesMap[y].sort((a,b) => a.x - b.x);
            let lineText = rowItems.map(i => i.text).join(' ').trim();
            let upperLine = lineText.toUpperCase();
            
            if (upperLine.includes('TOTAL') || upperLine.includes('PPN') || upperLine.includes('PAGE') || upperLine.includes('ITEM / TASK') || upperLine.includes('ITEM/TASK') || lineText.length < 2) continue;

            // SPECIAL CASE: Section Header might be at the end of a line due to PDF grouping
            // Detect something like "  E COMMITTEE  123.000"
            const tailSectionMatch = lineText.match(/\s+([A-Z])\s+([A-Z\s\&\/]+)(?:\s+[\d\.,]+)?$/);
            if (tailSectionMatch) {
                currentSection.code = tailSectionMatch[1];
                currentSection.name = tailSectionMatch[2].trim();
                currentCategory = '';
                // Remove the section part from the line for further processing
                lineText = lineText.substring(0, tailSectionMatch.index).trim();
                rowItems = rowItems.filter(ri => ri.x < tailSectionMatch.index || !lineText.includes(ri.text));
            }

            // 1. Detect Standard Section Header (Start of line)
            // Example: "A  PLAN & DEVELOPMENT" (x < 60)
            const firstToken = rowItems[0];
            const sectionMatch = lineText.match(/^([A-Z])\s+([A-Z\s\&\/]+)(?:\s+[\d\.,]+)?$/);
            if (sectionMatch && firstToken.x < 65 && !lineText.includes('.')) {
                currentSection.code = sectionMatch[1];
                currentSection.name = sectionMatch[2].trim();
                currentCategory = '';
                continue;
            }

            // 2. Item Row Processing - Use Coordinate Windows
            // Qty: ~315, Freq: ~350, Dur: ~385, Price: ~445, Total: ~500
            const qtyToken   = rowItems.find(ri => ri.x > 300 && ri.x < 340 && isNumeric(ri.text));
            const priceToken = rowItems.find(ri => ri.x > 410 && ri.x < 485); // Can be text like "Provide by..."
            const totalToken = rowItems.find(ri => ri.x > 490 && ri.x < 560);

            if (qtyToken && (priceToken || totalToken)) {
                const qty   = parsePrice(qtyToken.text) || 1;
                const freq  = parsePrice(rowItems.find(ri => ri.x > 340 && ri.x < 370)?.text || '1');
                const dur   = parsePrice(rowItems.find(ri => ri.x >= 370 && ri.x < 405)?.text || '1');
                
                // Price extraction: prioritize numeric, fallback to text
                let unitSell = 0;
                if (priceToken) {
                    const numPrice = parsePrice(priceToken.text);
                    unitSell = (numPrice > 0 || priceToken.text === '0') ? numPrice : priceToken.text;
                } else if (totalToken) {
                    // Back-calculate if only total exists
                    const numTotal = parsePrice(totalToken.text);
                    unitSell = numTotal / (qty * freq * dur);
                }

                // Name is everything to the left of Qty
                let namePart = rowItems.filter(ri => ri.x < 300).map(ri => ri.text).join(' ').trim();
                namePart = namePart.replace(/^[\d\.]+\s+/, ''); // Remove leading numbers like "B.1.1"

                if (namePart.length > 2) {
                    const unitMatch = lineText.match(/(pckg|unit|prs|pcs|pax|hari|day|time|set|event|mtr|meter|person|group|pack)/i);
                    const unit = standardizeUnit(unitMatch ? unitMatch[0] : 'unit');

                    itemsList.push({
                        _ratecard_key: `pdf-${Date.now()}-${itemCounter++}`,
                        section_code: currentSection.code,
                        section_name: currentSection.name,
                        category: currentCategory || currentSection.name,
                        item_name: namePart,
                        spec: '', 
                        qty: qty,
                        qty_unit: unit,
                        duration_qty: freq,
                        duration_unit: 'time',
                        frequency_qty: dur,
                        frequency_unit: 'project',
                        unit_sell: unitSell,
                        unit_cost: 0,
                        sort_order: itemCounter
                    });
                }
            } else if (lineText.length > 3 && !lineText.match(/\d/) && rowItems[0].x < 150) {
                // 3. Category Detection (Non-numeric lines starting at certain offset)
                currentCategory = lineText;
            }
          }
        }

        if (itemsList.length === 0) {
           throw new Error("Gagal mengekstrak data PDF.");
        }
        
        resolve({ items: itemsList, metadata });
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
}

function isNumeric(val) {
  const clean = val.replace(/[,.]/g, '').trim();
  if (clean.length === 0) return false;
  const n = Number(clean);
  // Ignore single digit numbers that look like list indicators
  return !isNaN(n) && (clean.length > 1 || n > 0);
}

function parsePrice(val) {
  return Number(val.replace(/[,.]/g, '')) || 0;
}
