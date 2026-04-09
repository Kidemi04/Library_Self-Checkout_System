-- ============================================================
-- Learning Paths Tracking Tables
-- ============================================================

-- Table to store a unified Learning Path
CREATE TABLE IF NOT EXISTS "LearningPaths" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  target_bachelor TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by TEXT -- References auth.users
);

-- Table to sequence the individual steps via polymorphic resource structure
CREATE TABLE IF NOT EXISTS "LearningPathSteps" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  path_id uuid NOT NULL REFERENCES "LearningPaths"(id) ON DELETE CASCADE,
  step_order INTEGER NOT NULL,
  resource_type TEXT NOT NULL, -- 'BOOK' or 'LINKEDIN'
  resource_id TEXT NOT NULL,
  title TEXT NOT NULL,
  difficulty TEXT, -- Beginner | Intermediate | Advanced
  UNIQUE(path_id, step_order)
);

-- Table tracking when a user finishes a particular step in a given path
CREATE TABLE IF NOT EXISTS "UserLearningProgress" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL, -- References auth.users
  step_id uuid NOT NULL REFERENCES "LearningPathSteps"(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, step_id)
);

-- Indexing for performance lookups
CREATE INDEX IF NOT EXISTS idx_learning_paths_target 
  ON "LearningPaths"(target_bachelor);
  
CREATE INDEX IF NOT EXISTS idx_user_learning_progress 
  ON "UserLearningProgress"(user_id);
