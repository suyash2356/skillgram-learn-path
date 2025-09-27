-- Add post_collections table to allow users to organize their own posts
CREATE TABLE post_collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, name)
);

-- Add an index on user_id for faster querying
CREATE INDEX idx_post_collections_user_id ON post_collections(user_id);

-- Add a nullable foreign key to the posts table
ALTER TABLE posts
ADD COLUMN post_collection_id UUID REFERENCES post_collections(id) ON DELETE SET NULL;

-- Add an index for the new foreign key
CREATE INDEX idx_posts_post_collection_id ON posts(post_collection_id);

-- Enable RLS
ALTER TABLE post_collections ENABLE ROW LEVEL SECURITY;

-- Policies for post_collections
CREATE POLICY "Users can view their own post collections"
ON post_collections
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own post collections"
ON post_collections
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own post collections"
ON post_collections
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own post collections"
ON post_collections
FOR DELETE
USING (auth.uid() = user_id);

-- Grant usage on schema and tables to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE post_collections TO authenticated;

-- Also update policy for posts to allow updating the new column
-- Drop existing policy first
DROP POLICY IF EXISTS "Users can update their own posts" ON posts;

-- Recreate with the new column
CREATE POLICY "Users can update their own posts"
ON posts
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
