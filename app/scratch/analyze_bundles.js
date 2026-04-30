import fs from 'fs';

const data = JSON.parse(fs.readFileSync('psi_quotation_draft.json', 'utf8'));
const items = data.quotation_items;

const bundles = {};

// Group by category but also look for specific keyword clusters
items.forEach(item => {
    let bundleName = item.category || 'General';
    
    // Custom clustering logic
    if (item.item_name.toLowerCase().includes('led') || item.item_name.toLowerCase().includes('sound') || item.item_name.toLowerCase().includes('stage')) {
        bundleName = 'Technical & Stage Infrastructure';
    } else if (item.item_name.toLowerCase().includes('catering') || item.item_name.toLowerCase().includes('box') || item.item_name.toLowerCase().includes('makan')) {
        bundleName = 'F&B & Catering Package';
    } else if (item.item_name.toLowerCase().includes('permit') || item.item_name.toLowerCase().includes('izin') || item.item_name.toLowerCase().includes('pam')) {
        bundleName = 'Legal & Security Clearance';
    } else if (item.item_name.toLowerCase().includes('branding') || item.item_name.toLowerCase().includes('backdrop') || item.item_name.toLowerCase().includes('baliho')) {
        bundleName = 'Event Branding & Production';
    } else if (item.item_name.toLowerCase().includes('talent') || item.item_name.toLowerCase().includes('mc') || item.item_name.toLowerCase().includes('band')) {
        bundleName = 'Talent & Entertainment';
    }

    if (!bundles[bundleName]) bundles[bundleName] = [];
    bundles[bundleName].push(item);
});

const report = Object.entries(bundles).map(([name, list]) => {
    const total = list.reduce((sum, i) => sum + (i.qty * i.duration_qty * i.unit_price), 0);
    return {
        bundleName: name,
        itemCount: list.length,
        totalValue: total,
        topItems: list.slice(0, 3).map(i => i.item_name)
    };
});

console.log(JSON.stringify(report, null, 2));
