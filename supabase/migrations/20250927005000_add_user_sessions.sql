-- User Sessions for Cross-Device Sync
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Session details
  device_name TEXT, -- User-friendly device name like "iPhone 15", "Chrome on MacBook"
  device_type TEXT CHECK (device_type IN ('mobile', 'desktop', 'tablet')),
  browser TEXT,
  os TEXT,
  
  -- Location info
  country TEXT,
  city TEXT,
  timezone TEXT,
  
  -- Session status
  is_active BOOLEAN DEFAULT true,
  last_activity TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Security
  ip_address INET,
  user_agent TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS user_sessions_user_id_idx ON public.user_sessions (user_id);
CREATE INDEX IF NOT EXISTS user_sessions_active_idx ON public.user_sessions (is_active);
CREATE INDEX IF NOT EXISTS user_sessions_last_activity_idx ON public.user_sessions (last_activity);

ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sessions"
ON public.user_sessions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions"
ON public.user_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
ON public.user_sessions FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions"
ON public.user_sessions FOR DELETE USING (auth.uid() = user_id);

-- Function to update last activity
CREATE OR REPLACE FUNCTION public.update_session_activity()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.user_sessions 
  SET last_activity = NOW() 
  WHERE user_id = NEW.user_id AND is_active = true;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to update session activity on user actions
CREATE TRIGGER update_session_activity_trigger
  AFTER INSERT ON public.user_activity
  FOR EACH ROW
  EXECUTE FUNCTION public.update_session_activity();
