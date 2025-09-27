-- Followers table
create table if not exists public.followers (
  id uuid primary key default gen_random_uuid(),
  follower_id uuid not null references auth.users(id) on delete cascade,
  following_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (follower_id, following_id) -- A user can only follow another user once
);

alter table public.followers enable row level security;

-- Users can follow others
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'followers' 
    AND policyname = 'Users can insert their own follows'
  ) THEN
    CREATE POLICY "Users can insert their own follows"
    ON public.followers FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = follower_id);
  END IF;
END $$;

-- Users can unfollow others
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'followers' 
    AND policyname = 'Users can delete their own follows'
  ) THEN
    CREATE POLICY "Users can delete their own follows"
    ON public.followers FOR DELETE
    TO authenticated
    USING (auth.uid() = follower_id);
  END IF;
END $$;

-- Everyone can see who follows whom (public social graph)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'followers' 
    AND policyname = 'Follows are viewable by everyone'
  ) THEN
    CREATE POLICY "Follows are viewable by everyone"
    ON public.followers FOR SELECT
    USING (true);
  END IF;
END $$;

