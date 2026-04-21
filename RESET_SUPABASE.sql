-- ============================================================
-- JUARA RATECARD - CLEAN RESET SCRIPT
-- ============================================================

-- 1. Drop existing tables (Children first)
DROP TABLE IF EXISTS quotation_revision_log;
DROP TABLE IF EXISTS quotation_status_log;
DROP TABLE IF EXISTS quotation_line;
DROP TABLE IF EXISTS quotation;
DROP TABLE IF EXISTS rate_card_line;
DROP TABLE IF EXISTS rate_card;
DROP TABLE IF EXISTS master_item_variant;
DROP TABLE IF EXISTS master_item;
DROP TABLE IF EXISTS master_subcategory;
DROP TABLE IF EXISTS master_category;
DROP TABLE IF EXISTS master_client;
DROP TABLE IF EXISTS master_vendor;
DROP TABLE IF EXISTS master_zone;
DROP TABLE IF EXISTS master_unit;

-- 2. Include the Setup Script
\i FINAL_SUPABASE_SETUP.sql
