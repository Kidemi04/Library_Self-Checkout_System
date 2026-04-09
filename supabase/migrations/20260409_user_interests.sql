-- ============================================================
-- User Interests Table Migration
-- Run this in your Supabase SQL editor to create the UserInterests table
-- ============================================================

-- User interests for personalization
CREATE TABLE IF NOT EXISTS "UserInterests" (
  user_id    TEXT        PRIMARY KEY,
  interests  TEXT[]      NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for efficient user lookups
CREATE INDEX IF NOT EXISTS idx_user_interests_user_id
  ON "UserInterests"(user_id);

-- Add a comment for clarity
COMMENT ON TABLE "UserInterests" IS 'Stores user-selected interests for personalization and recommendations';
COMMENT ON COLUMN "UserInterests".user_id IS 'References the user ID from auth.users';
COMMENT ON COLUMN "UserInterests".interests IS 'Array of user-selected interest strings';
COMMENT ON COLUMN "UserInterests".updated_at IS 'Last time interests were updated';