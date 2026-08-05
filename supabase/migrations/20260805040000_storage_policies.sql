create policy "pengguna unggah dokumen identitas sendiri" on storage.objects
    for insert to authenticated
    with check (
        bucket_id = 'identity-documents'
        and (storage.foldername(name))[1] = (select auth.uid())::text
    );

create policy "pengguna baca dokumen identitas sendiri" on storage.objects
    for select to authenticated
    using (
        bucket_id = 'identity-documents'
        and (storage.foldername(name))[1] = (select auth.uid())::text
    );

create policy "pengguna ganti dokumen identitas sendiri" on storage.objects
    for update to authenticated
    using (
        bucket_id = 'identity-documents'
        and (storage.foldername(name))[1] = (select auth.uid())::text
    )
    with check (
        bucket_id = 'identity-documents'
        and (storage.foldername(name))[1] = (select auth.uid())::text
    );

create policy "pengguna hapus dokumen identitas sendiri" on storage.objects
    for delete to authenticated
    using (
        bucket_id = 'identity-documents'
        and (storage.foldername(name))[1] = (select auth.uid())::text
    );

create policy "admin baca semua dokumen identitas" on storage.objects
    for select to authenticated
    using (bucket_id = 'identity-documents' and public.is_admin());
