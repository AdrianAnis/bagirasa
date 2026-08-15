do $$
declare
    demo_password text := crypt('BagiRasa123', gen_salt('bf'));
    new_user_id uuid;
    demo_donor record;
begin
    for demo_donor in
        select *
        from (
            values
                (
                    'restoran@bagirasa.test',
                    'Warteg Bahari',
                    'Jalan Pandanaran No. 30, Pekunden, Semarang Tengah, Kota Semarang',
                    -6.989800::numeric,
                    110.417500::numeric,
                    '08122000001',
                    'verified'::public.verification_status
                ),
                (
                    'restoran.baru@bagirasa.test',
                    'Rumah Makan Sederhana',
                    'Jalan MT Haryono No. 88, Karangturi, Semarang Timur, Kota Semarang',
                    -6.982400::numeric,
                    110.432900::numeric,
                    '08122000002',
                    'pending'::public.verification_status
                )
        ) as t(email, name, address, lat, lng, phone, status)
    loop
        if exists (select 1 from auth.users where email = demo_donor.email) then
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
            demo_donor.email,
            demo_password,
            now(),
            '{"provider":"email","providers":["email"]}'::jsonb,
            '{"role":"donor"}'::jsonb,
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
                'email', demo_donor.email,
                'email_verified', true
            ),
            now(),
            now(),
            now()
        );

        update public.profiles
        set verification_status = demo_donor.status,
            phone = demo_donor.phone
        where id = new_user_id;

        insert into public.donors (
            profile_id, name, address, lat, lng, phone, ktp_url
        )
        values (
            new_user_id,
            demo_donor.name,
            demo_donor.address,
            demo_donor.lat,
            demo_donor.lng,
            demo_donor.phone,
            new_user_id || '/ktp-demo.jpg'
        );
    end loop;

    update public.recipients r
    set current_need = case r.name
        when 'Panti Asuhan Harapan Bunda' then 35
        when 'Rumah Lansia Sejahtera' then 20
        when 'Panti Asuhan Kasih Ibu' then 50
        when 'Rumah Lansia Bahagia' then 12
        when 'Panti Asuhan Tunas Bangsa' then 40
        else r.current_need
    end
    where r.name in (
        'Panti Asuhan Harapan Bunda',
        'Rumah Lansia Sejahtera',
        'Panti Asuhan Kasih Ibu',
        'Rumah Lansia Bahagia',
        'Panti Asuhan Tunas Bangsa'
    );
end;
$$;
