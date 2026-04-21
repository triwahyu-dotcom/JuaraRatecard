import { diceCoefficient, predictCategory, standardizeUnit } from '../app/src/utils/stringUtils.js';

const testCases = [
    { type: 'Fuzzy', s1: 'Standard Baricade', s2: 'Barikade Standar', expectedMin: 0.7 },
    { type: 'Fuzzy', s1: 'Genset 60kVA', s2: 'Genset 60 kVA', expectedMin: 0.9 },
    { type: 'Category', name: 'Mobil Ambulance', expected: 'Operational / Permit' },
    { type: 'Category', name: 'Sound System 5000W', expected: 'Production / System' },
    { type: 'Unit', val: 'orang', expected: 'Pax' },
    { type: 'Unit', val: 'pckg', expected: 'Pckg' }
];

console.log('--- SMART IMPORT V2 LOGIC TEST ---');
testCases.forEach(tc => {
    if (tc.type === 'Fuzzy') {
        const score = diceCoefficient(tc.s1, tc.s2);
        console.log(`[Fuzzy] "${tc.s1}" vs "${tc.s2}" -> Score: ${score.toFixed(2)} (${score >= tc.expectedMin ? 'PASS' : 'FAIL'})`);
    } else if (tc.type === 'Category') {
        const cat = predictCategory(tc.name);
        console.log(`[Category] "${tc.name}" -> Result: ${cat} (${cat === tc.expected ? 'PASS' : 'FAIL'})`);
    } else if (tc.type === 'Unit') {
        const unit = standardizeUnit(tc.val);
        console.log(`[Unit] "${tc.val}" -> Result: ${unit} (${unit === tc.expected ? 'PASS' : 'FAIL'})`);
    }
});
