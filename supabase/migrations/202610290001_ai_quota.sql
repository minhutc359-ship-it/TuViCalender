-- Atomic per-user quota, shared across Edge Function instances.
create table if not exists public.ai_request_limits (
  user_id uuid not null references auth.users(id) on delete cascade,
  quota_day date not null,
  request_count integer not null default 0,
  last_request_at timestamptz not null default now(),
  primary key (user_id, quota_day)
);
alter table public.ai_request_limits enable row level security;
revoke all on public.ai_request_limits from anon, authenticated;

create or replace function public.consume_ai_quota(p_user_id uuid)
returns boolean language plpgsql security definer set search_path = '' as $$
declare consumed integer;
begin
  insert into public.ai_request_limits (user_id, quota_day, request_count, last_request_at)
  values (p_user_id, (now() at time zone 'Asia/Ho_Chi_Minh')::date, 1, now())
  on conflict (user_id, quota_day) do update
    set request_count = public.ai_request_limits.request_count + 1, last_request_at = now()
    where public.ai_request_limits.request_count < 20
      and public.ai_request_limits.last_request_at <= now() - interval '3 seconds'
  returning request_count into consumed;
  delete from public.ai_request_limits where user_id = p_user_id and quota_day < current_date - 30;
  return consumed is not null;
end;
$$;
revoke all on function public.consume_ai_quota(uuid) from public, anon, authenticated;
grant execute on function public.consume_ai_quota(uuid) to service_role;
