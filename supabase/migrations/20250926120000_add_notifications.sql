-- Notifications table for in-app notifications
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null default 'general',
  title text not null,
  body text,
  data jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.notifications enable row level security;

-- Allow users to read their own notifications
create policy if not exists "Users can view own notifications"
on public.notifications for select
to authenticated
using (auth.uid() = user_id);

-- Allow users to insert notifications for themselves (app backend can also do this with service role)
create policy if not exists "Users can insert own notifications"
on public.notifications for insert
to authenticated
with check (auth.uid() = user_id);

-- Allow users to update their own notifications (e.g., mark as read)
create policy if not exists "Users can update own notifications"
on public.notifications for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Optional: allow delete own notifications
create policy if not exists "Users can delete own notifications"
on public.notifications for delete
to authenticated
using (auth.uid() = user_id);

-- Helpful index for unread queries
create index if not exists notifications_user_created_idx
on public.notifications (user_id, created_at desc);

create index if not exists notifications_unread_idx
on public.notifications (user_id, read_at);


