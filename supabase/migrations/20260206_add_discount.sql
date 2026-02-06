-- Add discount columns to invoices table
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS discount_rate DECIMAL(5, 2) DEFAULT 0;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(12, 2) DEFAULT 0;

-- Comment on columns
COMMENT ON COLUMN invoices.discount_rate IS 'Percentage discount applied to subtotal';
COMMENT ON COLUMN invoices.discount_amount IS 'Calculated discount amount based on rate';
