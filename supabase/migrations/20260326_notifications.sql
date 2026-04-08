-- ============================================================
-- Notification System Migration
-- Run this in your Supabase SQL editor
-- ============================================================

-- Broadcast notifications (targeted by role)
CREATE TABLE IF NOT EXISTS "Notifications" (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  type         TEXT        NOT NULL CHECK (type IN ('checkout', 'checkin')),
  title        TEXT        NOT NULL,
  message      TEXT        NOT NULL,
  target_roles TEXT[]      NOT NULL DEFAULT '{staff,admin}',
  metadata     JSONB,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Per-user read tracking
CREATE TABLE IF NOT EXISTS "NotificationReads" (
  notification_id UUID        NOT NULL REFERENCES "Notifications"(id) ON DELETE CASCADE,
  user_id         TEXT        NOT NULL,
  read_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (notification_id, user_id)
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_notifications_created_at
  ON "Notifications"(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notification_reads_user
  ON "NotificationReads"(user_id);
