const pdfjs = require('pdfjs-dist');
const path = require('path');

async function debugPDF() {
    const filePath = '/Users/yudiqitrick/Desktop/juara-ratecard/knowledge-base/Quotation Heppiii Skate Day.pdf';
    const loadingTask = pdfjs.getDocument(filePath);
    const pdf = await loadingTask.promise;
    
    console.log(`--- PDF TEXT (Page 1) ---`);
    const page = await pdf.getPage(1);
    const textContent = await page.getTextContent();
    
    // Group by Y
    const lines = {};
    textContent.items.forEach(item => {
        const y = Math.round(item.transform[5]);
        if (!lines[y]) lines[y] = [];
        lines[y].push({ text: item.str, x: Math.round(item.transform[4]) });
    });
    
    const sortedY = Object.keys(lines).map(Number).sort((a, b) => b - a);
    sortedY.forEach(y => {
        const row = lines[y].sort((a, b) => a.x - b.x).map(i => `[x:${i.x}] ${i.text}`).join(' | ');
        console.log(`Y:${y} | ${row}`);
    });
}

debugPDF().catch(console.error);
