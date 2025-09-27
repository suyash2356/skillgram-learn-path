alter table public.comments
add column roadmap_id uuid references public.roadmaps(id) on delete cascade;

