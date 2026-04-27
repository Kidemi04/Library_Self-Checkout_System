-- ============================================================
-- v3.0.3 — Loans reminder tracking
-- Two columns let the Overdue page show "Last reminded 2h ago by Kelvin"
-- and throttle repeat reminders within 24h.
-- ============================================================

ALTER TABLE "Loans"
  ADD COLUMN IF NOT EXISTS last_reminded_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_reminded_by UUID REFERENCES "Users"(id) ON DELETE SET NULL;

-- Speeds up the overdue query: only scans currently-active loans, sorted by due date.
CREATE INDEX IF NOT EXISTS idx_loans_overdue_active
  ON "Loans" (due_at)
  WHERE returned_at IS NULL;
