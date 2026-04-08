-- ============================================================
-- User Notification Extensions
-- Run this in your Supabase SQL editor
-- ============================================================

-- Add user-targeted column (nullable — null means role-broadcast)
ALTER TABLE "Notifications"
  ADD COLUMN IF NOT EXISTS target_user_id TEXT;

-- Expand type constraint to cover user notification types
ALTER TABLE "Notifications"
  DROP CONSTRAINT IF EXISTS notifications_type_check;

ALTER TABLE "Notifications"
  ADD CONSTRAINT notifications_type_check
  CHECK (type IN ('checkout', 'checkin', 'loan_confirmed', 'due_soon', 'hold_ready', 'hold_placed'));

-- Index for fast user-targeted lookups
CREATE INDEX IF NOT EXISTS idx_notifications_target_user
  ON "Notifications"(target_user_id)
  WHERE target_user_id IS NOT NULL;
