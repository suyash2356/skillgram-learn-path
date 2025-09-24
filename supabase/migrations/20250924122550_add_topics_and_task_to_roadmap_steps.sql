-- Add missing columns to roadmap_steps
ALTER TABLE public.roadmap_steps
ADD COLUMN IF NOT EXISTS topics TEXT[],
ADD COLUMN IF NOT EXISTS task TEXT;

-- Nudge PostgREST schema cache to refresh (by changing a comment)
COMMENT ON TABLE public.roadmap_steps IS 'roadmap_steps with topics and task columns';
