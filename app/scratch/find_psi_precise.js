import xlsx from 'xlsx';
import fs from 'fs';
import path from 'path';

const dir = '../knowledge-base';
const targetMin = 13882774000;
const targetMax = 13882775000;

const files = fs.readdirSync(dir).filter(f => f.endsWith('.xlsx'));

files.forEach(file => {
    try {
        const wb = xlsx.readFile(path.join(dir, file));
        wb.SheetNames.forEach(sheetName => {
            const ws = wb.Sheets[sheetName];
            const data = xlsx.utils.sheet_to_json(ws, {header:1});
            data.forEach((row, r) => {
                row.forEach((cell, c) => {
                    if (typeof cell === 'number' && cell >= targetMin && cell <= targetMax) {
                        console.log(`MATCH in ${file} [${sheetName}] at row ${r} col ${c}: ${cell}`);
                    }
                });
            });
        });
    } catch (e) {}
});
