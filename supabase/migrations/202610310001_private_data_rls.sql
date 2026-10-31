-- Apply after provisioning optional cloud tables. Missing tables are intentionally skipped.
-- A restrictive owner guard remains effective alongside older permissive policies.
do $$
declare target_table text;
begin
  foreach target_table in array array['birth_profiles', 'chat_histories', 'tarot_sessions'] loop
    if to_regclass(format('public.%I', target_table)) is null then
      raise notice 'Cloud table % is absent; provision it before using sync helpers.', target_table;
      continue;
    end if;
    if not exists (
      select 1 from information_schema.columns c
      where c.table_schema = 'public' and c.table_name = target_table
        and c.column_name = 'user_id' and c.udt_name = 'uuid'
    ) then
      raise exception '%.user_id must be UUID before enabling owner-only access.', target_table;
    end if;
    execute format('alter table public.%I enable row level security', target_table);
    execute format('revoke all on public.%I from anon', target_table);
    execute format('grant select, insert, update, delete on public.%I to authenticated', target_table);
    execute format('drop policy if exists astroai_owner_guard on public.%I', target_table);
    execute format('create policy astroai_owner_guard on public.%I as restrictive for all to public using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id)', target_table);
    execute format('drop policy if exists astroai_owner_access on public.%I', target_table);
    execute format('create policy astroai_owner_access on public.%I for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id)', target_table);
  end loop;
end;
$$;
