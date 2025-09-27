-- Extended User Profile Details
CREATE TABLE IF NOT EXISTS public.user_profile_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Extended Profile Information
  bio TEXT,
  location TEXT,
  join_date TEXT,
  portfolio_url TEXT,
  
  -- Professional Information
  job_title TEXT,
  company TEXT,
  experience_level TEXT CHECK (experience_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  
  -- Social Links (stored as JSONB for flexibility)
  social_links JSONB DEFAULT '[]'::jsonb,
  
  -- Skills and Expertise
  skills JSONB DEFAULT '[]'::jsonb, -- Array of {name, category, level}
  achievements JSONB DEFAULT '[]'::jsonb, -- Array of {name, description, icon, date}
  
  -- Learning Journey
  learning_path JSONB DEFAULT '[]'::jsonb, -- Array of {skill, progress, totalLessons, currentLesson}
  
  -- Statistics (computed fields)
  total_posts INTEGER DEFAULT 0,
  total_roadmaps INTEGER DEFAULT 0,
  total_likes_received INTEGER DEFAULT 0,
  total_comments_received INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.user_profile_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profile details are viewable by everyone"
ON public.user_profile_details FOR SELECT USING (true);

CREATE POLICY "Users can insert own profile details"
ON public.user_profile_details FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile details"
ON public.user_profile_details FOR UPDATE USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_user_profile_details_updated_at
  BEFORE UPDATE ON public.user_profile_details
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
