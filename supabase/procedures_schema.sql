-- 1. Support fractional values for treats (e.g. 0.3 pieces)
ALTER TABLE feedings ALTER COLUMN amount_grams TYPE NUMERIC;

-- 2. Add price column to purchases
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS price NUMERIC(10, 2) DEFAULT 0;

-- 3. Create procedures table for the Health section
CREATE TABLE IF NOT EXISTS procedures (
  id           UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  performed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  title        TEXT        NOT NULL,
  description  TEXT,
  cost         NUMERIC(10, 2) DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE procedures DISABLE ROW LEVEL SECURITY;
