import * as xlsx from 'xlsx';

const wb = xlsx.readFile('../knowledge-base/RATE CARD JUARA 2026.xlsx');
console.log("Sheet names:", wb.SheetNames);

const sheetName = wb.SheetNames[0]; // Or maybe there's a sheet called "RATE CARD"
const sheet = wb.Sheets[sheetName];
const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });

for (let i=0; i<10; i++) {
    console.log(`Row ${i}:`, data[i]);
}
