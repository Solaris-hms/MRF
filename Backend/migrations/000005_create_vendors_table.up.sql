-- Migration for creating vendor-related tables

CREATE TABLE IF NOT EXISTS vendors (
    id VARCHAR(255) PRIMARY KEY,
    vendor_name VARCHAR(255) NOT NULL,
    vendor_code VARCHAR(100),
    year_of_establishment VARCHAR(10),
    type_of_ownership VARCHAR(100),
    type_of_business VARCHAR(100),
    is_ssi_msme VARCHAR(10),
    registration_no VARCHAR(100),
    cpcb_lic_no VARCHAR(100),
    sales_tax_no VARCHAR(100),
    gst_no VARCHAR(50),
    pan_no VARCHAR(20),
    prepared_by VARCHAR(255),
    authorized_by VARCHAR(255),
    approved_by VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'Pending',
    created_by_user_id INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vendor_factories (
    id SERIAL PRIMARY KEY,
    vendor_id VARCHAR(255) NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    factory_no INTEGER NOT NULL DEFAULT 1,
    address1 TEXT,
    address2 TEXT,
    address3 TEXT,
    mob_no VARCHAR(20),
    fax_no VARCHAR(20),
    email_id VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS vendor_documents (
    id SERIAL PRIMARY KEY,
    vendor_id VARCHAR(255) NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX idx_vendors_status ON vendors(status);
CREATE INDEX idx_vendors_created_at ON vendors(created_at);
CREATE INDEX idx_vendor_factories_vendor_id ON vendor_factories(vendor_id);
CREATE INDEX idx_vendor_documents_vendor_id ON vendor_documents(vendor_id);