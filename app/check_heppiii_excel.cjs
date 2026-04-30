const xlsx = require('xlsx');
const path = require('path');

const filePath = '/Users/yudiqitrick/Desktop/juara-ratecard/knowledge-base/Quotation Heppiii Skate Day.xlsx';
const workbook = xlsx.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const rows = xlsx.utils.sheet_to_json(worksheet, { header: 1, defval: null });

console.log('--- EXCEL ROWS (First 50) ---');
rows.slice(0, 50).forEach((row, i) => {
    console.log(`${i}: ${JSON.stringify(row)}`);
});
