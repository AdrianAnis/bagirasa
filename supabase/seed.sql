do $$
declare
    seed_password text := crypt('BagiRasa123', gen_salt('bf'));
    new_user_id uuid;
    seed_recipient record;
begin
    for seed_recipient in
        select *
        from (
            values
                (
                    'panti.harapan@bagirasa.test',
                    'Panti Asuhan Harapan Bunda',
                    'panti_asuhan'::public.recipient_type,
                    'Jl. Pandanaran No. 12, Semarang Tengah',
                    -6.986500::numeric,
                    110.415300::numeric,
                    '08111000001',
                    40,
                    35,
                    array['kacang']::text[],
                    true
                ),
                (
                    'lansia.sejahtera@bagirasa.test',
                    'Rumah Lansia Sejahtera',
                    'rumah_lansia'::public.recipient_type,
                    'Jl. Sultan Agung No. 45, Candisari, Semarang',
                    -7.014200::numeric,
                    110.418900::numeric,
                    '08111000002',
                    25,
                    20,
                    array['seafood', 'gluten']::text[],
                    true
                ),
                (
                    'panti.kasih@bagirasa.test',
                    'Panti Asuhan Kasih Ibu',
                    'panti_asuhan'::public.recipient_type,
                    'Jl. Majapahit No. 88, Pedurungan, Semarang',
                    -6.995700::numeric,
                    110.472400::numeric,
                    '08111000003',
                    60,
                    50,
                    array[]::text[],
                    true
                ),
                (
                    'lansia.bahagia@bagirasa.test',
                    'Rumah Lansia Bahagia',
                    'rumah_lansia'::public.recipient_type,
                    'Jl. Setiabudi No. 100, Banyumanik, Semarang',
                    -7.070800::numeric,
                    110.415600::numeric,
                    '08111000004',
                    30,
                    12,
                    array['susu']::text[],
                    false
                ),
                (
                    'panti.jauh@bagirasa.test',
                    'Panti Asuhan Tunas Bangsa',
                    'panti_asuhan'::public.recipient_type,
                    'Jl. Raya Ungaran No. 5, Kabupaten Semarang',
                    -7.221000::numeric,
                    110.462000::numeric,
                    '08111000005',
                    45,
                    40,
                    array[]::text[],
                    true
                )
        ) as t(
            email, name, recipient_type, address, lat, lng,
            phone, capacity, current_need, allergens, halal_only
        )
    loop
        if exists (select 1 from auth.users where email = seed_recipient.email) then
            continue;
        end if;

        new_user_id := gen_random_uuid();

        insert into auth.users (
            id, instance_id, aud, role, email, encrypted_password,
            email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
            created_at, updated_at,
            confirmation_token, recovery_token,
            email_change_token_new, email_change_token_current, email_change,
            phone_change, phone_change_token, reauthentication_token
        )
        values (
            new_user_id,
            '00000000-0000-0000-0000-000000000000',
            'authenticated',
            'authenticated',
            seed_recipient.email,
            seed_password,
            now(),
            '{"provider":"email","providers":["email"]}'::jsonb,
            jsonb_build_object(
                'role', 'recipient',
                'recipient_type', seed_recipient.recipient_type::text
            ),
            now(),
            now(),
            '', '', '', '', '', '', '', ''
        );

        insert into auth.identities (
            id, user_id, provider_id, provider, identity_data,
            created_at, updated_at, last_sign_in_at
        )
        values (
            gen_random_uuid(),
            new_user_id,
            new_user_id::text,
            'email',
            jsonb_build_object(
                'sub', new_user_id::text,
                'email', seed_recipient.email,
                'email_verified', true
            ),
            now(),
            now(),
            now()
        );

        update public.profiles
        set verification_status = 'verified',
            phone = seed_recipient.phone
        where id = new_user_id;

        insert into public.recipients (
            profile_id, type, name, address, lat, lng, phone,
            capacity, current_need, allergen_restrictions, halal_only,
            legal_doc_url, last_received_at
        )
        values (
            new_user_id,
            seed_recipient.recipient_type,
            seed_recipient.name,
            seed_recipient.address,
            seed_recipient.lat,
            seed_recipient.lng,
            seed_recipient.phone,
            seed_recipient.capacity,
            seed_recipient.current_need,
            seed_recipient.allergens,
            seed_recipient.halal_only,
            new_user_id || '/legal-doc-seed.pdf',
            case seed_recipient.email
                when 'panti.harapan@bagirasa.test' then now() - interval '21 days'
                when 'lansia.sejahtera@bagirasa.test' then now() - interval '2 days'
                when 'panti.kasih@bagirasa.test' then now() - interval '10 days'
                when 'lansia.bahagia@bagirasa.test' then now() - interval '45 days'
                else null
            end
        );
    end loop;
end;
$$;
