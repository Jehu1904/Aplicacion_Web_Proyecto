drop policy if exists "Users upload their avatars" on storage.objects;
drop policy if exists "Users update their avatars" on storage.objects;
drop policy if exists "Users delete their avatars" on storage.objects;

create policy "Users manage their avatars" on storage.objects
  for all to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);