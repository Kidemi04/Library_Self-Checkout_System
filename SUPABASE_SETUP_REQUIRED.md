## Supabase Setup Required

The app is trying to save interests to the `user_interests` table, but this table does not exist in your Supabase database yet.

### Quick Setup (2 minutes)

1. **Open Supabase SQL Editor**
   - Go to https://app.supabase.com/
   - Select your project
   - Click **SQL Editor** in the left sidebar
   - Click **New query**

2. **Copy and run this SQL**
   ```sql
   CREATE TABLE IF NOT EXISTS "user_interests" (
     user_id    TEXT        PRIMARY KEY,
     interests  TEXT[]      NOT NULL DEFAULT '{}',
     updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
   );

   CREATE INDEX IF NOT EXISTS idx_user_interests_user_id
     ON "user_interests"(user_id);

   COMMENT ON TABLE "user_interests" IS 'Stores user-selected interests for personalization and recommendations';
   COMMENT ON COLUMN "user_interests".user_id IS 'References the user ID from auth.users';
   COMMENT ON COLUMN "user_interests".interests IS 'Array of user-selected interest strings';
   COMMENT ON COLUMN "user_interests".updated_at IS 'Last time interests were updated';
   ```
   - Click the **RUN** button (or Ctrl+Enter)
   - Wait for success message

3. **Test it**
   - Go back to your app and refresh
   - Try saving interests again
   - The 500 error should be gone

### Why This Matters

- PostgREST (Supabase's API) requires tables to exist before the app can insert/update rows
- The migration file `supabase/migrations/20260409_user_interests.sql` contains this exact schema
- This is a one-time setup—after running this SQL, the table is ready for all users

