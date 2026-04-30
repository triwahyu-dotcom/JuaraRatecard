import { ConvexHttpClient } from "convex/browser";
import { api } from "./convex/_generated/api.js";
import * as dotenv from "dotenv";
import fs from "fs";

dotenv.config({ path: ".env.local" });

const client = new ConvexHttpClient(process.env.VITE_CONVEX_URL);

async function seed() {
  const data = JSON.parse(fs.readFileSync("seed_data.json", "utf8"));
  console.log(`Seeding ${data.items.length} items...`);
  
  const batchSize = 50;
  for (let i = 0; i < data.items.length; i += batchSize) {
    const batch = data.items.slice(i, i + batchSize);
    console.log(`Batch ${i / batchSize + 1}...`);
    await client.mutation(api.masterData.seedItems, { items: batch });
  }
  
  console.log("Seeding complete!");
}

seed().catch(console.error);
