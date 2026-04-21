// Verify calc.js logic
const { calcSummary } = require('./app/src/utils/calc.js');

const mockItems = [
  {
    item_code: 'TEST-01',
    qty: 1, duration_qty: 1, frequency_qty: 1,
    unit_cost: 1000000,
    unit_sell: 1250000, // 20% margin
    vendor_tax_type: 'pph23_2', // 2% of 1.000.000 = 20.000
    is_complimentary: false
  }
];

const summary = calcSummary(mockItems, { mgmt_value: 0, ppn_rate: 0 });

console.log('--- Financial Logic Verification ---');
console.log('Subtotal      :', summary.subtotal);
console.log('Total HPP     :', summary.totalHPP);
console.log('Gross Profit  :', summary.grossProfit);
console.log('Gross Margin% :', summary.grossMarginPct + '%');
console.log('Vendor Tax    :', summary.vendorTaxTotal);
console.log('Net Profit    :', summary.netProfit);
console.log('Net Margin%   :', summary.netMarginPct + '%');

if (summary.netProfit === 230000) {
  console.log('SUCCESS: Logic matches expectations (250k - 20k = 230k)');
} else {
  console.log('FAILED: Unexpected profit calculation');
  process.exit(1);
}
