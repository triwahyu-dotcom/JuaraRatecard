# HANDOFF — Step 3b: Zone Editor Inline

> Dokumen ini untuk melanjutkan implementasi Zone System di **Juara Ratecard** quotation builder. Step 3a sudah selesai dan committed. Sekarang lanjut Step 3b.

---

## TL;DR

Tambah kolom **"Zone"** di setiap row item di `QuotationCart.jsx`, dengan dropdown picker. Tujuan: AE bisa assign atau ubah zone item langsung dari row, tanpa harus dari ZoneManager sidebar.

**Estimasi**: 100-150 baris kode. Risk: rendah-medium. Time: 30-45 menit.

---

## Project Context

- **App**: Juara Ratecard — quotation builder for event organizer (PT Juara Berhasil Berkah Sejahtera)
- **Stack**: React + Vite + Convex realtime backend, Vercel deploy
- **Repo**: github.com/triwahyu-dotcom/JuaraRatecard
- **Branch**: `feature/zone-system`
- **IDE**: Antigravity (VS Code based) dengan Gemini 3 Flash (Sonnet quota habis)
- **User**: Komunikasi dalam Bahasa Indonesia mixed dengan English technical terms. Conservative, prefers incremental approach with checkpoints.

---

## Status Zone System — Sebelum Step 3b

### Yang Sudah Jalan ✅

```
24ec85f ← HEAD: Step 3a (view modes toggle)        ← LAST COMMIT
7adcbf2 ← Step 2 smoke test integration
32dd5e0 ← Step 2: ZoneManager component  
ebece04 ← Step 1: mutations + schema
79710be ← handoff doc original
```

**Tags safety net**:
- `checkpoint/v1.0-stable-before-zone-system`
- `checkpoint/before-zone-smoke-test`
- `checkpoint/before-step-3a`
- `checkpoint/after-step-3a` ← **rollback point untuk Step 3b kalau ngacau**

**Capabilities active**:
- ZoneManager sidebar (add/rename/delete/reorder zones, drag-drop, active zone state)
- 5 Convex mutations: `updateZones`, `renameZone`, `deleteZone`, `setItemZone`, `bulkSetItemZone`
- 3 view mode toggle: **Hybrid (default)**, Pure Zone, Pure Section
- Subtotal per zone di hybrid + pure zone modes
- localStorage persist `groupBy` preference
- Backward compat untuk quotation tanpa zones (hybrid auto-fallback ke pure_section)

### Yang Belum (Goal Step 3b)

- AE tidak bisa **reassign zone** untuk item yang sudah ada → harus delete + re-add
- AE tidak bisa **assign zone** untuk legacy items (zone_name null/undefined)
- Workflow saat ini: set active zone di ZoneManager → tambah item baru → item nempel ke active zone. Friksi besar kalau salah klik.

---

## Architectural Decisions [LOCKED — JANGAN UBAH]

| Aspect | Decision | Reason |
|---|---|---|
| Section A/B/C dipertahankan | ✅ | Cost taxonomy dari ratecard master |
| Zone = dimensi independen, bukan pengganti Section | ✅ | Section + Zone = 2 dimensi orthogonal |
| Linkage item↔zone | Via `zone_name` string match | Simple, refactor-friendly |
| Zone storage | Embedded di quotation document (Opsi A) | Atomic operations, no extra table |
| Cascade rename | Transactional via Convex mutation | Step 1 udah implement |
| Active zone state | Per-session, in Builder useState | Tidak perlu persist |
| groupBy preference | localStorage per user | Step 3a udah implement |

---

## Step 3b: Spec Detail

### Goal
Tambah kolom **"Zone"** di QuotationCart table, dengan dropdown ZonePicker per row.

### Visual Mock-up

```
| #  | Service/Item     | Zone               | Qty | Freq | Cost  | Tax | Margin | Sell  | Subtotal | Actions |
|----|-------------------|---------------------|-----|------|-------|-----|--------|-------|----------|---------|
| 1  | Main Stage        | [🎤 Stage Area ▼]   |  1  | set  | 4.5M  | 0%  | 20%    | 6M    | 6M       | [...]   |
| 2  | Sound 10K         | [🎤 Stage Area ▼]   |  1  | set  | 7.5M  | 0%  | 25%    | 10M   | 10M      | [...]   |
| 3  | LED Screen        | [+ assign zone ▼]   | 15  | m    |  400K | 0%  | 20%    |  500K | 7.5M     | [...]   |
| 4  | Survey            | ⚠️ Old Zone [▼]    |  1  | pkg  | 1M    | 0%  | 50%    | 1.5M  | 1.5M     | [...]   |
```

**11 kolom total** (sebelumnya 10). Kolom Zone width: **~140px**.

### Kolom Zone Behavior

**State 1 — Item punya zone valid (di quotation.zones[]):**
```
[🎤 Stage Area ▼]
```
Click → dropdown opens with options.

**State 2 — Item zone_name null/undefined:**
```
[+ assign zone ▼]
```
Faded, hint untuk assign. Click → dropdown opens.

**State 3 — Item zone_name orphan (zone deleted):**
```
[⚠️ Old Zone Name ▼]
```
Yellow/warning style. Click → dropdown shows existing zones + "fix" option.

### Dropdown Layout

```
┌──────────────────────────┐
│ + Buat zone baru         │ ← shortcut to ZoneManager sidebar
├──────────────────────────┤
│ ✕ Hapus assignment       │ ← clear zone (set null)
├──────────────────────────┤
│ 🎤 Stage Area     ✓      │ ← current selection has checkmark
│ ⛺ Skatepark Area        │
│ 🛒 UMKM Area             │
└──────────────────────────┘
```

**Empty state** (`zones.length === 0`):
```
┌──────────────────────────┐
│ Belum ada zone           │
│ + Buat zone pertama      │ ← opens ZoneManager
└──────────────────────────┘
```

### Behavior in Each View Mode

- **Hybrid**: Show kolom Zone (akan redundant per group, tapi konsisten)
- **Pure Zone**: Show kolom Zone (juga redundant)
- **Pure Section**: Show kolom Zone (sangat penting di mode ini, satu-satunya cara assign zone tanpa pindah view)

**Decision**: Always show, never hide. Konsistensi UX > clean visual.

### Mutation Integration

Pakai mutation existing dari Step 1:
- `setItemZone({ id: quotationId, itemKey: _ratecard_key, zoneName: string|null })`

Pattern di ZoneManager.jsx untuk reference (lihat dengan `grep "setItemZone" app/src/components/ZoneManager.jsx`).

### Optimistic UI

Update item.zone_name di client state immediately, mutation runs in background. Rollback on error (pattern sudah ada di Step 2 ZoneManager untuk reference).

---

## Pre-Investigation Required

Sebelum prompt ke Gemini, jalankan command ini di terminal dan paste output ke chat:

### Command 1: SortableRow location

```bash
grep -n "function SortableRow" app/src/components/QuotationCart.jsx
```

Untuk tahu posisi function `SortableRow` (yang akan dimodifikasi untuk tambah kolom Zone).

### Command 2: SortableRow signature & props

Setelah dapat baris Y dari command 1, jalankan:

```bash
sed -n 'Y,Y+30p' app/src/components/QuotationCart.jsx
```

Replace Y dengan nomor baris yang ditemukan. Untuk tahu props apa saja yang diterima SortableRow.

### Command 3: colWidths object location

```bash
grep -n "colWidths" app/src/components/QuotationCart.jsx | head -5
```

Untuk tahu di mana `colWidths` di-define (state) dan di-pakai. Kita perlu tambah field `zone: 140`.

### Command 4: How ZoneManager uses setItemZone

```bash
grep -n "setItemZone\|useMutation.*setItemZone" app/src/components/ZoneManager.jsx
```

Untuk lihat pattern integration mutation. Tapi kemungkinan ZoneManager belum pakai (mutation dipakai di tempat lain), so this might return empty. That's OK — Gemini bisa import langsung dari `convex/quotations.ts`.

### Command 5: SectionHeaderRow & SubcategoryHeaderRow colSpan

```bash
grep -n "colSpan" app/src/components/QuotationCart.jsx
```

Sekarang di Step 3a kita pakai colSpan={10}. Setelah Step 3b harus jadi colSpan={11}. Verify semua occurrence supaya tidak ada yang miss.

---

## Rules Ketat untuk Gemini di Step 3b

1. ❌ **Jangan ubah `useSortable` di SortableRow** — DnD harus jalan
2. ❌ **Jangan ubah inline editing existing** — onUpdate, onCommit, lockEdit, unlockEdit tetap behave sama
3. ❌ **Jangan break presence cursor** — `remoteCursors`, `onFocusCell` tetap pass-through
4. ❌ **Jangan refactor `getUniqueZones` / `calcAllZoneSellTotals`** — udah jalan dari Step 3a
5. ✅ **Tambah field `zone: 140` ke colWidths object**
6. ✅ **Update `colSpan={10}` → `colSpan={11}` di SEMUA tempat**:
   - SectionHeaderRow
   - SubcategoryHeaderRow  
   - ZoneHeaderRow
7. ✅ **Tambah `<th>Zone</th>` di thead** antara Item dan Qty (atau lokasi lain yang make sense)
8. ✅ **Tambah `<td>` ZonePicker di SortableRow** posisi sesuai dengan thead
9. ✅ **ZonePicker pakai mutation `setItemZone` dari `api.quotations.setItemZone`**
10. ✅ **Optimistic UI**: update local item.zone_name immediately, rollback on mutation error
11. ❌ **Jangan tambah Tailwind** — semua inline style + CSS vars (`var(--bg)`, `var(--surface-2)`, `var(--vercel-blue)`, `var(--text)`, `var(--text-3)`, `var(--border)`)
12. ✅ **Empty state**: kalau zones.length === 0, dropdown show "Belum ada zone" + button "+ Buat zone pertama"
13. ✅ **Orphan handling**: kalau item.zone_name tidak ada di zones[], show ⚠️ warning di trigger button

---

## Codebase Patterns to Follow

- **NO Tailwind** — inline style + CSS vars
- **CSS palette**: `var(--bg)`, `--surface`, `--surface-2`, `--border`, `--text`, `--text-2`, `--text-3`, `--vercel-blue`, `--vercel-blue-dim`, `--red`, `--yellow`, `--vercel-green`, `--accent`
- **Border radius**: 4px (panels/buttons), 3px (small accents)
- **Dropdown floating**: `boxShadow: '-10px 0 30px rgba(0,0,0,0.3)'` (pattern dari ZoneManager floating panel)
- **Convex hook**: `const setItemZoneMutation = useMutation(api.quotations.setItemZone)`
- **Icons**: emoji (➕ 🗑️ ✏️ ▶ ⋮⋮ ⚠️)

---

## Workflow untuk Resume Chat Baru

1. **Buka Claude (Sonnet/Opus segar)**

2. **Paste handoff document ini**, mulai dengan: 
   > "Saya lanjut Step 3b Zone System di Juara Ratecard. Berikut handoff doc lengkap:"

3. **Run pre-investigation commands** (5 commands di atas), paste outputnya

4. **Claude akan susun prompt Gemini Step 3b yang siap di-paste**

5. **Paste prompt ke Antigravity (Gemini 3 Flash)**

6. **Wait for Gemini's PLAN**, paste plan ke Claude untuk review

7. **Approve/refine**, Gemini implement code

8. **Smoke test browser**: 
   - Klik dropdown zone di tiap state (assigned, unassigned, orphan)
   - Pindah zone, refresh, verify persist
   - Test di 3 view mode (hybrid, pure zone, pure section)
   - Test DnD masih jalan
   - Test inline edit masih jalan
   - Test presence cursor masih jalan

9. **Commit**:
   ```bash
   git add app/src/components/QuotationCart.jsx
   git commit -m "feat(zones): step 3b - inline zone editor per item row"
   git tag checkpoint/after-step-3b
   ```

---

## Tech Debt / Known Issues (Defer to Later)

- **Delete button bug di ZoneManager** (clicks not firing) — di Step 2 smoke test, deferred. Workaround: delete via Convex dashboard.
- **Presence.ts schema bug** (quotation_id null when in dashboard) — pre-existing, not zone system related.
- **Console performance violations** ('message handler took 150-325ms') — existing app behavior dari autosave + real-time sync.

---

## Future Roadmap (Phase 2 & 3)

**Phase 2** — setelah Step 3b:
- `item_type_key` activation (multi-zone item — same item bisa appear di multiple zones)
- Procurement View (aggregate aggregated lintas zones, untuk vendor PO)

**Phase 3**:
- Drag-drop antar zone (visual reassign dari row ke zone bucket)
- Dual export: PDF (client view) + Excel (internal procurement view)

---

## File Locations (Verbatim)

- `app/convex/schema.ts` — schema (zones field at line 61-68)
- `app/convex/quotations.ts` — 5 zone mutations + existing CRUD
- `app/src/components/ZoneManager.jsx` — Step 2 component (373 lines)
- `app/src/components/QuotationCart.jsx` — main cart, **+283 lines after Step 3a, total ~1180 lines**
- `app/src/pages/Builder.jsx` — Builder page (~1700 lines)
- `app/src/utils/calc.js` — has `getUniqueSections` (L222), `getUniqueZones` (added Step 3a), `calcAllSectionSellTotals`, `calcAllZoneSellTotals` (added Step 3a), `getQuotationLines` (L131)

---

## User Communication Notes

- User prefers **direct & honest feedback** — pushback is welcomed if technically justified
- User likes **mock-ups before deciding** (visualizer atau ASCII)
- User runs commands one-at-a-time, not pasting multi-line blocks
- Antigravity terminal has **markdown auto-link bug** — `z.name` displays as `[z.name](http://z.name)`. Source code is fine, just display issue. Use `| cat` or `--no-pager` to mitigate.
- User has 4 active terminals: 1=convex dev, 2=vite dev, 3-4=git/sed/grep workspace
- User has tagged checkpoints religiously — keep tagging before risky operations

---

## Sample First Message for Resume Chat

```
Halo Claude, saya lanjut implement Step 3b Zone System di Juara Ratecard.
Step 3a sudah committed dan working. Sekarang mau tambah dropdown picker
untuk zone di setiap row item di QuotationCart.

Berikut handoff document lengkap dari sesi sebelumnya:

[paste full handoff doc here]

Mulai dari pre-investigation commands ya. Saya jalankan command,
paste outputnya, lalu kita susun prompt untuk Gemini.
```

---

**END OF HANDOFF**
