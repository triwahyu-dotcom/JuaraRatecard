const pdfjsLib = require('pdfjs-dist/build/pdf.js');
const fs = require('fs');

const pdfPath = '/Users/yudiqitrick/Desktop/juara-ratecard/knowledge-base/Quotation Pengukuhan MUI 7Feb Istiqlal_signed.pdf';

async function extractText() {
    const data = new Uint8Array(fs.readFileSync(pdfPath));
    const loadingTask = pdfjsLib.getDocument({
        data,
        disableFontFace: true,
        verbosity: 0
    });
    const pdf = await loadingTask.promise;
    
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const strings = textContent.items.map(item => item.str);
        fullText += strings.join(' ') + '\n';
    }
    console.log("--- PDF CONTENT START ---");
    console.log(fullText);
    console.log("--- PDF CONTENT END ---");
}

extractText().catch(console.error);
