-- Backend/migrations/000006_create_inventory_audits_table.up.sql

CREATE TABLE IF NOT EXISTS inventory_audits (
    id SERIAL PRIMARY KEY,
    material_id INTEGER NOT NULL REFERENCES inventory(id) ON DELETE RESTRICT,
    adjustment_tons NUMERIC(12, 4) NOT NULL,
    old_stock_tons NUMERIC(12, 4) NOT NULL,
    new_stock_tons NUMERIC(12, 4) NOT NULL,
    reason TEXT NOT NULL,
    audited_by_user_id INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_inventory_audits_material_id ON inventory_audits(material_id);
CREATE INDEX idx_inventory_audits_created_at ON inventory_audits(created_at);