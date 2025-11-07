-- Add friend system enums
DO $$ BEGIN
  CREATE TYPE public.friend_status AS ENUM ('pending', 'accepted', 'declined');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Create friends table
CREATE TABLE IF NOT EXISTS public.friends (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  friend_id  uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status     public.friend_status NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT friends_unique_pair UNIQUE (user_id, friend_id),
  CONSTRAINT friends_no_self_friend CHECK (user_id != friend_id)
);

-- Create book recommendations table
CREATE TABLE IF NOT EXISTS public.book_recommendations (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  to_user_id   uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  book_id      uuid NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  message      text,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT book_recommendations_unique_recommendation UNIQUE (from_user_id, to_user_id, book_id)
);

-- Add updated_at triggers
DROP TRIGGER IF EXISTS touch_friends_updated ON public.friends;
CREATE TRIGGER touch_friends_updated
BEFORE UPDATE ON public.friends
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS touch_recommendations_updated ON public.book_recommendations;
CREATE TRIGGER touch_recommendations_updated
BEFORE UPDATE ON public.book_recommendations
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS ix_friends_user ON public.friends(user_id);
CREATE INDEX IF NOT EXISTS ix_friends_friend ON public.friends(friend_id);
CREATE INDEX IF NOT EXISTS ix_recommendations_from_user ON public.book_recommendations(from_user_id);
CREATE INDEX IF NOT EXISTS ix_recommendations_to_user ON public.book_recommendations(to_user_id);
CREATE INDEX IF NOT EXISTS ix_recommendations_book ON public.book_recommendations(book_id);

-- Create RLS policies for friends table
ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own friend connections"
ON public.friends FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can create friend requests"
ON public.friends FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own friend requests"
ON public.friends FOR UPDATE
TO authenticated
USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Create RLS policies for book recommendations
ALTER TABLE public.book_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view recommendations they've sent or received"
ON public.book_recommendations FOR SELECT
TO authenticated
USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

CREATE POLICY "Users can create recommendations"
ON public.book_recommendations FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = from_user_id);

CREATE POLICY "Users can delete their own recommendations"
ON public.book_recommendations FOR DELETE
TO authenticated
USING (auth.uid() = from_user_id);

-- Create function to handle friend requests
CREATE OR REPLACE FUNCTION public.handle_friend_request(
  request_id uuid,
  action text
) RETURNS public.friends
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  request friends;
BEGIN
  -- Check if the request exists and user is authorized
  SELECT * INTO request
  FROM friends
  WHERE id = request_id AND (friend_id = auth.uid() OR user_id = auth.uid());
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Friend request not found or unauthorized';
  END IF;
  
  -- Update the request status
  UPDATE friends
  SET status = 
    CASE 
      WHEN action = 'accept' THEN 'accepted'::friend_status
      WHEN action = 'decline' THEN 'declined'::friend_status
      ELSE status
    END,
    updated_at = now()
  WHERE id = request_id
  RETURNING * INTO request;
  
  RETURN request;
END;
$$;

-- Create function to get friend suggestions based on common interests
CREATE OR REPLACE FUNCTION public.get_friend_suggestions(
  p_user_id uuid,
  p_limit integer DEFAULT 5
) RETURNS TABLE (
  user_id uuid,
  common_books bigint
) LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH user_loans AS (
    -- Get books the user has borrowed
    SELECT DISTINCT book_id
    FROM loans l
    JOIN copies c ON l.copy_id = c.id
    WHERE l.user_id = p_user_id
  ),
  user_recommendations AS (
    -- Get books the user has recommended
    SELECT DISTINCT book_id
    FROM book_recommendations
    WHERE from_user_id = p_user_id
  ),
  user_books AS (
    -- Combine borrowed and recommended books
    SELECT book_id FROM user_loans
    UNION
    SELECT book_id FROM user_recommendations
  ),
  potential_friends AS (
    -- Find users who have borrowed or recommended similar books
    SELECT 
      CASE 
        WHEN l.user_id = p_user_id THEN br.from_user_id
        ELSE l.user_id
      END AS potential_friend_id,
      COUNT(DISTINCT COALESCE(c.book_id, br.book_id)) AS shared_books
    FROM user_books ub
    LEFT JOIN copies c ON ub.book_id = c.book_id
    LEFT JOIN loans l ON c.id = l.copy_id
    LEFT JOIN book_recommendations br ON ub.book_id = br.book_id
    WHERE (l.user_id != p_user_id OR br.from_user_id != p_user_id)
    AND NOT EXISTS (
      -- Exclude existing friends
      SELECT 1 FROM friends f
      WHERE (f.user_id = p_user_id AND f.friend_id = COALESCE(l.user_id, br.from_user_id))
      OR (f.friend_id = p_user_id AND f.user_id = COALESCE(l.user_id, br.from_user_id))
    )
    GROUP BY potential_friend_id
  )
  SELECT 
    potential_friend_id AS user_id,
    shared_books AS common_books
  FROM potential_friends
  WHERE potential_friend_id IS NOT NULL
  ORDER BY shared_books DESC
  LIMIT p_limit;
END;
$$;

-- Add helpful view for friend lists
CREATE OR REPLACE VIEW public.friend_list AS
SELECT 
  f.id,
  f.user_id,
  f.friend_id,
  f.status,
  up.username AS friend_username,
  COALESCE(up.display_name, u.display_name) AS friend_display_name,
  up.avatar_url AS friend_avatar_url,
  f.created_at,
  f.updated_at
FROM public.friends f
JOIN public.users u ON u.id = f.friend_id
LEFT JOIN public.user_profiles up ON up.user_id = f.friend_id;