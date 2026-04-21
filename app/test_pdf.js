import fs from 'fs';
import pkg from 'pdfjs-dist/legacy/build/pdf.js';
const { getDocument } = pkg;

async function test() {
  const buffer = fs.readFileSync('../knowledge-base/PGN - QUOTATION APPROVED MIRELLA.pdf');
  const typedarray = new Uint8Array(buffer);
  const pdf = await getDocument(typedarray).promise;
  console.log('Total pages:', pdf.numPages);
  
  for (let i = 1; i <= pdf.numPages; i++) {
     const page = await pdf.getPage(i);
     const textContent = await page.getTextContent();
     const strs = textContent.items.filter(i => i.str.trim().length > 0);
     console.log('Page', i, 'has', strs.length, 'strings');
     if (strs.length > 0) {
        console.log('Sample:', strs.slice(0, 10).map(s => s.str).join(' | '));
     }
  }
}
test().catch(console.error);
