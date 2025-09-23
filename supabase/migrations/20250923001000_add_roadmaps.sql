-- Roadmaps and steps
CREATE TABLE IF NOT EXISTS public.roadmaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  difficulty TEXT,
  status TEXT NOT NULL DEFAULT 'not-started',
  progress INTEGER NOT NULL DEFAULT 0,
  estimated_time TEXT,
  technologies TEXT[],
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.roadmaps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Roadmaps are viewable by owner or when public"
ON public.roadmaps FOR SELECT USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can create their own roadmaps"
ON public.roadmaps FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own roadmaps"
ON public.roadmaps FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own roadmaps"
ON public.roadmaps FOR DELETE USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.roadmap_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  roadmap_id UUID NOT NULL REFERENCES public.roadmaps(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  duration TEXT,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.roadmap_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Steps are viewable when roadmap is viewable"
ON public.roadmap_steps FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.roadmaps r
    WHERE r.id = roadmap_id
      AND (auth.uid() = r.user_id OR r.is_public = true)
  )
);

CREATE POLICY "Owner can insert steps"
ON public.roadmap_steps FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.roadmaps r
    WHERE r.id = roadmap_id AND auth.uid() = r.user_id
  )
);

CREATE POLICY "Owner can update steps"
ON public.roadmap_steps FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.roadmaps r
    WHERE r.id = roadmap_id AND auth.uid() = r.user_id
  )
);

CREATE POLICY "Owner can delete steps"
ON public.roadmap_steps FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.roadmaps r
    WHERE r.id = roadmap_id AND auth.uid() = r.user_id
  )
);

-- Triggers to auto-update updated_at
CREATE TRIGGER update_roadmaps_updated_at
  BEFORE UPDATE ON public.roadmaps
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_roadmap_steps_updated_at
  BEFORE UPDATE ON public.roadmap_steps
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();


