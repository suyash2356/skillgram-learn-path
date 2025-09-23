-- Add fields to roadmap_steps
ALTER TABLE public.roadmap_steps
ADD COLUMN IF NOT EXISTS due_date DATE,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Resources per step
CREATE TABLE IF NOT EXISTS public.roadmap_step_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  step_id UUID NOT NULL REFERENCES public.roadmap_steps(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT,
  type TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.roadmap_step_resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Resources are viewable when step's roadmap is viewable"
ON public.roadmap_step_resources FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.roadmap_steps s
    JOIN public.roadmaps r ON r.id = s.roadmap_id
    WHERE s.id = step_id AND (auth.uid() = r.user_id OR r.is_public = true)
  )
);

CREATE POLICY "Owner can insert resources"
ON public.roadmap_step_resources FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.roadmap_steps s
    JOIN public.roadmaps r ON r.id = s.roadmap_id
    WHERE s.id = step_id AND auth.uid() = r.user_id
  )
);

CREATE POLICY "Owner can update resources"
ON public.roadmap_step_resources FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.roadmap_steps s
    JOIN public.roadmaps r ON r.id = s.roadmap_id
    WHERE s.id = step_id AND auth.uid() = r.user_id
  )
);

CREATE POLICY "Owner can delete resources"
ON public.roadmap_step_resources FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.roadmap_steps s
    JOIN public.roadmaps r ON r.id = s.roadmap_id
    WHERE s.id = step_id AND auth.uid() = r.user_id
  )
);

