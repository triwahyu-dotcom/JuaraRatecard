const { ConvexHttpClient } = require("convex/browser");
const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");

// Manually parse .env.local
const envPath = path.join(__dirname, ".env.local");
const envContent = fs.readFileSync(envPath, "utf-8");
const convexUrlMatch = envContent.match(/VITE_CONVEX_URL=(.+)/);
const convexUrl = convexUrlMatch ? convexUrlMatch[1].trim() : null;

if (!convexUrl) {
  console.error("VITE_CONVEX_URL not found in .env.local");
  process.exit(1);
}

const client = new ConvexHttpClient(convexUrl);

async function run() {
  console.log("Reading REVISED Excel file...");
  const excelPath = path.join(__dirname, "../knowledge-base/Ratecard_Consolidated_2026_REVISED.xlsx");
  const workbook = XLSX.readFile(excelPath);
  const sheet = workbook.Sheets["Ratecard"];
  if (!sheet) {
    console.error("Sheet 'Ratecard' not found in Excel file.");
    process.exit(1);
  }
  
  // Use header: 1 to get raw arrays, then skip title/header rows
  const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  const rows = rawData.slice(3); // Rows start from index 3 (after NO, SECTION, ...)

  console.log(`Found ${rows.length} rows. Mapping to Convex...`);

  const items = rows
    .filter(row => row.length >= 4 && row[3]) // Must have an item name at index 3
    .map(row => ({
      name: String(row[3] || '').trim(),
      category: String(row[1] || 'Other').trim(),
      subcategory: String(row[2] || 'General').trim(),
      unit: String(row[4] || 'unit').trim(),
      cost_price: Number(row[6] || 0),
      sell_price: Number(row[7] || 0),
      description: String(row[8] || '').trim(),
    }));

  console.log(`Mapped ${items.length} items. Priced items: ${items.filter(i => i.sell_price > 0).length}`);
  
  try {
    console.log("Clearing old data...");
    await client.mutation("masterData:clearAll");

    console.log(`Pushing ${items.length} new items to Convex...`);
    // Seed in chunks to avoid timeout if data is very large
    const chunkSize = 100;
    for (let i = 0; i < items.length; i += chunkSize) {
      const chunk = items.slice(i, i + chunkSize);
      await client.mutation("masterData:seedItems", { items: chunk });
      console.log(`Imported ${i + chunk.length} / ${items.length}`);
    }
    
    console.log("SUCCESS! Database replaced with consolidated data.");
  } catch (err) {
    console.error("Migration failed:", err);
  }
}

run();
