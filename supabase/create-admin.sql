do $$
declare
    admin_email text := 'admin@bagirasa.test';
    admin_password text := 'BagiRasaAdmin123';
    new_user_id uuid;
begin
    if exists (select 1 from auth.users where email = admin_email) then
        raise notice 'Akun admin sudah ada, tidak ada yang diubah.';
        return;
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
        admin_email,
        crypt(admin_password, gen_salt('bf')),
        now(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        '{"role":"admin"}'::jsonb,
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
            'email', admin_email,
            'email_verified', true
        ),
        now(),
        now(),
        now()
    );

    update public.profiles
    set verification_status = 'verified'
    where id = new_user_id;
end;
$$;
