import fs from 'fs';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.js';

async function importFromPDFSync(buffer) {
  const typedarray = new Uint8Array(buffer);
  const pdf = await pdfjsLib.getDocument(typedarray).promise;
  const numPages = pdf.numPages;
  const itemsList = [];

  let currentSection = { code: 'A', name: '' };
  let itemCounter = 0;

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    
    const linesObj = {};
    for (let item of textContent.items) {
      if (!item.str.trim()) continue;
      const y = Math.round(item.transform[5] / 4) * 4; 
      if (!linesObj[y]) {
        linesObj[y] = [];
      }
      linesObj[y].push({ text: item.str.trim(), x: item.transform[4] });
    }

    const sortedY = Object.keys(linesObj).map(Number).sort((a, b) => b - a);

    for (let y of sortedY) {
      const lineChunks = linesObj[y].sort((a, b) => a.x - b.x).map(c => c.text);
      const lineText = lineChunks.join(' ');
      
      const upperLine = lineText.toUpperCase();
      if (upperLine.includes('TOTAL') || upperLine.includes('ITEM / TASK') || upperLine.includes('SPECIFICATION')) {
         continue;
      }

      const sectionMatch = lineText.match(/^([A-Z])(?:\s+(.+))?$/);
      if (sectionMatch && !lineText.match(/\d/)) { 
         currentSection.code = sectionMatch[1];
         currentSection.name = sectionMatch[2] || '';
         continue;
      }

      const numberTokens = lineChunks.filter(c => /^[\d,.]+$/.test(c));
      
      if (numberTokens.length >= 1) {
         const parsedNumbers = numberTokens.map(n => {
            const plainStr = n.replace(/[,.]/g, ''); 
            return Number(plainStr);
         }).filter(n => !isNaN(n));

         const qty = parsedNumbers.length > 0 ? parsedNumbers[0] : 1;
         const price = parsedNumbers.length >= 2 ? parsedNumbers[parsedNumbers.length - 2] : (parsedNumbers[parsedNumbers.length - 1] || 0);

         const firstNumIndex = lineChunks.findIndex(c => /^[\d,.]+$/.test(c));
         let nameGuess = lineText;
         if (firstNumIndex > 0) {
           nameGuess = lineChunks.slice(0, firstNumIndex).join(' ');
         } else {
           nameGuess = lineText.replace(/[\d\.,]+/g, '').replace(/pckg|time|unit|org|hari/ig, '').trim();
         }

         nameGuess = nameGuess.replace(/^[- \.]+|[- \.]+$/g, '');

         if (nameGuess.length > 2) {
            itemsList.push({
              _ratecard_key: `imported-pdf-${Date.now()}-${itemCounter++}`,
              section_code: currentSection.code,
              section_name: currentSection.name,
              item_name: nameGuess,
              qty: qty || 1,
              unit_sell: price || 0
            });
         }
      }
    }
  }
  return itemsList;
}

const buffer = fs.readFileSync('./knowledge-base/PGN - QUOTATION APPROVED MIRELLA.pdf');
importFromPDFSync(buffer).then(items => {
   console.log('Got', items.length, 'items');
   console.log(items.slice(0, 10));
}).catch(console.error);
