import xlsx from 'xlsx';
const wb = xlsx.readFile('../knowledge-base/quote psi untuk di buat ratecard.xlsx');
const ws = wb.Sheets['Quotation Terupdate'];
const data = xlsx.utils.sheet_to_json(ws, {header:1});

let countSet1 = 0;
let countSet2 = 0;
let sumSet1 = 0;
let sumSet2 = 0;

for (let i = 8; i < 358; i++) {
    const amount = Number(data[i][12]) || 0;
    if (amount > 0 && data[i][7] !== undefined) {
        countSet1++;
        sumSet1 += amount;
    }
}

for (let i = 400; i < 706; i++) {
    const amount = Number(data[i][12]) || 0;
    if (amount > 0 && data[i][7] !== undefined) {
        countSet2++;
        sumSet2 += amount;
    }
}

console.log(`Set 1: ${countSet1} items, Sum: ${sumSet1}`);
console.log(`Set 2: ${countSet2} items, Sum: ${sumSet2}`);
console.log(`Total Sum: ${sumSet1 + sumSet2}`);
