-- This migration adds the new assets table for asset management.

CREATE TABLE IF NOT EXISTS assets (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(255),
    purchase_date DATE,
    value NUMERIC(12, 2),
    status VARCHAR(50),
    location VARCHAR(255),
    serial_number VARCHAR(255),
    supplier VARCHAR(255),
    image_url VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);