-- Add category to procedures: 'health' | 'supply'
ALTER TABLE procedures ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'health';
