-- ============================================================
-- JUARA RATECARD - Seed Data Migration
-- Generated from: ratecard-db.json
-- Total items: 267
-- Run AFTER supabase_migration.sql
-- ============================================================

DO $$
DECLARE
  v_subcategory_id INT;
  v_unit_id        INT;
  v_item_id        INT;
  v_ratecard_id    INT;
BEGIN

  -- Ambil ID rate card 2026
  SELECT id INTO v_ratecard_id FROM rate_card WHERE rate_card_no = 'RC-2026-001';

  -- [1] Key Visual
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-04-01';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'KEY-VISUAL', 'Key Visual', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [2] 2D Visual
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-04-01';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, '2D-VISUAL', '2D Visual', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [3] 3D Visual
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-04-01';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, '3D-VISUAL', '3D Visual', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [4] Bumper Video
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-03-05';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'pcs';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'BUMPER-VIDEO', 'Bumper Video', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [5] Manifesto Video
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-03-05';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'pcs';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'MANIFESTO-VIDEO', 'Manifesto Video', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [6] Animation
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-03-05';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'pcs';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'ANIMATION', 'Animation', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [7] Screen Content Planning
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-03-05';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'SCREEN-CONTENT-PLANNING', 'Screen Content Planning', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [8] Registration Flow
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-11-04';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'REGISTRATION-FLOW', 'Registration Flow', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [9] Manual Book Kepesertaan
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-11-04';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'pcs';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'MANUAL-BOOK-KEPESERTAAN', 'Manual Book Kepesertaan', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [10] Participant Journey Plan
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-11-04';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'PARTICIPANT-JOURNEY-PLAN', 'Participant Journey Plan', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [11] Event Reporting
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-11-04';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'EVENT-REPORTING', 'Event Reporting', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [12] POLSEK
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-02-01';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'lot';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'POLSEK', 'POLSEK', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [13] POLRES
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-02-01';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'lot';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'POLRES', 'POLRES', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [14] POLDA
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-02-01';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'lot';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'POLDA', 'POLDA', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [15] DISHUB
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-02-01';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'lot';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'DISHUB', 'DISHUB', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [16] SATPOL PP
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-02-01';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'lot';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'SATPOL-PP', 'SATPOL PP', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [17] KODAM
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-02-01';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'lot';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'KODAM', 'KODAM', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [18] KODIM
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-02-01';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'lot';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'KODIM', 'KODIM', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [19] KORAMIL
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-02-01';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'lot';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'KORAMIL', 'KORAMIL', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [20] Koordinasi Kawasan
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-11-04';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'lot';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'KOORDINASI-KAWASAN', 'Koordinasi Kawasan', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [21] Dana Koordinasi Antar Lintas
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-11-04';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'lot';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'DANA-KOORDINASI-ANTAR-LIN', 'Dana Koordinasi Antar Lintas', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [22] Parking Area Permit
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-11-04';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'lot';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'PARKING-AREA-PERMIT', 'Parking Area Permit', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [23] Loading Access
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-11-04';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'lot';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'LOADING-ACCESS', 'Loading Access', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [24] Tribune Access
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-11-04';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'lot';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'TRIBUNE-ACCESS', 'Tribune Access', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [25] PAM
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-02-03';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'lot';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'PAM', 'PAM', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [26] PASPAMPRES
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-02-03';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'lot';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'PASPAMPRES', 'PASPAMPRES', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [27] Ambulance
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-02-04';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'AMBULANCE', 'Ambulance', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  INSERT INTO rate_card_line (rate_card_id, item_id, unit_id, qty_default, qty_unit, freq_default, freq_unit, base_cost, sell_price_default, markup_type, markup_value, is_active)
  VALUES (v_ratecard_id, v_item_id, v_unit_id, 1.0, 'unit/day', 1.0, 'day', 1600000.0, 2000000.0, 'pct_margin', 20, TRUE)
  ON CONFLICT DO NOTHING;

  -- [28] Doctor
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-02-04';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'DOCTOR', 'Doctor', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [29] Damkar
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-02-04';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'DAMKAR', 'Damkar', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [30] Registration System
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-11-04';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'REGISTRATION-SYSTEM', 'Registration System', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [31] Registration Tools
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-11-04';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'REGISTRATION-TOOLS', 'Registration Tools', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [32] Registration Backdrop
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-11-04';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'set';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'REGISTRATION-BACKDROP', 'Registration Backdrop', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [33] Queue Line
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-11-04';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'QUEUE-LINE', 'Queue Line', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [34] Signage
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-11-04';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'pcs';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'SIGNAGE', 'Signage', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [35] IBM Table
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-11-04';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'IBM-TABLE', 'IBM Table', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [36] Futura Chair
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-11-04';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'FUTURA-CHAIR', 'Futura Chair', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  INSERT INTO rate_card_line (rate_card_id, item_id, unit_id, qty_default, qty_unit, freq_default, freq_unit, base_cost, sell_price_default, markup_type, markup_value, is_active)
  VALUES (v_ratecard_id, v_item_id, v_unit_id, 1.0, 'unit/day', 1.0, 'day', 14400.0, 18000.0, 'pct_margin', 20, TRUE)
  ON CONFLICT DO NOTHING;

  -- [37] Photobooth Backdrop
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-11-04';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'set';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'PHOTOBOOTH-BACKDROP', 'Photobooth Backdrop', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [38] Photowall Backdrop
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-11-04';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'set';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'PHOTOWALL-BACKDROP', 'Photowall Backdrop', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [39] Doorstop Backdrop
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-11-04';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'set';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'DOORSTOP-BACKDROP', 'Doorstop Backdrop', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [40] Curtain
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-11-04';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'm1';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'CURTAIN', 'Curtain', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [41] Sofa
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-11-04';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'SOFA', 'Sofa', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [42] Round Table
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-11-04';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'ROUND-TABLE', 'Round Table', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [43] Centrepiece
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-11-04';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'pcs';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'CENTREPIECE', 'Centrepiece', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [44] Bendera Pataka
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-11-04';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'pcs';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'BENDERA-PATAKA', 'Bendera Pataka', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [45] Simbol Negara
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-11-04';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'pcs';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'SIMBOL-NEGARA', 'Simbol Negara', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [46] Foto Presiden & Wakil Presiden
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-11-04';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'set';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'FOTO-PRESIDEN-WAKIL-PRESI', 'Foto Presiden & Wakil Presiden', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [47] Amenities
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-11-04';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'AMENITIES', 'Amenities', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [48] Refreshments
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-11-04';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'REFRESHMENTS', 'Refreshments', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [49] Medic Tools
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-11-04';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'MEDIC-TOOLS', 'Medic Tools', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [50] Full Body Mirror
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-11-04';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'FULL-BODY-MIRROR', 'Full Body Mirror', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [51] AC Portable
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-11-04';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'AC-PORTABLE', 'AC Portable', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  INSERT INTO rate_card_line (rate_card_id, item_id, unit_id, qty_default, qty_unit, freq_default, freq_unit, base_cost, sell_price_default, markup_type, markup_value, is_active)
  VALUES (v_ratecard_id, v_item_id, v_unit_id, 1.0, 'unit/day', 1.0, 'day', 600000.0, 750000.0, 'pct_margin', 20, TRUE)
  ON CONFLICT DO NOTHING;

  -- [52] Gate Entrance System
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-02-03';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'set';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'GATE-ENTRANCE-SYSTEM', 'Gate Entrance System', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [53] Secdoor
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-02-03';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'SECDOOR', 'Secdoor', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [54] Tenda Pengamanan
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-03-05';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'TENDA-PENGAMANAN', 'Tenda Pengamanan', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [55] Tenda Medis
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-03-05';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'TENDA-MEDIS', 'Tenda Medis', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [56] Flooring
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-11-04';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'm2';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'FLOORING', 'Flooring', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [57] Carpetting
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-11-04';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'm2';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'CARPETTING', 'Carpetting', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [58] Lem dan Double Tape
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-11-04';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'lot';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'LEM-DAN-DOUBLE-TAPE', 'Lem dan Double Tape', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [59] Geser Ring
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-11-04';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'lot';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'GESER-RING', 'Geser Ring', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [60] Ongkos Pasang
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-11-04';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'lot';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'ONGKOS-PASANG', 'Ongkos Pasang', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [61] Ongkir
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-11-04';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'lot';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'ONGKIR', 'Ongkir', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [62] LED System
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-11-04';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'LED-SYSTEM', 'LED System', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [63] Base LED
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-11-04';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'BASE-LED', 'Base LED', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [64] Rigging LED
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-11-04';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'RIGGING-LED', 'Rigging LED', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [65] Sound System
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-11-04';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'SOUND-SYSTEM', 'Sound System', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [66] Cable Installation
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-11-04';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'lot';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'CABLE-INSTALLATION', 'Cable Installation', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [67] Lampu Penerangan
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-11-04';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'LAMPU-PENERANGAN', 'Lampu Penerangan', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [68] Toilet Portable
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-11-04';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'TOILET-PORTABLE', 'Toilet Portable', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [69] Misty Fan
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-11-04';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'MISTY-FAN', 'Misty Fan', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [70] Square Table
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-11-04';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'SQUARE-TABLE', 'Square Table', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  INSERT INTO rate_card_line (rate_card_id, item_id, unit_id, qty_default, qty_unit, freq_default, freq_unit, base_cost, sell_price_default, markup_type, markup_value, is_active)
  VALUES (v_ratecard_id, v_item_id, v_unit_id, 1.0, 'unit/day', 1.0, 'day', 96000.0, 120000.0, 'pct_margin', 20, TRUE)
  ON CONFLICT DO NOTHING;

  -- [71] Branding Visual
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-11-04';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'BRANDING-VISUAL', 'Branding Visual', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [72] Screen Visual
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-11-04';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'SCREEN-VISUAL', 'Screen Visual', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [73] Event Video Content
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-03-05';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'pcs';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'EVENT-VIDEO-CONTENT', 'Event Video Content', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [74] Content Operator
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-03-05';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'CONTENT-OPERATOR', 'Content Operator', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [75] Welcome Banner
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-05-01';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'pcs';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'WELCOME-BANNER', 'Welcome Banner', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [76] T-Banner
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-05-01';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'pcs';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'TBANNER', 'T-Banner', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [77] Baliho
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-05-01';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'pcs';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'BALIHO', 'Baliho', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [78] Umbul-Umbul
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-05-01';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'pcs';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'UMBULUMBUL', 'Umbul-Umbul', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [79] Bendera Partai
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-05-01';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'pcs';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'BENDERA-PARTAI', 'Bendera Partai', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [80] Spanduk
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-05-01';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'pcs';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'SPANDUK', 'Spanduk', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [81] Cover Rantis
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-05-02';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'set';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'COVER-RANTIS', 'Cover Rantis', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [82] Fascade
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-05-02';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'set';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'FASCADE', 'Fascade', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [83] Cetak dan Pasang
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-05-03';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'lot';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'CETAK-DAN-PASANG', 'Cetak dan Pasang', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [84] Project Director
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-11-04';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'PROJECT-DIRECTOR', 'Project Director', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [85] Project Officer
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-11-04';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'PROJECT-OFFICER', 'Project Officer', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  INSERT INTO rate_card_line (rate_card_id, item_id, unit_id, qty_default, qty_unit, freq_default, freq_unit, base_cost, sell_price_default, markup_type, markup_value, is_active)
  VALUES (v_ratecard_id, v_item_id, v_unit_id, 1.0, 'person/day', 1.0, 'day', 6400000.0, 8000000.0, 'pct_margin', 20, TRUE)
  ON CONFLICT DO NOTHING;

  -- [86] Traffic & Administrator
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-11-04';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'TRAFFIC-ADMINISTRATOR', 'Traffic & Administrator', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [87] Production Manager
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-11-04';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'PRODUCTION-MANAGER', 'Production Manager', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [88] Production Staff
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-11-04';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'PRODUCTION-STAFF', 'Production Staff', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [89] Floor Manager
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-11-04';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'FLOOR-MANAGER', 'Floor Manager', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [90] Floor Staff
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-11-04';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'FLOOR-STAFF', 'Floor Staff', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [91] Show Management
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-11-04';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'SHOW-MANAGEMENT', 'Show Management', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [92] Usher
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-11-04';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'USHER', 'Usher', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [93] Seating Arrangement Support
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-11-04';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'SEATING-ARRANGEMENT-SUPPO', 'Seating Arrangement Support', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [94] Logistic Manager
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-06-03';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'LOGISTIC-MANAGER', 'Logistic Manager', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [95] Logistic Staff
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-06-03';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'LOGISTIC-STAFF', 'Logistic Staff', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [96] Logistic Staff Loading
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-06-03';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'LOGISTIC-STAFF-LOADING', 'Logistic Staff Loading', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [97] Safety Security Officer
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-02-03';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'SAFETY-SECURITY-OFFICER', 'Safety Security Officer', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [98] Safety Security Supervisor
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-02-03';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'SAFETY-SECURITY-SUPERVISO', 'Safety Security Supervisor', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [99] VIP Escort
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-02-03';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'VIP-ESCORT', 'VIP Escort', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [100] Registration Crew
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-11-04';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'REGISTRATION-CREW', 'Registration Crew', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [101] Area PIC
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-11-04';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'AREA-PIC', 'Area PIC', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [102] MC
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-07-01';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'MC', 'MC', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [103] Moderator / Host
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-07-01';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'MODERATOR-HOST', 'Moderator / Host', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [104] Band / Guest Star
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-07-01';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'BAND-GUEST-STAR', 'Band / Guest Star', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [105] Dancer
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-07-01';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'DANCER', 'Dancer', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [106] Speaker
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-11-04';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'SPEAKER', 'Speaker', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [107] Talent Rider
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-07-01';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'lot';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'TALENT-RIDER', 'Talent Rider', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [108] Rent Car
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-08-01';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'RENT-CAR', 'Rent Car', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [109] Survey Transport
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-08-01';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'trip';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'SURVEY-TRANSPORT', 'Survey Transport', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [110] Loading Transport
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-11-04';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'trip';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'LOADING-TRANSPORT', 'Loading Transport', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [111] Material Mobilization
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-11-04';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'trip';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'MATERIAL-MOBILIZATION', 'Material Mobilization', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [112] Parking Area Support
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-11-04';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'lot';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'PARKING-AREA-SUPPORT', 'Parking Area Support', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [113] Safety & Security Team Room
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-09-01';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'SAFETY-SECURITY-TEAM-ROOM', 'Safety & Security Team Room', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [114] Project Team Room
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-09-01';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'PROJECT-TEAM-ROOM', 'Project Team Room', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [115] Catering VIP
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-11-04';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'pax';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'CATERING-VIP', 'Catering VIP', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [116] Catering DPP
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-11-04';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'pax';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'CATERING-DPP', 'Catering DPP', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [117] VIP Table Setup
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-11-04';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'set';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'VIP-TABLE-SETUP', 'VIP Table Setup', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [118] VIP Mineral Water
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-11-04';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'pax';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'VIP-MINERAL-WATER', 'VIP Mineral Water', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [119] Snack Team
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-09-03';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'pax';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'SNACK-TEAM', 'Snack Team', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [120] Snack Pengamanan
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-09-03';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'pax';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'SNACK-PENGAMANAN', 'Snack Pengamanan', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [121] Meals Team
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-09-03';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'pax';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'MEALS-TEAM', 'Meals Team', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [122] Meals Pengamanan
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-09-03';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'pax';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'MEALS-PENGAMANAN', 'Meals Pengamanan', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [123] Refreshment Loading
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-09-03';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'pax';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'REFRESHMENT-LOADING', 'Refreshment Loading', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [124] AMDK
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-09-03';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'AMDK', 'AMDK', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [125] Amenities
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-09-04';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'AMENITIES-02', 'Amenities', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [126] Sandal
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-09-04';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'SANDAL', 'Sandal', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [127] Tissue Kering
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-09-04';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'pcs';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'TISSUE-KERING', 'Tissue Kering', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [128] Tissue Basah
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-09-04';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'pcs';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'TISSUE-BASAH', 'Tissue Basah', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [129] Sabun Cuci Tangan
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-09-04';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'pcs';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'SABUN-CUCI-TANGAN', 'Sabun Cuci Tangan', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [130] Sabun Mandi
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-09-04';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'pcs';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'SABUN-MANDI', 'Sabun Mandi', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [131] Ember
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-09-04';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'pcs';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'EMBER', 'Ember', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [132] Gayung
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-09-04';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'pcs';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'GAYUNG', 'Gayung', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [133] Sajadah
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-09-04';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'pcs';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'SAJADAH', 'Sajadah', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [134] Tempat Sampah Rotan
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-09-04';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'pcs';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'TEMPAT-SAMPAH-ROTAN', 'Tempat Sampah Rotan', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [135] UMKM Free Meals
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-09-03';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'pax';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'UMKM-FREE-MEALS', 'UMKM Free Meals', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [136] Event Documentation
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-10-01';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'EVENT-DOCUMENTATION', 'Event Documentation', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [137] Photographer
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-10-01';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'PHOTOGRAPHER', 'Photographer', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [138] Videographer
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-10-01';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'VIDEOGRAPHER', 'Videographer', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [139] Highlight Video
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-10-01';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'pcs';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'HIGHLIGHT-VIDEO', 'Highlight Video', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [140] Event Reporting
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-11-04';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'EVENT-REPORTING-02', 'Event Reporting', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [141] ID Card
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-10-02';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'pcs';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'ID-CARD', 'ID Card', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [142] ID Card & Lanyard
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-10-02';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'set';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'ID-CARD-LANYARD', 'ID Card & Lanyard', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [143] Tyvec Peserta
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-10-02';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'pcs';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'TYVEC-PESERTA', 'Tyvec Peserta', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [144] Sticker Kendaraan
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-10-02';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'pcs';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'STICKER-KENDARAAN', 'Sticker Kendaraan', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [145] Legalisir Hologram
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-10-02';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'pcs';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'LEGALISIR-HOLOGRAM', 'Legalisir Hologram', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [146] Per Diem
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-11-01';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'PER-DIEM', 'Per Diem', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [147] Transport
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-11-01';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'trip';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'TRANSPORT', 'Transport', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [148] Konsumsi
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-11-01';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'pax';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'KONSUMSI', 'Konsumsi', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [149] ATK
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-11-04';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'lot';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'ATK', 'ATK', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [150] Laptop
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-11-04';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'LAPTOP', 'Laptop', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [151] Printer
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-11-04';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'PRINTER', 'Printer', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [152] HT
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-11-04';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'HT', 'HT', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [153] Ongkir
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-11-04';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'lot';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'ONGKIR-02', 'Ongkir', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [154] Ongkos Pasang
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-11-04';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'lot';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'ONGKOS-PASANG-02', 'Ongkos Pasang', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [155] Lem dan Double Tape
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-11-04';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'lot';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'LEM-DAN-DOUBLE-TAPE-02', 'Lem dan Double Tape', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [156] Pemadam Kebakaran
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-02-01';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'PEMADAM-KEBAKARAN', 'Pemadam Kebakaran', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [157] Team Medis
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-02-01';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'TEAM-MEDIS', 'Team Medis', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  INSERT INTO rate_card_line (rate_card_id, item_id, unit_id, qty_default, qty_unit, freq_default, freq_unit, base_cost, sell_price_default, markup_type, markup_value, is_active)
  VALUES (v_ratecard_id, v_item_id, v_unit_id, 1.0, 'unit', 1.0, 'day', 1320000.0, 1650000.0, 'pct_margin', 20, TRUE)
  ON CONFLICT DO NOTHING;

  -- [158] Standard Baricade
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-03-04';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'STANDARD-BARICADE', 'Standard Baricade', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  INSERT INTO rate_card_line (rate_card_id, item_id, unit_id, qty_default, qty_unit, freq_default, freq_unit, base_cost, sell_price_default, markup_type, markup_value, is_active)
  VALUES (v_ratecard_id, v_item_id, v_unit_id, 1.0, 'unit', 1.0, 'day', 28000.0, 35000.0, 'pct_margin', 20, TRUE)
  ON CONFLICT DO NOTHING;

  -- [159] Gubeng
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-03-04';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'GUBENG', 'Gubeng', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [160] Queue Line Stretch
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-03-04';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'QUEUE-LINE-STRETCH', 'Queue Line Stretch', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [161] Queue Line Bludru
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-03-04';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'QUEUE-LINE-BLUDRU', 'Queue Line Bludru', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [162] Sarnavil 3X3
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-03-05';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'SARNAVIL-3X3', 'Sarnavil 3X3', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [163] Sarnavil 5X5
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-03-05';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'SARNAVIL-5X5', 'Sarnavil 5X5', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [164] Roders
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-03-05';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'RODERS', 'Roders', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [165] Tratak
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-03-05';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'TRATAK', 'Tratak', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [166] Flooring Karpet
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-03-05';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'FLOORING-KARPET', 'Flooring Karpet', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [167] Flooring Melaminto
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-03-05';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'FLOORING-MELAMINTO', 'Flooring Melaminto', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [168] Sarnavil 3X3 Incl. Flooring
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-03-05';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'SARNAVIL-3X3-INCL-FLOORIN', 'Sarnavil 3X3 Incl. Flooring', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [169] Sarnavil 5X5 Incl. Flooring
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-03-05';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'SARNAVIL-5X5-INCL-FLOORIN', 'Sarnavil 5X5 Incl. Flooring', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [170] Instalasi Listrik Tenda
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-03-07';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'INSTALASI-LISTRIK-TENDA', 'Instalasi Listrik Tenda', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [171] Cable Canal
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-03-07';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'CABLE-CANAL', 'Cable Canal', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [172] Genset 40 Kva
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-03-07';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'GENSET-40-KVA', 'Genset 40 Kva', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [173] Genset 60 Kva
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-03-07';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'GENSET-60-KVA', 'Genset 60 Kva', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [174] Genset 80 Kva
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-03-07';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'GENSET-80-KVA', 'Genset 80 Kva', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [175] Genset 100 Kva
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-03-07';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'GENSET-100-KVA', 'Genset 100 Kva', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [176] Genset 150 Kva
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-03-07';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'GENSET-150-KVA', 'Genset 150 Kva', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [177] Genset 250 Kva
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-03-07';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'GENSET-250-KVA', 'Genset 250 Kva', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [178] Stage
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-03-07';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'STAGE', 'Stage', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [179] Stage Tent
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-03-07';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'STAGE-TENT', 'Stage Tent', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [180] Rigging
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-03-07';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'RIGGING', 'Rigging', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [181] Sound System 5000 Watt
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-03-07';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'SOUND-SYSTEM-5000-WATT', 'Sound System 5000 Watt', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [182] Sound System 10000 Watt
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-03-07';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'SOUND-SYSTEM-10000-WATT', 'Sound System 10000 Watt', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [183] Sound System 15000 Watt
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-03-07';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'SOUND-SYSTEM-15000-WATT', 'Sound System 15000 Watt', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [184] Sound System 20000 Watt
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-03-07';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'SOUND-SYSTEM-20000-WATT', 'Sound System 20000 Watt', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [185] Sound System 25000 Watt
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-03-07';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'SOUND-SYSTEM-25000-WATT', 'Sound System 25000 Watt', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [186] Led Screen P4.9
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-03-07';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'LED-SCREEN-P49', 'Led Screen P4.9', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [187] Led Screen P3.9
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-03-07';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'LED-SCREEN-P39', 'Led Screen P3.9', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [188] Led Screen P2.9
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-03-07';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'LED-SCREEN-P29', 'Led Screen P2.9', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [189] Led Screen P2.6
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-03-07';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'LED-SCREEN-P26', 'Led Screen P2.6', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [190] Led Tv 55"
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-03-07';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'LED-TV-55', 'Led Tv 55"', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [191] Projector 5000 Lumens
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-03-07';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'PROJECTOR-5000-LUMENS', 'Projector 5000 Lumens', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [192] Projector 7000 Lumens
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-03-07';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'PROJECTOR-7000-LUMENS', 'Projector 7000 Lumens', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [193] Projector 10.000 Lumens
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-03-07';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'PROJECTOR-10000-LUMENS', 'Projector 10.000 Lumens', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [194] Projector 15.000 Lumens
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-03-07';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'PROJECTOR-15000-LUMENS', 'Projector 15.000 Lumens', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [195] Par Led
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-03-07';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'PAR-LED', 'Par Led', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [196] Par Can
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-03-07';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'PAR-CAN', 'Par Can', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [197] Single Par Can
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-03-07';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'SINGLE-PAR-CAN', 'Single Par Can', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [198] Mini Brute
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-03-07';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'MINI-BRUTE', 'Mini Brute', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [199] Acl
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-03-07';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'ACL', 'Acl', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [200] Follow Spot
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-03-07';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'FOLLOW-SPOT', 'Follow Spot', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [201] Fresnell
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-03-07';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'FRESNELL', 'Fresnell', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [202] Strobo / Blitz
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-03-07';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'STROBO-BLITZ', 'Strobo / Blitz', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [203] Smoke Gun Standard
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-03-07';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'SMOKE-GUN-STANDARD', 'Smoke Gun Standard', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [204] Moving Head *Wash
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-03-07';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'MOVING-HEAD-WASH', 'Moving Head *Wash', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [205] Beam
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-03-07';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'BEAM', 'Beam', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [206] Sky Tracker- 1 Color
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-03-07';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'SKY-TRACKER-1-COLOR', 'Sky Tracker- 1 Color', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [207] Sky Tracker - 1 Color
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-03-07';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'SKY-TRACKER-1-COLOR-02', 'Sky Tracker - 1 Color', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [208] Avolite Pearl 2010
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-03-07';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'AVOLITE-PEARL-2010', 'Avolite Pearl 2010', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [209] Hollogen - Area Venue (Satuan )
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-03-07';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'HOLLOGEN-AREA-VENUE-SATUA', 'Hollogen - Area Venue (Satuan )', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [210] Tower Lampu Penerangan Area
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-03-07';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'TOWER-LAMPU-PENERANGAN-AR', 'Tower Lampu Penerangan Area', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [211] Lampu Penerangan Tend Support + Cabling
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-03-07';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'LAMPU-PENERANGAN-TEND-SUP', 'Lampu Penerangan Tend Support + Cabling', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [212] Switcher + Monitor
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-04-02';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'SWITCHER-MONITOR', 'Switcher + Monitor', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [213] Rent Video Camera + Triport
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-04-02';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'RENT-VIDEO-CAMERA-TRIPORT', 'Rent Video Camera + Triport', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [214] Giant Canon Convety
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-04-02';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'GIANT-CANON-CONVETY', 'Giant Canon Convety', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [215] Co2
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-04-02';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'CO2', 'Co2', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [216] Napalm
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-04-02';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'NAPALM', 'Napalm', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [217] Blower
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-04-02';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'BLOWER', 'Blower', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [218] Miror Ball 60 Inc
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-04-02';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'MIROR-BALL-60-INC', 'Miror Ball 60 Inc', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [219] Sirine Red
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-04-02';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'SIRINE-RED', 'Sirine Red', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [220] Pyro
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-04-02';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'PYRO', 'Pyro', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [221] Fireworks
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-04-02';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'FIREWORKS', 'Fireworks', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [222] Futura Non Cover
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-03-03';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'FUTURA-NON-COVER', 'Futura Non Cover', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [223] Futura Cover
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-03-03';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'FUTURA-COVER', 'Futura Cover', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [224] Single Sofa
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-03-03';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'SINGLE-SOFA', 'Single Sofa', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [225] Sofa Puff
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-03-03';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'SOFA-PUFF', 'Sofa Puff', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [226] Tiffany Chair
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-03-03';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'TIFFANY-CHAIR', 'Tiffany Chair', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [227] Bean Bag
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-03-03';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'BEAN-BAG', 'Bean Bag', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [228] Barstool
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-03-03';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'BARSTOOL', 'Barstool', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [229] Baso Chair
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-03-03';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'BASO-CHAIR', 'Baso Chair', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [230] Ibm
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-03-03';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'IBM', 'Ibm', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [231] Ibm Cover
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-03-03';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'IBM-COVER', 'Ibm Cover', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [232] Coffee Table
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-03-03';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'COFFEE-TABLE', 'Coffee Table', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [233] Bar Table
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-03-03';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'BAR-TABLE', 'Bar Table', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [234] Bar Table With Cover
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-03-03';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'BAR-TABLE-WITH-COVER', 'Bar Table With Cover', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [235] Garden Desk Set
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-03-03';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'GARDEN-DESK-SET', 'Garden Desk Set', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [236] Parasol
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-03-03';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'PARASOL', 'Parasol', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [237] Rent Ac
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-03-03';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'RENT-AC', 'Rent Ac', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [238] Portable Toilet
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-03-03';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'PORTABLE-TOILET', 'Portable Toilet', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [239] Project Manager
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-06-01';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'PROJECT-MANAGER', 'Project Manager', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  INSERT INTO rate_card_line (rate_card_id, item_id, unit_id, qty_default, qty_unit, freq_default, freq_unit, base_cost, sell_price_default, markup_type, markup_value, is_active)
  VALUES (v_ratecard_id, v_item_id, v_unit_id, 1.0, 'unit', 1.0, 'day', 9600000.0, 12000000.0, 'pct_margin', 20, TRUE)
  ON CONFLICT DO NOTHING;

  -- [240] Production Crew
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-06-01';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'PRODUCTION-CREW', 'Production Crew', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [241] Logistic Crew
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-06-01';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'LOGISTIC-CREW', 'Logistic Crew', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [242] Talent Manager
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-06-01';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'TALENT-MANAGER', 'Talent Manager', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [243] Lo Vip
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-06-01';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'LO-VIP', 'Lo Vip', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [244] Lo Artis
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-06-01';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'LO-ARTIS', 'Lo Artis', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [245] Lo
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-06-01';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'LO', 'Lo', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [246] Floor Crew
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-06-01';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'FLOOR-CREW', 'Floor Crew', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [247] Runners
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-06-01';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'RUNNERS', 'Runners', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [248] Safety And Security Manager
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-02-03';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'SAFETY-AND-SECURITY-MANAG', 'Safety And Security Manager', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [249] Safety And Security Supervisor
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-02-03';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'SAFETY-AND-SECURITY-SUPER', 'Safety And Security Supervisor', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [250] Crowd Control
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-02-03';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'CROWD-CONTROL', 'Crowd Control', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [251] Security/Internal Guard
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-02-03';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'SECURITYINTERNAL-GUARD', 'Security/Internal Guard', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [252] Liasion Officer
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-02-03';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'LIASION-OFFICER', 'Liasion Officer', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [253] Pic Medic
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-02-03';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'PIC-MEDIC', 'Pic Medic', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [254] Pawang Hujan
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-06-02';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'PAWANG-HUJAN', 'Pawang Hujan', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [255] Talent (Band Pembuka)
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-07-01';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'TALENT-BAND-PEMBUKA', 'Talent (Band Pembuka)', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [256] Dancer (Local)
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-07-01';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'DANCER-LOCAL', 'Dancer (Local)', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [257] Dj (Local)
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-07-01';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'DJ-LOCAL', 'Dj (Local)', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [258] Sewa Ht
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-07-01';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'SEWA-HT', 'Sewa Ht', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [259] Sewa Clear Comm
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-07-01';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'SEWA-CLEAR-COMM', 'Sewa Clear Comm', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [260] Avanza
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-08-01';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'AVANZA', 'Avanza', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [261] Inova
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-08-01';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'INOVA', 'Inova', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [262] Grandmax
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-08-01';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'GRANDMAX', 'Grandmax', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [263] Hiace
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-08-01';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'HIACE', 'Hiace', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [264] Alphard
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-08-01';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'ALPHARD', 'Alphard', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [265] Bus
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-08-01';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'BUS', 'Bus', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [266] Hotel Team Eo
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-09-01';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'HOTEL-TEAM-EO', 'Hotel Team Eo', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

  -- [267] Hotel Talent Band National
  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = 'SUB-07-01';
  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = 'unit';

  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)
  VALUES (v_subcategory_id, 'HOTEL-TALENT-BAND-NATIONA', 'Hotel Talent Band National', 'service', v_unit_id, TRUE, NULL)
  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name
  RETURNING id INTO v_item_id;

END $$;

-- Migration selesai.
-- Total items diproskes: 267
