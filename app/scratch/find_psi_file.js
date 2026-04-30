import xlsx from 'xlsx';
import fs from 'fs';
import path from 'path';

const dir = '../knowledge-base';
const target1 = 15409880095; // 15.4B
const target2 = 13882774861; // 13.8B

const files = fs.readdirSync(dir).filter(f => f.endsWith('.xlsx'));

files.forEach(file => {
    try {
        const wb = xlsx.readFile(path.join(dir, file));
        wb.SheetNames.forEach(sheetName => {
            const ws = wb.Sheets[sheetName];
            const data = xlsx.utils.sheet_to_json(ws, {header:1});
            data.forEach((row, r) => {
                row.forEach((cell, c) => {
                    if (typeof cell === 'number') {
                        if (Math.round(cell) === target1 || Math.round(cell) === target2) {
                            console.log(`FOUND in ${file} [${sheetName}] at row ${r} col ${c}: ${cell}`);
                        }
                    }
                });
            });
        });
    } catch (e) {
        // Skip busy/invalid files
    }
});
