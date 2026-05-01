"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";

export const estimateWithAI = action({
    args: {
        userInput: v.string(),
        availableBundles: v.array(v.any()),
        ratecardSummary: v.array(v.any()),
        inputType: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const apiKey = process.env.ANTHROPIC_API_KEY;
        if (!apiKey) throw new Error("ANTHROPIC_API_KEY not set");

        const bundleList = args.availableBundles
            .map(b => `- ID: ${b._id || b.id}, Nama: ${b.name}, Deskripsi: ${b.description || "-"}`)
            .join("\n");

        const ratecardCategories = [...new Set(
            args.ratecardSummary.map(r => r.category).filter(Boolean)
        )].slice(0, 30).join(", ");

        const prompt = `Kamu adalah konsultan senior Event Organizer Indonesia dari PT Juara Berhasil Berkah Sejahtera.

KATEGORI RATECARD TERSEDIA:
${ratecardCategories}

DAFTAR BUNDLE TERSEDIA:
${bundleList || "Belum ada bundle tersimpan."}

${args.inputType === "proposal" ? "KONTEN PROPOSAL EVENT:" : "PERMINTAAN USER:"}
"${args.userInput}"

Berikan rekomendasi dalam format JSON berikut (HANYA JSON, tanpa teks lain):
{
  "suggested_bundle_ids": ["id1", "id2"],
  "suggested_categories": ["kategori1", "kategori2"],
  "estimated_budget_range": { "min": 0, "max": 0, "currency": "IDR" },
  "event_summary": { "event_type": "", "duration_days": 1, "estimated_pax": 0, "venue_type": "" },
  "reasoning": "penjelasan singkat",
  "missing_info": [],
  "new_items_needed": [],
  "confidence": "high/medium/low"
}`;

        const response = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": apiKey,
                "anthropic-version": "2023-06-01",
            },
            body: JSON.stringify({
                model: "claude-sonnet-4-5",
                max_tokens: 1024,
                messages: [{ role: "user", content: prompt }],
            }),
        });

        if (!response.ok) throw new Error(`API error: ${response.status}`);

        const data = await response.json();
        const text = data.content[0].text.trim();

        try {
            return JSON.parse(text);
        } catch {
            const match = text.match(/\{[\s\S]*\}/);
            if (match) return JSON.parse(match[0]);
            throw new Error("Response bukan JSON valid");
        }
    },
});