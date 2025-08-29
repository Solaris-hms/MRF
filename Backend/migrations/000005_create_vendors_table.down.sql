-- Migration rollback for vendor tables

DROP INDEX IF EXISTS idx_vendor_documents_vendor_id;
DROP INDEX IF EXISTS idx_vendor_factories_vendor_id;
DROP INDEX IF EXISTS idx_vendors_created_at;
DROP INDEX IF EXISTS idx_vendors_status;

DROP TABLE IF EXISTS vendor_documents;
DROP TABLE IF EXISTS vendor_factories;
DROP TABLE IF EXISTS vendors;