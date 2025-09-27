-- User Activity Tracking for Analytics and Personalization
CREATE TABLE IF NOT EXISTS public.user_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Activity details
  activity_type TEXT NOT NULL CHECK (activity_type IN (
    'post_view', 'post_like', 'post_comment', 'post_share',
    'roadmap_view', 'roadmap_step_complete', 'roadmap_share',
    'profile_view', 'search', 'community_join', 'community_leave'
  )),
  
  -- Related entities
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  roadmap_id UUID REFERENCES public.roadmaps(id) ON DELETE CASCADE,
  community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE,
  target_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Additional data
  metadata JSONB DEFAULT '{}'::jsonb, -- Store additional context like search terms, etc.
  
  -- Device and session info
  device_type TEXT, -- 'mobile', 'desktop', 'tablet'
  user_agent TEXT,
  ip_address INET,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS user_activity_user_id_idx ON public.user_activity (user_id);
CREATE INDEX IF NOT EXISTS user_activity_type_idx ON public.user_activity (activity_type);
CREATE INDEX IF NOT EXISTS user_activity_created_at_idx ON public.user_activity (created_at);

ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can view own activity"
ON public.user_activity FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert own activity"
ON public.user_activity FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to clean up old activity data (optional)
CREATE OR REPLACE FUNCTION public.cleanup_old_activity()
RETURNS void AS $$
BEGIN
  DELETE FROM public.user_activity 
  WHERE created_at < NOW() - INTERVAL '1 year';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
