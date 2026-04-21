import fs from 'fs';
import * as xlsx from 'xlsx';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.js';

// Mocking some browser globals for the test
global.FileReader = class {
    readAsArrayBuffer(file) {
        this.onload({ target: { result: file } });
    }
};

async function testExcel(filePath) {
    console.log('Testing Excel:', filePath);
    const data = fs.readFileSync(filePath);
    const workbook = xlsx.read(data, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rowsAOA = xlsx.utils.sheet_to_json(worksheet, { header: 1, defval: null });

    // Copied from excelSync.js
    function detectHierarchicalColumns(aoa) {
        const defaults = { id: 1, spec: 6, qty: 7, qty_unit: 8, freq: 9, freq_unit: 10, price: 11, item_name: 5 };
        for (let i = 0; i < Math.min(aoa.length, 15); i++) {
            const row = aoa[i];
            if (!row) continue;
            const rowStr = row.join('|').toUpperCase();
            if (rowStr.includes('ITEM') || rowStr.includes('QTY') || rowStr.includes('PRICE') || rowStr.includes('UNIT')) {
                const map = { ...defaults };
                row.forEach((cell, idx) => {
                    if (!cell) return;
                    const c = String(cell).toUpperCase();
                    if (c === 'NO') map.id = idx;
                    if (c.includes('ITEM') || c.includes('TASK') || c.includes('DESCRIPTION')) map.item_name = idx;
                    if (c.includes('SPEC')) map.spec = idx;
                    if (c === 'QTY') map.qty = idx;
                    if (c === 'UNIT') {
                        if (idx > map.qty && idx < map.qty + 3) map.qty_unit = idx;
                        else if (idx > map.freq) map.freq_unit = idx;
                    }
                    if (c.includes('FREQ') || c.includes('DUR')) map.freq = idx;
                    if (c.includes('PRICE') || c.includes('HARGA') || (c.includes('UNIT') && idx > 10)) map.price = idx;
                });
                return map;
            }
        }
        return defaults;
    }

    const colMap = detectHierarchicalColumns(rowsAOA);
    console.log('Detected Column Map:', colMap);
    
    // Test if some known columns are correct for test_excel.xlsx
    // For test_excel.xlsx, Qty should be 7, Price should be 11.
    if (colMap.qty === 7 && colMap.price === 11) {
        console.log('✅ Excel column detection successful.');
    } else {
        console.log('❌ Excel column detection failed. Expected Qty:7, Price:11. Got:', colMap);
    }
}

async function testPDF(filePath) {
    console.log('Testing PDF:', filePath);
    const data = fs.readFileSync(filePath);
    const typedarray = new Uint8Array(data);
    const pdf = await pdfjsLib.getDocument(typedarray).promise;
    
    const page = await pdf.getPage(1);
    const textContent = await page.getTextContent();
    
    const itemsByY = {};
    textContent.items.forEach(item => {
        const y = Math.round(item.transform[5] / 3) * 3;
        if (!itemsByY[y]) itemsByY[y] = [];
        itemsByY[y].push({ text: item.str.trim(), x: item.transform[4], w: item.width });
    });

    const sortedY = Object.keys(itemsByY).map(Number).sort((a,b) => b - a);
    let itemsFound = 0;
    
    function isNumeric(val) {
        const clean = val.replace(/[,.]/g, '');
        return /^\d+$/.test(clean) && clean.length > 0;
    }

    for (let y of sortedY) {
        const rowItems = itemsByY[y].sort((a,b) => a.x - b.x);
        if (rowItems.length === 0) continue;
        const lineText = rowItems.map(i => i.text).join(' ');
        const numberTokens = rowItems.filter(ri => isNumeric(ri.text));
        
        if (numberTokens.length >= 1) {
            const firstNumIdx = rowItems.findIndex(ri => isNumeric(ri.text));
            let name = '';
            if (firstNumIdx > 0) {
              name = rowItems.slice(0, firstNumIdx).map(ri => ri.text).join(' ');
            } else {
              name = lineText.split(/\s\d/)[0];
            }
            name = name.replace(/^[\d\s\.\-]+/, '').trim();
            if (name.length > 2 && name.toUpperCase() !== 'ITEM') {
                itemsFound++;
                if (itemsFound === 1) console.log('First item detected:', name);
            }
        }
    }
    console.log('Total items detected in first page:', itemsFound);
    if (itemsFound > 0) {
        console.log('✅ PDF item detection successful.');
    } else {
        console.log('❌ PDF item detection failed.');
    }
}

(async () => {
    try {
        await testExcel('./test_excel.xlsx');
        await testPDF('./knowledge-base/PGN - QUOTATION APPROVED MIRELLA.pdf');
    } catch (err) {
        console.error(err);
    }
})();
