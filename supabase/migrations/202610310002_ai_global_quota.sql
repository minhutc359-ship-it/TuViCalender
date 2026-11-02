-- Add a publisher-controlled global daily ceiling to the existing per-user quota.
create table if not exists public.ai_global_request_limits (
  quota_day date primary key,
  request_count integer not null default 0,
  updated_at timestamptz not null default now()
);
alter table public.ai_global_request_limits enable row level security;
revoke all on public.ai_global_request_limits from anon, authenticated;

create or replace function public.consume_ai_quota(
  p_user_id uuid,
  p_global_limit integer
)
returns boolean language plpgsql security definer set search_path = '' as $$
declare
  quota_date date := (now() at time zone 'Asia/Ho_Chi_Minh')::date;
  user_consumed integer;
  global_consumed integer;
begin
  if p_global_limit < 1 or p_global_limit > 100000 then
    return false;
  end if;

  insert into public.ai_request_limits (user_id, quota_day, request_count, last_request_at)
  values (p_user_id, quota_date, 1, now())
  on conflict (user_id, quota_day) do update
    set request_count = public.ai_request_limits.request_count + 1,
        last_request_at = now()
    where public.ai_request_limits.request_count < 20
      and public.ai_request_limits.last_request_at <= now() - interval '3 seconds'
  returning request_count into user_consumed;
  if user_consumed is null then return false; end if;

  insert into public.ai_global_request_limits (quota_day, request_count, updated_at)
  values (quota_date, 1, now())
  on conflict (quota_day) do update
    set request_count = public.ai_global_request_limits.request_count + 1,
        updated_at = now()
    where public.ai_global_request_limits.request_count < p_global_limit
  returning request_count into global_consumed;

  if global_consumed is null then
    update public.ai_request_limits
      set request_count = greatest(0, request_count - 1)
      where user_id = p_user_id and quota_day = quota_date;
    return false;
  end if;

  delete from public.ai_request_limits where quota_day < quota_date - 30;
  delete from public.ai_global_request_limits where quota_day < quota_date - 30;
  return true;
end;
$$;
revoke all on function public.consume_ai_quota(uuid, integer) from public, anon, authenticated;
grant execute on function public.consume_ai_quota(uuid, integer) to service_role;
