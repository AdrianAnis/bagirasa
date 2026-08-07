create or replace function public.verified_recipients()
returns table (
    id uuid,
    name text,
    lat numeric,
    lng numeric,
    capacity int,
    current_need int,
    allergen_restrictions text[],
    halal_only boolean,
    last_received_at timestamptz
)
language sql
security definer
stable
set search_path = ''
as $$
    select
        r.id,
        r.name,
        r.lat,
        r.lng,
        r.capacity,
        r.current_need,
        r.allergen_restrictions,
        r.halal_only,
        r.last_received_at
    from public.recipients r
    join public.profiles p on p.id = r.profile_id
    where p.verification_status = 'verified'
      and public.current_user_role() = 'donor';
$$;

grant execute on function public.verified_recipients() to authenticated;
