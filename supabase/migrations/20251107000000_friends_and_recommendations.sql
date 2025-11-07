-- Create enum for friend request status
CREATE TYPE friend_status AS ENUM ('pending', 'accepted', 'declined');

-- Create friends table
CREATE TABLE friends (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    friend_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status friend_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT friends_unique_pair UNIQUE (user_id, friend_id),
    -- Prevent self-friending
    CONSTRAINT friends_no_self_friend CHECK (user_id != friend_id)
);

-- Create book recommendations table
CREATE TABLE book_recommendations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    from_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    to_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT book_recommendations_unique_recommendation UNIQUE (from_user_id, to_user_id, book_id)
);

-- Create RLS policies for friends table
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own friend connections"
ON friends FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can create friend requests"
ON friends FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own friend requests"
ON friends FOR UPDATE
TO authenticated
USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Create RLS policies for book recommendations
ALTER TABLE book_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view recommendations they've sent or received"
ON book_recommendations FOR SELECT
TO authenticated
USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

CREATE POLICY "Users can create recommendations"
ON book_recommendations FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = from_user_id);

CREATE POLICY "Users can delete their own recommendations"
ON book_recommendations FOR DELETE
TO authenticated
USING (auth.uid() = from_user_id);

-- Create functions to manage friend requests
CREATE OR REPLACE FUNCTION handle_friend_request(
    request_id UUID,
    action text
) RETURNS friends
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

-- Function to get friend suggestions based on common book interests
CREATE OR REPLACE FUNCTION get_friend_suggestions(
    p_user_id UUID,
    p_limit integer DEFAULT 5
) RETURNS TABLE (
    user_id UUID,
    common_books bigint
) LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    WITH user_books AS (
        -- Get books the user has borrowed or recommended
        SELECT DISTINCT book_id
        FROM (
            SELECT book_id FROM loans WHERE user_id = p_user_id
            UNION
            SELECT book_id FROM book_recommendations WHERE from_user_id = p_user_id
        ) AS combined_books
    ),
    potential_friends AS (
        -- Find users who have borrowed or recommended the same books
        SELECT 
            CASE 
                WHEN l.user_id = p_user_id THEN br.from_user_id
                ELSE l.user_id
            END AS potential_friend_id,
            COUNT(DISTINCT COALESCE(l.book_id, br.book_id)) AS shared_books
        FROM user_books ub
        LEFT JOIN loans l ON ub.book_id = l.book_id
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