alter table public.roadmaps
add column is_public boolean default false;

-- RLS Policy: Allow authenticated users to view their own roadmaps
create policy "Users can view own roadmaps" on public.roadmaps
for select to authenticated using (auth.uid() = user_id);

-- RLS Policy: Allow public to view public roadmaps
create policy "Public can view public roadmaps" on public.roadmaps
for select to public using (is_public = true);

-- RLS Policy: Allow authenticated users to insert roadmaps (default to private)
create policy "Users can insert roadmaps" on public.roadmaps
for insert to authenticated with check (auth.uid() = user_id);

-- RLS Policy: Allow authenticated users to update their own roadmaps
create policy "Users can update own roadmaps" on public.roadmaps
for update to authenticated using (auth.uid() = user_id);

-- RLS Policy: Allow authenticated users to delete their own roadmaps
create policy "Users can delete own roadmaps" on public.roadmaps
for delete to authenticated using (auth.uid() = user_id);

