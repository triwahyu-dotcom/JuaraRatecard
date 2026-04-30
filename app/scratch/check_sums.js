import xlsx from 'xlsx';
const wb = xlsx.readFile('../knowledge-base/quote psi untuk di buat ratecard.xlsx');
const ws = wb.Sheets['Quotation Terupdate'];
const data = xlsx.utils.sheet_to_json(ws, {header:1});

let sum12 = 0;
data.forEach((row, i) => {
    if (i < 8 || i >= 709) return;
    const amount = Number(row[12]) || 0;
    // Condition for line item: has QTY and is NOT a summary row
    // Summary rows often have the amount in Col 13, but let's check Col 12 too.
    if (row[7] !== null && row[7] !== undefined && row[7] !== '') {
        sum12 += amount;
    }
});
console.log('Total Line Items Sum (Col 12): ' + sum12);

let sum13 = 0;
data.forEach((row, i) => {
    if (i < 8 || i >= 709) return;
    const amount = Number(row[13]) || 0;
    // Sections headers have values in Col 13
    if (row[0] && /^[A-Z]$/.test(row[0])) {
        sum13 += amount;
    }
});
console.log('Total Section Headers Sum (Col 13): ' + sum13);
