create type user_role as enum ('donor', 'recipient', 'admin');
create type recipient_type as enum ('panti_asuhan', 'rumah_lansia');
create type verification_status as enum ('pending', 'verified', 'rejected');
create type donation_status as enum ('draft', 'available', 'matched', 'completed', 'cancelled');
create type match_status as enum ('pending', 'accepted', 'rejected', 'confirmed', 'completed');
create type food_type as enum ('makanan_berat', 'makanan_ringan', 'minuman', 'roti_kue', 'buah_sayur', 'lainnya');

create table profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    role user_role not null,
    verification_status verification_status not null default 'pending',
    email text not null,
    phone text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table donors (
    id uuid primary key default gen_random_uuid(),
    profile_id uuid not null unique references profiles(id) on delete cascade,
    name text not null,
    address text not null,
    lat numeric(9,6) not null,
    lng numeric(9,6) not null,
    phone text not null,
    photo_url text,
    ktp_url text not null,
    reputation_score numeric(3,2) not null default 0,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table recipients (
    id uuid primary key default gen_random_uuid(),
    profile_id uuid not null unique references profiles(id) on delete cascade,
    type recipient_type not null,
    name text not null,
    address text not null,
    lat numeric(9,6) not null,
    lng numeric(9,6) not null,
    phone text not null,
    capacity int not null,
    current_need int not null default 0,
    allergen_restrictions text[] not null default '{}',
    halal_only boolean not null default true,
    photo_url text,
    legal_doc_url text not null,
    last_received_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table food_donations (
    id uuid primary key default gen_random_uuid(),
    donor_id uuid not null references donors(id) on delete cascade,
    status donation_status not null default 'draft',
    selection_mode text not null default 'auto',
    notes text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table food_items (
    id uuid primary key default gen_random_uuid(),
    donation_id uuid not null references food_donations(id) on delete cascade,
    name text not null,
    photo_url text,
    food_type food_type not null,
    shelf_life_hours int not null,
    is_halal boolean not null default true,
    ingredients text not null,
    allergens text[] not null default '{}',
    quantity int not null,
    unit text not null default 'porsi',
    servings int not null,
    created_at timestamptz not null default now()
);

create table donation_matches (
    id uuid primary key default gen_random_uuid(),
    donation_id uuid not null references food_donations(id) on delete cascade,
    recipient_id uuid not null references recipients(id) on delete cascade,
    status match_status not null default 'pending',
    allocated_servings int not null,
    distance_km numeric(6,2) not null,
    match_score numeric(5,4),
    notified_at timestamptz,
    responded_at timestamptz,
    handed_over_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table feedbacks (
    id uuid primary key default gen_random_uuid(),
    match_id uuid not null unique references donation_matches(id) on delete cascade,
    recipient_id uuid not null references recipients(id) on delete cascade,
    donor_id uuid not null references donors(id) on delete cascade,
    rating int not null check (rating between 1 and 5),
    comment text,
    created_at timestamptz not null default now()
);

create table notifications (
    id uuid primary key default gen_random_uuid(),
    profile_id uuid not null references profiles(id) on delete cascade,
    title text not null,
    body text not null,
    type text not null,
    reference_id uuid,
    is_read boolean not null default false,
    created_at timestamptz not null default now()
);

create table wa_logs (
    id uuid primary key default gen_random_uuid(),
    match_id uuid references donation_matches(id) on delete set null,
    target_phone text not null,
    message text not null,
    status text not null,
    provider_response jsonb,
    created_at timestamptz not null default now()
);

create table waste_insights (
    id uuid primary key default gen_random_uuid(),
    donor_id uuid not null references donors(id) on delete cascade,
    period_start date not null,
    period_end date not null,
    summary text not null,
    impact jsonb not null,
    recommendations jsonb not null,
    generated_at timestamptz not null default now()
);

create index idx_donors_location on donors (lat, lng);
create index idx_recipients_location on recipients (lat, lng);
create index idx_recipients_type on recipients (type);
create index idx_donations_donor on food_donations (donor_id);
create index idx_donations_status on food_donations (status);
create index idx_items_donation on food_items (donation_id);
create index idx_matches_donation on donation_matches (donation_id);
create index idx_matches_recipient on donation_matches (recipient_id);
create index idx_matches_status on donation_matches (status);
create index idx_notifications_profile on notifications (profile_id, is_read);

create index idx_feedbacks_donor on feedbacks (donor_id);
create index idx_waste_insights_donor on waste_insights (donor_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

create trigger trg_profiles_updated before update on profiles
    for each row execute function public.set_updated_at();

create trigger trg_donors_updated before update on donors
    for each row execute function public.set_updated_at();

create trigger trg_recipients_updated before update on recipients
    for each row execute function public.set_updated_at();

create trigger trg_donations_updated before update on food_donations
    for each row execute function public.set_updated_at();

create trigger trg_matches_updated before update on donation_matches
    for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
    requested_role public.user_role;
begin
    if new.raw_user_meta_data ->> 'role' is null then
        raise exception 'Signup ditolak: metadata "role" wajib diisi (donor, recipient, atau admin)';
    end if;

    requested_role := (new.raw_user_meta_data ->> 'role')::public.user_role;

    insert into public.profiles (id, email, role)
    values (new.id, new.email, requested_role);

    return new;
end;
$$;

create trigger trg_on_auth_user_created after insert on auth.users
    for each row execute function public.handle_new_user();
