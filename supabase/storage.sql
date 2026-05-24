-- Run this after schema.sql when you are ready for real footage uploads.
-- It creates a private bucket where each user stores files under their own user ID folder.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'creatorvault-footage',
  'creatorvault-footage',
  false,
  524288000,
  array[
    'video/mp4',
    'video/quicktime',
    'video/webm',
    'image/jpeg',
    'image/png',
    'image/webp',
    'audio/mpeg',
    'audio/mp4',
    'audio/wav'
  ]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Users upload own footage"
on storage.objects
for insert
with check (
  bucket_id = 'creatorvault-footage'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users read own footage"
on storage.objects
for select
using (
  bucket_id = 'creatorvault-footage'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users update own footage"
on storage.objects
for update
using (
  bucket_id = 'creatorvault-footage'
  and auth.uid()::text = (storage.foldername(name))[1]
)
with check (
  bucket_id = 'creatorvault-footage'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users delete own footage"
on storage.objects
for delete
using (
  bucket_id = 'creatorvault-footage'
  and auth.uid()::text = (storage.foldername(name))[1]
);
