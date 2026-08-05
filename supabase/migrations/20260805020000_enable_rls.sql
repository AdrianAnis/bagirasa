create or replace function public.current_user_role()
returns public.user_role
language sql
security definer
stable
set search_path = ''
as $$
    select role from public.profiles where id = (select auth.uid());
$$;

create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
    select exists (
        select 1 from public.profiles
        where id = (select auth.uid()) and role = 'admin'
    );
$$;

create or replace function public.current_donor_id()
returns uuid
language sql
security definer
stable
set search_path = ''
as $$
    select id from public.donors where profile_id = (select auth.uid());
$$;

create or replace function public.current_recipient_id()
returns uuid
language sql
security definer
stable
set search_path = ''
as $$
    select id from public.recipients where profile_id = (select auth.uid());
$$;

create or replace function public.owns_donation(target_donation_id uuid)
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
    select exists (
        select 1
        from public.food_donations fd
        join public.donors d on d.id = fd.donor_id
        where fd.id = target_donation_id
          and d.profile_id = (select auth.uid())
    );
$$;

create or replace function public.is_matched_recipient(target_donation_id uuid)
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
    select exists (
        select 1
        from public.donation_matches m
        join public.recipients r on r.id = m.recipient_id
        where m.donation_id = target_donation_id
          and r.profile_id = (select auth.uid())
    );
$$;

alter table profiles enable row level security;
alter table donors enable row level security;
alter table recipients enable row level security;
alter table food_donations enable row level security;
alter table food_items enable row level security;
alter table donation_matches enable row level security;
alter table feedbacks enable row level security;
alter table notifications enable row level security;
alter table wa_logs enable row level security;
alter table waste_insights enable row level security;

revoke update on public.profiles from authenticated;
grant update (email, phone) on public.profiles to authenticated;

revoke update on public.donors from authenticated;
grant update (name, address, lat, lng, phone, photo_url, ktp_url) on public.donors to authenticated;

revoke update on public.recipients from authenticated;
grant update (
    "type", name, address, lat, lng, phone, capacity, current_need,
    allergen_restrictions, halal_only, photo_url, legal_doc_url
) on public.recipients to authenticated;

revoke update on public.donation_matches from authenticated;
grant update (status, responded_at, handed_over_at) on public.donation_matches to authenticated;

revoke update on public.notifications from authenticated;
grant update (is_read) on public.notifications to authenticated;

create policy "pengguna baca profil sendiri" on profiles
    for select to authenticated
    using ((select auth.uid()) = id);

create policy "pengguna ubah profil sendiri" on profiles
    for update to authenticated
    using ((select auth.uid()) = id)
    with check ((select auth.uid()) = id);

create policy "admin baca semua profil" on profiles
    for select to authenticated
    using (public.is_admin());

create policy "donor kelola data sendiri" on donors
    for all to authenticated
    using ((select auth.uid()) = profile_id and public.current_user_role() = 'donor')
    with check ((select auth.uid()) = profile_id and public.current_user_role() = 'donor');

create policy "penerima baca data donor" on donors
    for select to authenticated
    using (public.current_user_role() = 'recipient');

create policy "admin baca semua donor" on donors
    for select to authenticated
    using (public.is_admin());

create policy "penerima kelola data sendiri" on recipients
    for all to authenticated
    using ((select auth.uid()) = profile_id and public.current_user_role() = 'recipient')
    with check ((select auth.uid()) = profile_id and public.current_user_role() = 'recipient');

create policy "donor baca kandidat penerima" on recipients
    for select to authenticated
    using (public.current_user_role() = 'donor');

create policy "admin baca semua penerima" on recipients
    for select to authenticated
    using (public.is_admin());

create policy "donor kelola donasi sendiri" on food_donations
    for all to authenticated
    using (donor_id = public.current_donor_id())
    with check (donor_id = public.current_donor_id());

create policy "penerima baca donasi teralokasi" on food_donations
    for select to authenticated
    using (public.is_matched_recipient(id));

create policy "admin baca semua donasi" on food_donations
    for select to authenticated
    using (public.is_admin());

create policy "donor kelola item donasi sendiri" on food_items
    for all to authenticated
    using (public.owns_donation(donation_id))
    with check (public.owns_donation(donation_id));

create policy "penerima baca item donasi teralokasi" on food_items
    for select to authenticated
    using (public.is_matched_recipient(donation_id));

create policy "admin baca semua item donasi" on food_items
    for select to authenticated
    using (public.is_admin());

create policy "donor baca match donasinya" on donation_matches
    for select to authenticated
    using (public.owns_donation(donation_id));

create policy "donor buat match donasinya" on donation_matches
    for insert to authenticated
    with check (public.owns_donation(donation_id));

create policy "donor ubah match donasinya" on donation_matches
    for update to authenticated
    using (public.owns_donation(donation_id))
    with check (public.owns_donation(donation_id));

create policy "penerima baca match miliknya" on donation_matches
    for select to authenticated
    using (recipient_id = public.current_recipient_id());

create policy "penerima ubah match miliknya" on donation_matches
    for update to authenticated
    using (recipient_id = public.current_recipient_id())
    with check (recipient_id = public.current_recipient_id());

create policy "admin baca semua match" on donation_matches
    for select to authenticated
    using (public.is_admin());

create policy "penerima buat feedback" on feedbacks
    for insert to authenticated
    with check (
        recipient_id = public.current_recipient_id()
        and exists (
            select 1
            from public.donation_matches m
            join public.food_donations fd on fd.id = m.donation_id
            where m.id = match_id
              and m.recipient_id = public.current_recipient_id()
              and fd.donor_id = donor_id
        )
    );

create policy "penerima baca feedback sendiri" on feedbacks
    for select to authenticated
    using (recipient_id = public.current_recipient_id());

create policy "donor baca feedback miliknya" on feedbacks
    for select to authenticated
    using (donor_id = public.current_donor_id());

create policy "admin baca semua feedback" on feedbacks
    for select to authenticated
    using (public.is_admin());

create policy "pengguna baca notifikasi sendiri" on notifications
    for select to authenticated
    using ((select auth.uid()) = profile_id);

create policy "pengguna tandai notifikasi dibaca" on notifications
    for update to authenticated
    using ((select auth.uid()) = profile_id)
    with check ((select auth.uid()) = profile_id);

create policy "admin baca log whatsapp" on wa_logs
    for select to authenticated
    using (public.is_admin());

create policy "donor baca insight miliknya" on waste_insights
    for select to authenticated
    using (donor_id = public.current_donor_id());

create policy "admin baca semua insight" on waste_insights
    for select to authenticated
    using (public.is_admin());
