-- ============================================================
-- JUARA RATECARD - Supabase Migration Script
-- Version: 2026-MVP-Phase-1
-- Run this in Supabase SQL Editor
-- ============================================================

-- ── EXTENSIONS ──────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- MASTER TABLES
-- ============================================================

-- ── 1. master_unit ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS master_unit (
  id           SERIAL PRIMARY KEY,
  unit_code    VARCHAR(20)  NOT NULL UNIQUE,
  unit_name    VARCHAR(100) NOT NULL,
  unit_group   VARCHAR(50),
  is_active    BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ── 2. master_zone ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS master_zone (
  id           SERIAL PRIMARY KEY,
  zone_code    VARCHAR(20)  NOT NULL UNIQUE,
  zone_name    VARCHAR(100) NOT NULL,
  is_active    BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ── 3. master_vendor ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS master_vendor (
  id                  SERIAL PRIMARY KEY,
  vendor_code         VARCHAR(30)  NOT NULL UNIQUE,
  vendor_name         VARCHAR(200) NOT NULL,
  vendor_type         VARCHAR(50),
  contact_name        VARCHAR(100),
  phone               VARCHAR(30),
  email               VARCHAR(100),
  bank_name           VARCHAR(100),
  bank_account_no     VARCHAR(50),
  bank_account_name   VARCHAR(100),
  tax_no              VARCHAR(30),
  is_active           BOOLEAN NOT NULL DEFAULT TRUE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 4. master_client ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS master_client (
  id           SERIAL PRIMARY KEY,
  client_code  VARCHAR(30)  NOT NULL UNIQUE,
  client_name  VARCHAR(200) NOT NULL,
  address      TEXT,
  pic_name     VARCHAR(100),
  phone        VARCHAR(30),
  email        VARCHAR(100),
  tax_no       VARCHAR(30),
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 5. master_category ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS master_category (
  id           SERIAL PRIMARY KEY,
  code         VARCHAR(10)  NOT NULL UNIQUE,
  name         VARCHAR(100) NOT NULL,
  sort_order   INT          NOT NULL DEFAULT 0,
  is_active    BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ── 6. master_subcategory ───────────────────────────────────
CREATE TABLE IF NOT EXISTS master_subcategory (
  id           SERIAL PRIMARY KEY,
  category_id  INT          NOT NULL REFERENCES master_category(id) ON DELETE CASCADE,
  code         VARCHAR(20)  NOT NULL UNIQUE,
  name         VARCHAR(100) NOT NULL,
  sort_order   INT          NOT NULL DEFAULT 0,
  is_active    BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ── 7. master_item ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS master_item (
  id                SERIAL PRIMARY KEY,
  subcategory_id    INT          NOT NULL REFERENCES master_subcategory(id),
  item_code         VARCHAR(30)  NOT NULL UNIQUE,
  item_name         VARCHAR(200) NOT NULL,
  item_type         VARCHAR(50),          -- fabrication, rental, service, manpower, talent
  default_unit_id   INT          REFERENCES master_unit(id),
  has_variant       BOOLEAN      NOT NULL DEFAULT FALSE,
  has_zone          BOOLEAN      NOT NULL DEFAULT FALSE,
  has_vendor        BOOLEAN      NOT NULL DEFAULT FALSE,
  is_custom_allowed BOOLEAN      NOT NULL DEFAULT TRUE,
  is_active         BOOLEAN      NOT NULL DEFAULT TRUE,
  remarks           TEXT,
  created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ── 8. master_item_variant ──────────────────────────────────
CREATE TABLE IF NOT EXISTS master_item_variant (
  id               SERIAL PRIMARY KEY,
  item_id          INT          NOT NULL REFERENCES master_item(id) ON DELETE CASCADE,
  variant_code     VARCHAR(30)  NOT NULL,
  variant_name     VARCHAR(100) NOT NULL,
  default_unit_id  INT          REFERENCES master_unit(id),
  is_active        BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ============================================================
-- RATE CARD TABLES
-- ============================================================

-- ── 9. rate_card ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS rate_card (
  id               SERIAL PRIMARY KEY,
  rate_card_no     VARCHAR(30)  NOT NULL UNIQUE,
  rate_card_name   VARCHAR(200) NOT NULL,
  effective_date   DATE,
  expired_date     DATE,
  currency         VARCHAR(3)   NOT NULL DEFAULT 'IDR',
  status           VARCHAR(20)  NOT NULL DEFAULT 'draft', -- draft | active | archived
  remarks          TEXT,
  created_by       VARCHAR(100),
  approved_by      VARCHAR(100),
  approved_at      TIMESTAMPTZ,
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ── 10. rate_card_line ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS rate_card_line (
  id                   SERIAL PRIMARY KEY,
  rate_card_id         INT          NOT NULL REFERENCES rate_card(id) ON DELETE CASCADE,
  category_id          INT          REFERENCES master_category(id),
  subcategory_id       INT          REFERENCES master_subcategory(id),
  item_id              INT          NOT NULL REFERENCES master_item(id),
  variant_id           INT          REFERENCES master_item_variant(id),
  zone_id              INT          REFERENCES master_zone(id),
  vendor_id            INT          REFERENCES master_vendor(id),
  unit_id              INT          REFERENCES master_unit(id),
  qty_default          NUMERIC(10,2) DEFAULT 1,
  qty_unit             VARCHAR(20),
  freq_default         NUMERIC(10,2) DEFAULT 1,
  freq_unit            VARCHAR(20),
  base_cost            NUMERIC(15,2),
  sell_price_default   NUMERIC(15,2),
  min_sell_price       NUMERIC(15,2),
  markup_type          VARCHAR(20)  DEFAULT 'pct_margin', -- fixed | pct_markup | pct_margin | manual
  markup_value         NUMERIC(10,2) DEFAULT 20,
  lead_time_days       INT,
  is_active            BOOLEAN      NOT NULL DEFAULT TRUE,
  notes                TEXT,
  created_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ============================================================
-- QUOTATION TABLES
-- ============================================================

-- ── 11. quotation ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS quotation (
  id                      UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  quotation_no            VARCHAR(30)  NOT NULL,
  quotation_version       INT          NOT NULL DEFAULT 1,
  quotation_date          DATE         NOT NULL DEFAULT CURRENT_DATE,
  client_id               INT          REFERENCES master_client(id),
  project_name            VARCHAR(200),
  event_name              VARCHAR(200),
  event_date_start        DATE,
  event_date_end          DATE,
  venue_name              VARCHAR(200),
  city                    VARCHAR(100),
  rate_card_id            INT          REFERENCES rate_card(id),
  payment_terms           VARCHAR(100),
  validity_days           INT          DEFAULT 14,
  status                  VARCHAR(30)  NOT NULL DEFAULT 'draft', -- draft | submitted | revised | approved_internal | sent_to_client | won | lost | cancelled
  -- Financial Summary (stored for history / performance)
  subtotal                NUMERIC(15,2) DEFAULT 0,
  discount_type           VARCHAR(10)  DEFAULT 'pct',            -- pct | fixed
  discount_value          NUMERIC(10,2) DEFAULT 0,
  discount_amount         NUMERIC(15,2) DEFAULT 0,
  management_fee_type     VARCHAR(10)  DEFAULT 'pct',
  management_fee_value    NUMERIC(10,2) DEFAULT 10,
  management_fee_amount   NUMERIC(15,2) DEFAULT 0,
  tax_base                NUMERIC(15,2) DEFAULT 0,
  ppn_rate                NUMERIC(5,2) DEFAULT 12,
  ppn_amount              NUMERIC(15,2) DEFAULT 0,
  grand_total             NUMERIC(15,2) DEFAULT 0,
  notes                   TEXT,
  created_by              VARCHAR(100),
  approved_by             VARCHAR(100),
  approved_at             TIMESTAMPTZ,
  created_at              TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  UNIQUE (quotation_no, quotation_version)
);

-- ── 12. quotation_line ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS quotation_line (
  id                   UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  quotation_id         UUID         NOT NULL REFERENCES quotation(id) ON DELETE CASCADE,
  sort_order           INT          NOT NULL DEFAULT 0,
  category_id          INT          REFERENCES master_category(id),
  subcategory_id       INT          REFERENCES master_subcategory(id),
  item_id              INT          REFERENCES master_item(id),          -- null if custom
  variant_id           INT          REFERENCES master_item_variant(id),
  zone_id              INT          REFERENCES master_zone(id),
  vendor_id            INT          REFERENCES master_vendor(id),
  custom_description   VARCHAR(300),                                      -- required if is_custom=true
  specification        TEXT,
  qty                  NUMERIC(10,2) NOT NULL DEFAULT 1,
  unit_id              INT          REFERENCES master_unit(id),
  qty_unit             VARCHAR(20),
  duration_qty         NUMERIC(10,2) DEFAULT 1,
  duration_unit        VARCHAR(20)  DEFAULT 'day',
  frequency_qty        NUMERIC(10,2) DEFAULT 1,
  frequency_unit       VARCHAR(20)  DEFAULT 'event',
  unit_cost            NUMERIC(15,2),
  unit_price           NUMERIC(15,2),
  amount_cost          NUMERIC(15,2) GENERATED ALWAYS AS (
                         COALESCE(qty * duration_qty * frequency_qty * unit_cost, 0)
                       ) STORED,
  amount_price         NUMERIC(15,2) GENERATED ALWAYS AS (
                         COALESCE(qty * duration_qty * frequency_qty * unit_price, 0)
                       ) STORED,
  vendor_tax_type      VARCHAR(20),   -- pph23_2 | pph21_25 | pph21_3 | pph42_10
  is_optional          BOOLEAN      NOT NULL DEFAULT FALSE,
  is_custom            BOOLEAN      NOT NULL DEFAULT FALSE,
  is_complimentary     BOOLEAN      NOT NULL DEFAULT FALSE,
  provided_by          VARCHAR(50),   -- Client | Internal | Third Party | Sponsorship
  notes                TEXT,
  created_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ── 13. quotation_revision_log ──────────────────────────────
CREATE TABLE IF NOT EXISTS quotation_revision_log (
  id            SERIAL PRIMARY KEY,
  quotation_id  UUID         NOT NULL REFERENCES quotation(id) ON DELETE CASCADE,
  version_no    INT          NOT NULL,
  change_note   TEXT,
  changed_by    VARCHAR(100),
  changed_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ── 14. quotation_status_log ────────────────────────────────
CREATE TABLE IF NOT EXISTS quotation_status_log (
  id            SERIAL PRIMARY KEY,
  quotation_id  UUID         NOT NULL REFERENCES quotation(id) ON DELETE CASCADE,
  old_status    VARCHAR(30),
  new_status    VARCHAR(30)  NOT NULL,
  changed_by    VARCHAR(100),
  changed_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  remarks       TEXT
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_master_item_subcategory ON master_item(subcategory_id);
CREATE INDEX IF NOT EXISTS idx_master_subcategory_category ON master_subcategory(category_id);
CREATE INDEX IF NOT EXISTS idx_rate_card_line_ratecard ON rate_card_line(rate_card_id);
CREATE INDEX IF NOT EXISTS idx_rate_card_line_item ON rate_card_line(item_id);
CREATE INDEX IF NOT EXISTS idx_quotation_line_quotation ON quotation_line(quotation_id);
CREATE INDEX IF NOT EXISTS idx_quotation_status ON quotation(status);
CREATE INDEX IF NOT EXISTS idx_quotation_no ON quotation(quotation_no);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE master_category       ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_subcategory    ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_item           ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_item_variant   ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_unit           ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_zone           ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_vendor         ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_client         ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_card             ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_card_line        ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotation             ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotation_line        ENABLE ROW LEVEL SECURITY;

-- Allow full access to authenticated users (internal app)
-- For production, refine these policies per role (admin, editor, viewer)
CREATE POLICY "Authenticated full access" ON master_category       FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated full access" ON master_subcategory    FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated full access" ON master_item           FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated full access" ON master_item_variant   FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated full access" ON master_unit           FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated full access" ON master_zone           FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated full access" ON master_vendor         FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated full access" ON master_client         FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated full access" ON rate_card             FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated full access" ON rate_card_line        FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated full access" ON quotation             FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated full access" ON quotation_line        FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================
-- SEED DATA: master_unit
-- ============================================================
INSERT INTO master_unit (unit_code, unit_name, unit_group) VALUES
  ('pcs',         'Piece',            'quantity'),
  ('set',         'Set',              'quantity'),
  ('lot',         'Lot',              'quantity'),
  ('m2',          'Meter Persegi',    'area'),
  ('m1',          'Meter Linear',     'length'),
  ('m',           'Meter',            'length'),
  ('pax',         'Pax',              'people'),
  ('person',      'Person',           'people'),
  ('team',        'Team',             'people'),
  ('unit',        'Unit',             'quantity'),
  ('trip',        'Trip',             'transport'),
  ('room',        'Room',             'accommodation'),
  ('day',         'Day',              'time'),
  ('project',     'Project',          'time'),
  ('event',       'Event',            'time'),
  ('titik',       'Titik',            'quantity'),
  ('meter',       'Meter',            'length'),
  ('pckg',        'Package',          'quantity'),
  ('pct',         'Percentage',       'finance'),
  ('ls',          'Lump Sum',         'quantity')
ON CONFLICT (unit_code) DO NOTHING;

-- ============================================================
-- SEED DATA: master_zone
-- ============================================================
INSERT INTO master_zone (zone_code, zone_name) VALUES
  ('REG',   'Registration Area'),
  ('FOYER', 'Foyer Area'),
  ('HOLD',  'Holding Room'),
  ('VIP',   'VIP Room'),
  ('MED',   'Medical Room'),
  ('TALE',  'Talent Room'),
  ('COM',   'Committee Room'),
  ('OUT',   'Outdoor Area'),
  ('GATE',  'Entrance Gate'),
  ('MAIN',  'Main Hall / Stage')
ON CONFLICT (zone_code) DO NOTHING;

-- ============================================================
-- SEED DATA: master_category (11 categories from spec)
-- ============================================================
INSERT INTO master_category (code, name, sort_order) VALUES
  ('CAT-01', 'Planning & Development',             1),
  ('CAT-02', 'Permit & Retribusi',                 2),
  ('CAT-03', 'Venue / Setup / System',             3),
  ('CAT-04', 'Multimedia / Creative',              4),
  ('CAT-05', 'Production / Fabrication',           5),
  ('CAT-06', 'Manpower / Crew',                    6),
  ('CAT-07', 'Talent / Entertainment',             7),
  ('CAT-08', 'Transportation / Logistics',         8),
  ('CAT-09', 'Accommodation / Consumption',        9),
  ('CAT-10', 'Documentation / Reporting',         10),
  ('CAT-11', 'Miscellaneous / Additional Cost',   11)
ON CONFLICT (code) DO NOTHING;

-- ============================================================
-- SEED DATA: master_subcategory (from spec section 3.2)
-- ============================================================
-- CAT-01: Planning & Development
INSERT INTO master_subcategory (category_id, code, name, sort_order)
  SELECT id, 'SUB-01-01', 'Creative Design',                   1 FROM master_category WHERE code = 'CAT-01'
  ON CONFLICT (code) DO NOTHING;
INSERT INTO master_subcategory (category_id, code, name, sort_order)
  SELECT id, 'SUB-01-02', 'Screen Content Planning',           2 FROM master_category WHERE code = 'CAT-01'
  ON CONFLICT (code) DO NOTHING;
INSERT INTO master_subcategory (category_id, code, name, sort_order)
  SELECT id, 'SUB-01-03', 'Registration & Participant Planning',3 FROM master_category WHERE code = 'CAT-01'
  ON CONFLICT (code) DO NOTHING;
INSERT INTO master_subcategory (category_id, code, name, sort_order)
  SELECT id, 'SUB-01-04', 'Reporting Support',                 4 FROM master_category WHERE code = 'CAT-01'
  ON CONFLICT (code) DO NOTHING;

-- CAT-02: Permit & Retribusi
INSERT INTO master_subcategory (category_id, code, name, sort_order)
  SELECT id, 'SUB-02-01', 'Government / Authority Permit',     1 FROM master_category WHERE code = 'CAT-02'
  ON CONFLICT (code) DO NOTHING;
INSERT INTO master_subcategory (category_id, code, name, sort_order)
  SELECT id, 'SUB-02-02', 'Area Access & Coordination',        2 FROM master_category WHERE code = 'CAT-02'
  ON CONFLICT (code) DO NOTHING;
INSERT INTO master_subcategory (category_id, code, name, sort_order)
  SELECT id, 'SUB-02-03', 'Security Support',                  3 FROM master_category WHERE code = 'CAT-02'
  ON CONFLICT (code) DO NOTHING;
INSERT INTO master_subcategory (category_id, code, name, sort_order)
  SELECT id, 'SUB-02-04', 'Medical & Emergency',               4 FROM master_category WHERE code = 'CAT-02'
  ON CONFLICT (code) DO NOTHING;

-- CAT-03: Venue / Setup / System
INSERT INTO master_subcategory (category_id, code, name, sort_order)
  SELECT id, 'SUB-03-01', 'Registration Setup',                1 FROM master_category WHERE code = 'CAT-03'
  ON CONFLICT (code) DO NOTHING;
INSERT INTO master_subcategory (category_id, code, name, sort_order)
  SELECT id, 'SUB-03-02', 'Foyer / Public Area Setup',         2 FROM master_category WHERE code = 'CAT-03'
  ON CONFLICT (code) DO NOTHING;
INSERT INTO master_subcategory (category_id, code, name, sort_order)
  SELECT id, 'SUB-03-03', 'VIP / Holding Room Setup',          3 FROM master_category WHERE code = 'CAT-03'
  ON CONFLICT (code) DO NOTHING;
INSERT INTO master_subcategory (category_id, code, name, sort_order)
  SELECT id, 'SUB-03-04', 'Entrance & Security Gate',          4 FROM master_category WHERE code = 'CAT-03'
  ON CONFLICT (code) DO NOTHING;
INSERT INTO master_subcategory (category_id, code, name, sort_order)
  SELECT id, 'SUB-03-05', 'Tent & Shelter',                    5 FROM master_category WHERE code = 'CAT-03'
  ON CONFLICT (code) DO NOTHING;
INSERT INTO master_subcategory (category_id, code, name, sort_order)
  SELECT id, 'SUB-03-06', 'Venue Treatment',                   6 FROM master_category WHERE code = 'CAT-03'
  ON CONFLICT (code) DO NOTHING;
INSERT INTO master_subcategory (category_id, code, name, sort_order)
  SELECT id, 'SUB-03-07', 'Technical System',                  7 FROM master_category WHERE code = 'CAT-03'
  ON CONFLICT (code) DO NOTHING;
INSERT INTO master_subcategory (category_id, code, name, sort_order)
  SELECT id, 'SUB-03-08', 'Support Facility',                  8 FROM master_category WHERE code = 'CAT-03'
  ON CONFLICT (code) DO NOTHING;

-- CAT-04: Multimedia / Creative
INSERT INTO master_subcategory (category_id, code, name, sort_order)
  SELECT id, 'SUB-04-01', 'Visual Design',                     1 FROM master_category WHERE code = 'CAT-04'
  ON CONFLICT (code) DO NOTHING;
INSERT INTO master_subcategory (category_id, code, name, sort_order)
  SELECT id, 'SUB-04-02', 'Motion & Video Content',            2 FROM master_category WHERE code = 'CAT-04'
  ON CONFLICT (code) DO NOTHING;
INSERT INTO master_subcategory (category_id, code, name, sort_order)
  SELECT id, 'SUB-04-03', 'Screen & Display System',           3 FROM master_category WHERE code = 'CAT-04'
  ON CONFLICT (code) DO NOTHING;
INSERT INTO master_subcategory (category_id, code, name, sort_order)
  SELECT id, 'SUB-04-04', 'Show Content Operation',            4 FROM master_category WHERE code = 'CAT-04'
  ON CONFLICT (code) DO NOTHING;

-- CAT-05: Production / Fabrication
INSERT INTO master_subcategory (category_id, code, name, sort_order)
  SELECT id, 'SUB-05-01', 'Branding Production',               1 FROM master_category WHERE code = 'CAT-05'
  ON CONFLICT (code) DO NOTHING;
INSERT INTO master_subcategory (category_id, code, name, sort_order)
  SELECT id, 'SUB-05-02', 'Backdrop & Display Fabrication',    2 FROM master_category WHERE code = 'CAT-05'
  ON CONFLICT (code) DO NOTHING;
INSERT INTO master_subcategory (category_id, code, name, sort_order)
  SELECT id, 'SUB-05-03', 'Print & Installation',              3 FROM master_category WHERE code = 'CAT-05'
  ON CONFLICT (code) DO NOTHING;
INSERT INTO master_subcategory (category_id, code, name, sort_order)
  SELECT id, 'SUB-05-04', 'Decoration Support',                4 FROM master_category WHERE code = 'CAT-05'
  ON CONFLICT (code) DO NOTHING;

-- CAT-06: Manpower / Crew
INSERT INTO master_subcategory (category_id, code, name, sort_order)
  SELECT id, 'SUB-06-01', 'Project Team',                      1 FROM master_category WHERE code = 'CAT-06'
  ON CONFLICT (code) DO NOTHING;
INSERT INTO master_subcategory (category_id, code, name, sort_order)
  SELECT id, 'SUB-06-02', 'Floor & Show Team',                 2 FROM master_category WHERE code = 'CAT-06'
  ON CONFLICT (code) DO NOTHING;
INSERT INTO master_subcategory (category_id, code, name, sort_order)
  SELECT id, 'SUB-06-03', 'Logistics Team',                    3 FROM master_category WHERE code = 'CAT-06'
  ON CONFLICT (code) DO NOTHING;
INSERT INTO master_subcategory (category_id, code, name, sort_order)
  SELECT id, 'SUB-06-04', 'Safety / Security Team',            4 FROM master_category WHERE code = 'CAT-06'
  ON CONFLICT (code) DO NOTHING;
INSERT INTO master_subcategory (category_id, code, name, sort_order)
  SELECT id, 'SUB-06-05', 'Operational Support',               5 FROM master_category WHERE code = 'CAT-06'
  ON CONFLICT (code) DO NOTHING;

-- CAT-07: Talent / Entertainment
INSERT INTO master_subcategory (category_id, code, name, sort_order)
  SELECT id, 'SUB-07-01', 'Main Talent',                       1 FROM master_category WHERE code = 'CAT-07'
  ON CONFLICT (code) DO NOTHING;
INSERT INTO master_subcategory (category_id, code, name, sort_order)
  SELECT id, 'SUB-07-02', 'Talent Support',                    2 FROM master_category WHERE code = 'CAT-07'
  ON CONFLICT (code) DO NOTHING;

-- CAT-08: Transportation / Logistics
INSERT INTO master_subcategory (category_id, code, name, sort_order)
  SELECT id, 'SUB-08-01', 'Vehicle Rental',                    1 FROM master_category WHERE code = 'CAT-08'
  ON CONFLICT (code) DO NOTHING;
INSERT INTO master_subcategory (category_id, code, name, sort_order)
  SELECT id, 'SUB-08-02', 'Loading & Mobility Support',        2 FROM master_category WHERE code = 'CAT-08'
  ON CONFLICT (code) DO NOTHING;
INSERT INTO master_subcategory (category_id, code, name, sort_order)
  SELECT id, 'SUB-08-03', 'Access & Parking',                  3 FROM master_category WHERE code = 'CAT-08'
  ON CONFLICT (code) DO NOTHING;

-- CAT-09: Accommodation / Consumption
INSERT INTO master_subcategory (category_id, code, name, sort_order)
  SELECT id, 'SUB-09-01', 'Team Accommodation',                1 FROM master_category WHERE code = 'CAT-09'
  ON CONFLICT (code) DO NOTHING;
INSERT INTO master_subcategory (category_id, code, name, sort_order)
  SELECT id, 'SUB-09-02', 'VIP & VVIP Hospitality',           2 FROM master_category WHERE code = 'CAT-09'
  ON CONFLICT (code) DO NOTHING;
INSERT INTO master_subcategory (category_id, code, name, sort_order)
  SELECT id, 'SUB-09-03', 'Team Meals & Refreshment',          3 FROM master_category WHERE code = 'CAT-09'
  ON CONFLICT (code) DO NOTHING;
INSERT INTO master_subcategory (category_id, code, name, sort_order)
  SELECT id, 'SUB-09-04', 'Amenities & Room Supplies',         4 FROM master_category WHERE code = 'CAT-09'
  ON CONFLICT (code) DO NOTHING;
INSERT INTO master_subcategory (category_id, code, name, sort_order)
  SELECT id, 'SUB-09-05', 'Participant Consumption',           5 FROM master_category WHERE code = 'CAT-09'
  ON CONFLICT (code) DO NOTHING;

-- CAT-10: Documentation / Reporting
INSERT INTO master_subcategory (category_id, code, name, sort_order)
  SELECT id, 'SUB-10-01', 'Event Documentation',               1 FROM master_category WHERE code = 'CAT-10'
  ON CONFLICT (code) DO NOTHING;
INSERT INTO master_subcategory (category_id, code, name, sort_order)
  SELECT id, 'SUB-10-02', 'Accreditation & Document Support',  2 FROM master_category WHERE code = 'CAT-10'
  ON CONFLICT (code) DO NOTHING;
INSERT INTO master_subcategory (category_id, code, name, sort_order)
  SELECT id, 'SUB-10-03', 'Participant / Event Print Support', 3 FROM master_category WHERE code = 'CAT-10'
  ON CONFLICT (code) DO NOTHING;

-- CAT-11: Miscellaneous / Additional Cost
INSERT INTO master_subcategory (category_id, code, name, sort_order)
  SELECT id, 'SUB-11-01', 'Survey Cost',                       1 FROM master_category WHERE code = 'CAT-11'
  ON CONFLICT (code) DO NOTHING;
INSERT INTO master_subcategory (category_id, code, name, sort_order)
  SELECT id, 'SUB-11-02', 'Operational Tools & Supplies',      2 FROM master_category WHERE code = 'CAT-11'
  ON CONFLICT (code) DO NOTHING;
INSERT INTO master_subcategory (category_id, code, name, sort_order)
  SELECT id, 'SUB-11-03', 'Communication Equipment',           3 FROM master_category WHERE code = 'CAT-11'
  ON CONFLICT (code) DO NOTHING;
INSERT INTO master_subcategory (category_id, code, name, sort_order)
  SELECT id, 'SUB-11-04', 'Additional Operational Cost',       4 FROM master_category WHERE code = 'CAT-11'
  ON CONFLICT (code) DO NOTHING;

-- ============================================================
-- SEED RATE CARD (initial rate card for 2026)
-- ============================================================
INSERT INTO rate_card (rate_card_no, rate_card_name, effective_date, status, remarks)
VALUES ('RC-2026-001', 'Rate Card Juara 2026', '2026-01-01', 'active', 'Master rate card dari Excel 2026')
ON CONFLICT (rate_card_no) DO NOTHING;

-- ============================================================
-- NOTE: master_item and rate_card_line data will be seeded
-- automatically via the migration script: seed_migration.py
-- ============================================================
