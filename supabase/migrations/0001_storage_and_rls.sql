-- Storage is split by sensitivity. Listing media may be public; owner documents never are.
insert into storage.buckets (id, name, public)
values
  ('property-media', 'property-media', true),
  ('property-documents', 'property-documents', false),
  ('property-submission-media', 'property-submission-media', false),
  ('profile-avatars', 'profile-avatars', true),
  ('blog-draft-media', 'blog-draft-media', false),
  ('blog-media', 'blog-media', true)
on conflict (id) do update set public = excluded.public;

-- Application tables are accessed through server-side Prisma/DAL code.
alter table if exists public."Profile" enable row level security;
alter table if exists public."PropertySubmission" enable row level security;
alter table if exists public."Property" enable row level security;
alter table if exists public."PropertyMedia" enable row level security;
alter table if exists public."PropertyDocument" enable row level security;
alter table if exists public."PropertySubmissionMedia" enable row level security;
alter table if exists public."Locality" enable row level security;
alter table if exists public."Enquiry" enable row level security;
alter table if exists public."EnquiryActivity" enable row level security;
alter table if exists public."Notification" enable row level security;
alter table if exists public."AuditLog" enable row level security;
alter table if exists public."SiteSetting" enable row level security;

drop policy if exists "Public can read listing media" on storage.objects;
create policy "Public can read listing media"
  on storage.objects for select
  using (bucket_id = 'property-media');

drop policy if exists "Service role manages listing media" on storage.objects;
create policy "Service role manages listing media"
  on storage.objects for all
  to service_role
  using (bucket_id = 'property-media')
  with check (bucket_id = 'property-media');

drop policy if exists "Service role manages private documents" on storage.objects;
create policy "Service role manages private documents"
  on storage.objects for all
  to service_role
  using (bucket_id = 'property-documents')
   with check (bucket_id = 'property-documents');

drop policy if exists "Service role manages private submission media" on storage.objects;
create policy "Service role manages private submission media"
  on storage.objects for all
  to service_role
  using (bucket_id = 'property-submission-media')
  with check (bucket_id = 'property-submission-media');

drop policy if exists "Public can read profile avatars" on storage.objects;
create policy "Public can read profile avatars"
  on storage.objects for select
  using (bucket_id = 'profile-avatars');

drop policy if exists "Service role manages profile avatars" on storage.objects;
create policy "Service role manages profile avatars"
  on storage.objects for all
  to service_role
  using (bucket_id = 'profile-avatars')
  with check (bucket_id = 'profile-avatars');

drop policy if exists "Service role manages blog draft media" on storage.objects;
create policy "Service role manages blog draft media"
  on storage.objects for all
  to service_role
  using (bucket_id = 'blog-draft-media')
  with check (bucket_id = 'blog-draft-media');

drop policy if exists "Public can read published blog media" on storage.objects;
create policy "Public can read published blog media"
  on storage.objects for select
  using (bucket_id = 'blog-media');

drop policy if exists "Service role manages published blog media" on storage.objects;
create policy "Service role manages published blog media"
  on storage.objects for all
  to service_role
  using (bucket_id = 'blog-media')
  with check (bucket_id = 'blog-media');
