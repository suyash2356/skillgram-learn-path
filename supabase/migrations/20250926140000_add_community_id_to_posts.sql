alter table public.posts
add column community_id uuid references public.communities(id) on delete set null;

-- Optional: Create an index for faster lookups
create index if not exists posts_community_id_idx on public.posts (community_id);

-- Optional: Add RLS policy if needed, e.g., to allow community members to view posts
-- For now, assuming posts are generally visible, but if communities are private,
-- you'd add a policy like:
-- create policy "Community members can view posts" on public.posts
-- for select to authenticated using (community_id IN (select community_id from public.community_members where user_id = auth.uid()));

