-- Saved Posts Collections System
CREATE TABLE IF NOT EXISTS public.saved_posts_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#3B82F6', -- Hex color for collection
  is_default BOOLEAN DEFAULT false, -- For "All" collection
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE (user_id, name)
);

CREATE TABLE IF NOT EXISTS public.saved_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  collection_id UUID REFERENCES public.saved_posts_collections(id) ON DELETE SET NULL,
  notes TEXT, -- User's personal notes about the saved post
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE (user_id, post_id) -- User can only save a post once
);

ALTER TABLE public.saved_posts_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_posts ENABLE ROW LEVEL SECURITY;

-- Policies for collections
CREATE POLICY "Users can view own collections"
ON public.saved_posts_collections FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own collections"
ON public.saved_posts_collections FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own collections"
ON public.saved_posts_collections FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own collections"
ON public.saved_posts_collections FOR DELETE USING (auth.uid() = user_id);

-- Policies for saved posts
CREATE POLICY "Users can view own saved posts"
ON public.saved_posts FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved posts"
ON public.saved_posts FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own saved posts"
ON public.saved_posts FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved posts"
ON public.saved_posts FOR DELETE USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_saved_posts_collections_updated_at
  BEFORE UPDATE ON public.saved_posts_collections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to create default collection for new users
CREATE OR REPLACE FUNCTION public.create_default_collection()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.saved_posts_collections (user_id, name, is_default)
  VALUES (NEW.user_id, 'All', true);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to create default collection when user saves first post
CREATE TRIGGER create_default_collection_trigger
  AFTER INSERT ON public.saved_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.create_default_collection();
