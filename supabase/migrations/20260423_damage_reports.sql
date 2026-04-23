-- ============================================================
-- Damage / Condition Reports
-- Captures a structured record + photo URLs any time staff
-- marks a returned copy as damaged / lost / needs_inspection.
-- Run this in your Supabase SQL editor, then create a
-- Storage bucket named `damage-reports` (private; accessed
-- via signed URLs from the app).
-- ============================================================

CREATE TABLE IF NOT EXISTS "DamageReports" (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id     UUID        NOT NULL REFERENCES "Loans"(id)  ON DELETE CASCADE,
  copy_id     UUID        NOT NULL REFERENCES "Copies"(id) ON DELETE CASCADE,
  reported_by UUID                 REFERENCES "Users"(id)  ON DELETE SET NULL,
  severity    TEXT        NOT NULL CHECK (severity IN ('damaged', 'lost', 'needs_inspection')),
  notes       TEXT,
  photo_urls  JSONB       NOT NULL DEFAULT '[]'::jsonb,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_damage_reports_copy
  ON "DamageReports"(copy_id);

CREATE INDEX IF NOT EXISTS idx_damage_reports_created_at
  ON "DamageReports"(created_at DESC);

-- ------------------------------------------------------------
-- Storage bucket
-- ------------------------------------------------------------
-- In Supabase dashboard → Storage → New bucket:
--   Name:   damage-reports
--   Public: No
-- Paths written as: {loan_id}/{timestamp}-{idx}.{ext}
-- App reads them via signed URLs.
