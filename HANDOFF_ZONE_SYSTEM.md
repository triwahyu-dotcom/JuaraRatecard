# Handoff: Zone/Activity System — Phase 1 Implementation

> Dokumen ini berisi konteks lengkap, keputusan desain yang sudah final,
> dan spec implementasi untuk Phase 1 fitur Zone/Activity System di
> Juara Ratecard.

---

## Status Keputusan (Sudah Final)

- ✅ Section A/B/C **dipertahankan** sebagai cost taxonomy
- ✅ Zone sebagai **dimensi independen**, bukan pengganti Section
- ✅ Multi-zone item via `item_type_key` (field disiapkan di Phase 1, baru aktif di Phase 2)
- ✅ Default view: **Group by Zone**, toggle ke Section/Flat tersedia
- ✅ Zone **bebas-ketik**, template ditunda sampai pattern muncul dari penggunaan riil
- ✅ Active zone disimpan di state Builder (per-session, tidak persisted)
- ✅ Group preference disimpan di localStorage (per-user, bukan per-quotation)

## Phase Scope

| Phase | Isi | Status |
|---|---|---|
| **Phase 1 (SEKARANG)** | Schema, ZoneManager, Group by Zone view, active zone integration | 🚧 Implementasi |
| Phase 2 | `item_type_key` aktif + Procurement View (aggregate lintas zone) | ⏳ Pending |
| Phase 3 | Drag & drop antar zone, dual export (Zone view PDF + Category view Excel) | ⏳ Pending |

---

# BAGIAN 1: Konteks Proyek

## Aplikasi
**Juara Ratecard** — Quotation Builder untuk event organizer
**Stack:** React + Vite (frontend), Convex (real-time backend), deployed di Vercel
**Repo:** github.com/triwahyu-dotcom/JuaraRatecard
**Live:** juara-ratecard.vercel.app

## Struktur Data Saat Ini (Quotation Item)

Setiap item di quotation memiliki field berikut:
```json
{
  "_ratecard_key": "unique-identifier",
  "item_name": "Security Guard",
  "spec": "spesifikasi tambahan",
  "category": "A1. KONSEP & SURVEY",
  "sub_category": "Konsep & Survey",
  "section_code": "A",
  "section_name": "A. PLANNING & DEV",
  "zone_name": null,                      // ← FIELD INI SUDAH ADA tapi belum dipakai
  "qty": 2,
  "qty_unit": "orang",
  "freq": 1,
  "freq_unit": "evt",
  "unit_cost": 500000,
  "unit_sell": 750000,
  "vendor_tax_type": null,
  "sort_order": 1
}
```

**Struktur hierarki saat ini di UI:**
```
Section A: PLANNING & DEVELOPMENT
  └── A1. KONSEP & SURVEY (category)
        └── Survey & Koordinasi (item)
        └── Concept & Ideation (item)
  └── A2. CREATIVE DESIGN
        └── Creative Design 2D (item)

Section B: PERMIT & RETRIBUSI
  └── ...
```

## Schema Convex (Existing, Field Relevan)

```typescript
// Di convex/schema.ts, items adalah array dalam quotation document
items: v.array(v.object({
  _ratecard_key: v.string(),
  item_name: v.string(),
  category: v.optional(v.string()),
  sub_category: v.optional(v.string()),
  zone_name: v.optional(v.string()),  // ← sudah ada
  section_code: v.optional(v.string()),
  qty: v.optional(v.number()),
  freq: v.optional(v.number()),
  unit_cost: v.optional(v.number()),
  unit_sell: v.optional(v.number()),
  sort_order: v.optional(v.number()),
  // ...
}))
```

## File-file Relevan

- `app/src/pages/Builder.jsx` — halaman utama builder (~1667 baris)
- `app/src/components/QuotationCart.jsx` — tabel item dengan inline editing (~894 baris)
- `app/src/components/PrintDocument.jsx` — PDF preview engine
- `app/src/utils/exportXls.js` — Excel export engine
- `app/convex/quotations.ts` — schema dan mutation Convex
- `app/convex/schema.ts` — schema definition
- `app/src/utils/calc.js` — kalkulasi finansial (HPP, Sell, Margin)

---

# BAGIAN 2: Masalah yang Dipecahkan

## Cara Kerja Tim AE (Account Executive)

Tim membaca **proposal/konsep event** dari klien terlebih dahulu, lalu **menerjemahkan kebutuhan per aktivitas** ke dalam item quotation.

**Cara berpikir tim (Activity-First):**
```
"Rider Artis Band X butuh apa?"
  → Security Guard (2 orang)
  → Liaison Officer (1 orang)
  → Hotel (2 malam)
  → Transportasi (1 kendaraan)

"Tenda Keamanan butuh apa?"
  → Security Guard (6 orang)   ← item yang sama jenisnya
  → Metal Detector (2 unit)
  → Barikade (10 meter)
  → Signage (5 unit)
```

**Masalah:** Sistem saat ini berpikir **Category-First** (struktur Section A, B, C), sedangkan AE berpikir **Activity-First**. Ini menciptakan gesekan dalam workflow.

## Kebutuhan Multi-Perspektif

Data yang sama perlu dilihat dari dua sudut pandang:

| View | Untuk Siapa | Contoh |
|---|---|---|
| **Zone/Activity View** | Klien, Ops, PM | "Rider Artis berisi: 2 security, 1 LO, 1 mobil" |
| **Category/Procurement View** | Finance, Procurement | "Security Guard total: 8 orang (dari semua zona)" |

---

# BAGIAN 3: Arsitektur Solusi

## Prinsip Inti

**Section dan Zone adalah dua sumbu independen pada item yang sama.**

- **Sumbu Cost Nature** (Section A/B/C — Planning, Permit, Production, dst) → untuk procurement, finance, audit
- **Sumbu Activity/Deliverable** (Rider Artis, Tenda Keamanan, FOH, dst) → untuk klien, ops, PM

Setiap item punya dua "alamat":
- Alamat fungsional: `section_code` + `category` (sudah ada)
- Alamat aktivitas: `zone_name` + `item_type_key` (Phase 1 + 2)

View di builder tinggal di-toggle: "Group by Zone" (default untuk AE) vs "Group by Section" (untuk review procurement). Data underlying-nya sama persis, cuma cara render-nya beda.

## Kenapa Zone Tidak Menggantikan Section

1. **Tidak ada migrasi data destruktif.** Item lama tetap valid, tinggal default `zone = null`.
2. **Procurement view jadi gratis.** Sudah ada `category`, tinggal aggregate.
3. **Section A/B/C punya makna untuk Juara internal** (cost structure, margin per section, benchmarking antar event) yang hilang kalau diganti.
4. **Zone bisa fleksibel per quotation** tanpa mengganggu master ratecard.

## Struktur Quotation Ideal

```
ZONE VIEW (cara AE membangun, cara klien membaca):
  🎤 Rider Artis - Band X
     Security Guard (2 orang)
     Liaison Officer (1 orang)
     Hotel (2 malam)
     Transportasi (1 kendaraan)

  ⛺ Tenda Keamanan
     Security Guard (6 orang)
     Metal Detector (2 unit)
     Barikade (10 meter)

PROCUREMENT VIEW (Phase 2 — auto-generated dari data yang sama):
  👷 Human Resources
     Security Guard = 2 + 6 = 8 total
     Liaison Officer = 1 total
  🛒 Equipment
     Metal Detector = 2 total
     Barikade = 10 total
```

---

# BAGIAN 4: Spec Implementasi Phase 1

## 4.1 Data Layer

### Schema Change (`convex/schema.ts`)

```typescript
items: v.array(v.object({
  // ... field existing tetap ...
  zone_name: v.optional(v.string()),        // sudah ada, mulai dipakai
  zone_sort_order: v.optional(v.number()),  // BARU — urutan dalam zone
  item_type_key: v.optional(v.string()),    // BARU — disiapkan untuk Phase 2
}))

// Zone metadata di level quotation (BARU)
zones: v.optional(v.array(v.object({
  name: v.string(),
  sort_order: v.number(),
  note: v.optional(v.string()),
}))),
```

**Kenapa `zones` dipisah jadi array tersendiri (bukan derived dari items):**
- Bisa bikin zone kosong dulu sebelum isi item
- Punya tempat naruh metadata (note, warna, dll nanti)
- Reorder zone tidak perlu update semua item

**Backfill rule:** Quotation lama tanpa zone → semua item dapat `zone_name: null`. Di UI, item null masuk ke bucket `"(Belum dialokasikan)"` yang selalu muncul paling atas/bawah.

**`item_type_key` strategy:** Auto-derive dari `_ratecard_key` saat item ditambahkan dari ratecard master. Item yang sama dari master akan otomatis punya `item_type_key` sama. Field ini DIISI di Phase 1 tapi belum dipakai untuk aggregate sampai Phase 2.

### Mutation Baru (`convex/quotations.ts`)

```typescript
// CRUD zones
upsertZone({ quotationId, name, sort_order, note? })
renameZone({ quotationId, oldName, newName })   // cascade ke items
deleteZone({ quotationId, name, reassignTo? })  // item-nya pindah ke `reassignTo` atau jadi null
reorderZones({ quotationId, orderedNames: string[] })

// Assign item ke zone
setItemZone({ quotationId, itemKey, zoneName })
bulkSetItemZone({ quotationId, itemKeys: string[], zoneName })
```

**Catatan kritis untuk `renameZone`:** Harus cascade transaksional — kalau user rename "Rider Artis" jadi "Rider Band X", semua item dengan `zone_name: "Rider Artis"` harus ikut update dalam satu mutation Convex.

## 4.2 UI: Komponen `ZoneManager.jsx` (Baru)

**Lokasi:** Sidebar kiri Builder atau panel collapsible di atas QuotationCart.

**Behavior minimum:**
- List zones dengan drag handle untuk reorder (boleh pakai @dnd-kit kalau sudah ada di repo, kalau belum tunda dulu pakai tombol up/down)
- Inline edit nama (klik, ketik, enter)
- Tombol "+ Tambah Zone" → input nama, enter untuk save
- Tombol delete per zone → konfirmasi modal: "Pindahkan X item ke zone mana?" (dropdown zone lain atau "(Belum dialokasikan)")
- Counter di sebelah nama zone: jumlah item + subtotal sell
- Indikator visual untuk zone yang sedang aktif (active zone)
- Klik zone untuk set sebagai active zone

**Tampilan kira-kira:**

```
ZONES                                    [+ Tambah Zone]
─────────────────────────────────────────
⋮⋮ ▶ Rider Artis - Band X    8 item · Rp 45,2 jt  [✏️] [🗑️]
⋮⋮   Tenda Keamanan          12 item · Rp 32,8 jt  [✏️] [🗑️]
⋮⋮   FOH                      5 item · Rp 18,5 jt  [✏️] [🗑️]
─────────────────────────────────────────
     (Belum dialokasikan)     3 item · Rp 4,2 jt
```

`▶` = indikator active zone.

## 4.3 UI: Item Zone Assignment

### Konsep "Active Zone"

User pilih satu zone di Zone Manager sebagai *active zone*. Selama active zone aktif, semua item baru yang ditambahkan dari ratecard otomatis masuk ke situ.

**Workflow natural AE:**
```
1. AE klik zone "Rider Artis" di ZoneManager → jadi active zone
2. AE tambah 8 item dari ratecard berturut-turut → semua masuk "Rider Artis"
3. AE switch active zone ke "Tenda Keamanan"
4. AE tambah 12 item → semua masuk "Tenda Keamanan"
```

**State location:** Active zone disimpan di state Builder.jsx (useState), per-session. Tidak persisted ke localStorage atau Convex.

**Default behavior kalau tidak ada active zone:** Item baru masuk ke `zone_name: null` (Belum dialokasikan).

### Edit Zone Item Existing

Di QuotationCart, kolom zone jadi editable dropdown (mirip kolom lain yang sudah inline-editable). Klik cell zone → dropdown semua zone + opsi "(Belum dialokasikan)" + "+ Buat zone baru...".

## 4.4 UI: Zone View di QuotationCart

### Toggle Group Mode

Di atas tabel: `[Group by Zone] [Group by Section] [Flat]`

**State `groupBy`:** Disimpan di localStorage per-user dengan key seperti `juara_ratecard_group_by`. Default value: `"zone"`.

### Group by Zone (Default Baru)

```
▼ Rider Artis - Band X                       Rp 45.200.000
   ─────────────────────────────────────────────────────────
   Item               Qty  Unit    Sell        Subtotal
   Security Guard      2   orang   750.000     1.500.000
   Liaison Officer     1   orang   500.000       500.000
   Hotel Bintang 4     2   malam   1.200.000   2.400.000
   ...

▼ Tenda Keamanan                              Rp 32.800.000
   ─────────────────────────────────────────────────────────
   Security Guard      6   orang   750.000     4.500.000
   Metal Detector      2   unit    1.500.000   3.000.000
   ...

▼ (Belum dialokasikan)                         Rp 4.200.000
   ...
```

**Behavior:**
- Header zone clickable (collapse/expand)
- Subtotal per zone di kanan header
- Urutan zone mengikuti `zones[].sort_order`
- Bucket "(Belum dialokasikan)" selalu muncul paling bawah (kalau ada item)
- Drag handle di kiri tiap row — DISABLED di Phase 1 (Phase 3)

### Group by Section (Existing)

Tampilan existing, tetap dipertahankan apa adanya. Logic existing untuk grouping by section_code/category jangan diubah.

### Flat

Semua item satu list, tidak grouped. Untuk power user yang mau filter/sort manual.

## 4.5 Edge Cases

| Kasus | Handling |
|---|---|
| Hapus zone yang masih ada item-nya | Konfirmasi modal: pilih zone tujuan atau "(Belum dialokasikan)" |
| Rename zone ke nama yang sudah ada | Tolak dengan error: "Zone dengan nama itu sudah ada" |
| Quotation lama tanpa zone sama sekali | Tampilkan banner di builder: "Quotation ini belum punya zone. Buat zone untuk mengelompokkan item." dengan tombol quick-action |
| User switch ke "Group by Zone" tapi semua item null | Tampilkan empty state edukatif, bukan tabel kosong |
| Duplicate quotation | Zones ikut ter-copy, item zone assignment tetap |
| Add item tanpa active zone | Item masuk ke `zone_name: null` |
| Rename zone yang sedang active | Active zone state ikut update otomatis |

---

# BAGIAN 5: Aturan Implementasi

## Prinsip Umum

1. **Backward compatible:** Quotation lama tanpa zone harus tetap valid dan bisa dibuka. Item-nya masuk bucket "(Belum dialokasikan)".
2. **Optimistic update** untuk UI yang sering di-update (rename, reorder, assign).
3. **Minimize blast radius:** Jangan refactor file existing lebih dari yang diperlukan untuk fitur ini.
4. **Pakai pola kode yang sudah ada** di repo (gaya naming, struktur komponen, helper utility). Jangan introduce library baru kecuali sangat diperlukan.
5. **Convex mutation transaksional:** Operasi yang affect multiple items (renameZone, deleteZone) harus jadi satu mutation, bukan loop di client.

## Yang BELUM Perlu Sekarang (Jangan Dikerjakan)

- ❌ Drag & drop antar zone (Phase 3)
- ❌ Procurement View / aggregate by `item_type_key` (Phase 2)
- ❌ Modifikasi PDF export (`PrintDocument.jsx`) — biarkan apa adanya
- ❌ Modifikasi Excel export (`exportXls.js`) — biarkan apa adanya
- ❌ Zone template / preset
- ❌ Color/icon per zone
- ❌ Zone collaboration features (komentar, assignment ke user)

## Definition of Done untuk Phase 1

- [ ] Schema Convex deploy sukses tanpa error migration
- [ ] Quotation lama (yang dibuat sebelum fitur ini) bisa dibuka tanpa crash
- [ ] User bisa create/rename/delete/reorder zone via ZoneManager
- [ ] User bisa set active zone, item baru otomatis masuk ke zone aktif
- [ ] User bisa edit zone item existing via dropdown di QuotationCart
- [ ] Toggle Group by Zone / Section / Flat berfungsi, preference persist di localStorage
- [ ] Subtotal per zone tampil benar di header zone
- [ ] Edge cases di section 4.5 ter-handle
- [ ] Tidak ada regresi di flow existing (add/edit/delete item, calculation, dll)

---

# BAGIAN 6: Workflow Implementasi yang Diharapkan

## Langkah Kerja

1. **Baca dulu file-file kunci:**
   - `app/convex/schema.ts`
   - `app/convex/quotations.ts`
   - `app/src/pages/Builder.jsx`
   - `app/src/components/QuotationCart.jsx`

2. **Konfirmasi pemahaman:** Sebutkan asumsi-asumsi yang dibuat tentang struktur existing. Identifikasi area yang ambigu dan tanyakan sebelum implementasi.

3. **Tunjukkan rencana perubahan** sebelum menulis kode:
   - File mana saja yang akan dimodifikasi
   - File baru yang akan dibuat
   - Garis besar perubahan tiap file
   - Estimasi baris kode

4. **Tunggu approval** sebelum mulai implementasi.

5. **Implementasi bertahap:**
   - Step 1: Schema migration (`schema.ts`)
   - Step 2: Mutations (`quotations.ts`)
   - Step 3: Komponen `ZoneManager.jsx`
   - Step 4: Integrasi `QuotationCart.jsx` (Group by Zone view + zone column editor)
   - Step 5: Integrasi `Builder.jsx` (active zone state + add-item flow)

6. **Setiap step selesai, jeda untuk review** sebelum lanjut step berikutnya.

## Verifikasi Manual yang Perlu Dilakukan User

Setelah Step 1 (schema): Jalankan `npx convex dev` di terminal manual untuk verify schema deploy benar. Convex schema migration kadang butuh konfirmasi interaktif.

Setelah Step 5 selesai:
- Buka quotation lama → cek tidak crash
- Buat quotation baru → tambah 2-3 zone → tambah item → cek subtotal
- Toggle group mode → cek persist setelah refresh
- Rename zone → cek item-nya ikut update
- Delete zone dengan item di dalamnya → cek modal reassign muncul

---

# Lampiran: Estimasi Scope

| Komponen | Estimasi LOC |
|---|---|
| Schema + mutations di `quotations.ts` | ~150 baris |
| `ZoneManager.jsx` (komponen baru) | ~250 baris |
| Modifikasi `QuotationCart.jsx` (group rendering, zone column editor) | ~200 baris baru |
| Modifikasi `Builder.jsx` (active zone state, integrasi add-item) | ~100 baris |
| Toggle group + state management | ~50 baris |
| **Total** | **~750 baris kode baru** |

Realistis 2-3 hari kerja fokus untuk satu developer yang sudah familiar dengan repo.
