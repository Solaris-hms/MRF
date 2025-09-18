ALTER TABLE material_sales
ADD COLUMN original_weight_tons NUMERIC(10, 3),
ADD COLUMN deduction_type VARCHAR(50),
ADD COLUMN deduction_value NUMERIC(10, 2),
ADD COLUMN deduction_amount NUMERIC(10, 3),
ADD COLUMN deduction_reason TEXT,
ADD COLUMN billing_weight_tons NUMERIC(10, 3);