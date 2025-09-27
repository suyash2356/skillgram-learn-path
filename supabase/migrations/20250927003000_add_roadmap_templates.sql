-- Roadmap Templates for User Customization
CREATE TABLE IF NOT EXISTS public.roadmap_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  roadmap_id UUID NOT NULL REFERENCES public.roadmaps(id) ON DELETE CASCADE,
  
  -- Template data stored as JSONB for flexibility
  template_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Template metadata
  name TEXT, -- User's custom name for the template
  is_public BOOLEAN DEFAULT false, -- Whether template can be shared
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE (user_id, roadmap_id) -- One template per user per roadmap
);

ALTER TABLE public.roadmap_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own templates"
ON public.roadmap_templates FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view public templates"
ON public.roadmap_templates FOR SELECT USING (is_public = true);

CREATE POLICY "Users can insert own templates"
ON public.roadmap_templates FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own templates"
ON public.roadmap_templates FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own templates"
ON public.roadmap_templates FOR DELETE USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_roadmap_templates_updated_at
  BEFORE UPDATE ON public.roadmap_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
