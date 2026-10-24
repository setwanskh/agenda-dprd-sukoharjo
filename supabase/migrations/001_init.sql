-- Agenda Hari Ini DPRD Kab. Sukoharjo - migrasi awal (aman dijalankan ulang)
-- Jalankan di Supabase: SQL Editor > New query > tempel > Run.

create extension if not exists pgcrypto;

-- Daftar admin. Login saja TIDAK cukup; user_id harus ada di tabel ini.
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admin_users where user_id = auth.uid());
$$;

create table if not exists public.activity_types (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  active boolean not null default true,
  sort int not null default 0
);
create table if not exists public.meeting_rooms (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  active boolean not null default true,
  sort int not null default 0
);

-- Nama jenis & ruang disalin ke agenda (teks) agar riwayat tetap benar
-- walaupun master dihapus atau dinonaktifkan.
create table if not exists public.agendas (
  id uuid primary key default gen_random_uuid(),
  agenda_date date not null,            -- tanggal kalender WIB (bukan timestamp UTC)
  activity_type text not null,
  title text not null,
  detail text,
  origin text,
  start_time time not null,             -- jam dinding WIB
  end_time time,
  room_name text,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_time is null or end_time > start_time)
);
create index if not exists agendas_date_idx on public.agendas (agenda_date, start_time);

-- Satu baris pengaturan (tema, logo, survei, pengaduan, status, nama instansi)
create table if not exists public.app_settings (
  id int primary key default 1 check (id = 1),
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
drop trigger if exists agendas_touch on public.agendas;
create trigger agendas_touch before update on public.agendas for each row execute function public.touch_updated_at();
drop trigger if exists settings_touch on public.app_settings;
create trigger settings_touch before update on public.app_settings for each row execute function public.touch_updated_at();

-- ===== Row Level Security =====
alter table public.admin_users   enable row level security;
alter table public.activity_types enable row level security;
alter table public.meeting_rooms  enable row level security;
alter table public.agendas        enable row level security;
alter table public.app_settings   enable row level security;

-- admin_users: pengguna hanya bisa melihat barisnya sendiri; tidak ada policy tulis dari aplikasi.
drop policy if exists admin_self_read on public.admin_users;
create policy admin_self_read on public.admin_users for select to authenticated using (user_id = auth.uid());

-- Data display: publik boleh baca. Hanya admin boleh ubah.
do $$
declare t text;
begin
  foreach t in array array['activity_types','meeting_rooms','agendas','app_settings'] loop
    execute format('drop policy if exists %I on public.%I', t||'_read', t);
    execute format('create policy %I on public.%I for select to anon, authenticated using (true)', t||'_read', t);
    execute format('drop policy if exists %I on public.%I', t||'_write', t);
    execute format('create policy %I on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())', t||'_write', t);
  end loop;
end $$;

-- ===== Penyimpanan logo (bucket publik, tulis hanya admin, maks 2 MB, PNG/JPG/WebP) =====
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('logos', 'logos', true, 2097152, array['image/png','image/jpeg','image/webp'])
on conflict (id) do update set file_size_limit = 2097152, allowed_mime_types = array['image/png','image/jpeg','image/webp'];

drop policy if exists logos_read on storage.objects;
create policy logos_read on storage.objects for select to anon, authenticated using (bucket_id = 'logos');
drop policy if exists logos_write on storage.objects;
create policy logos_write on storage.objects for all to authenticated
  using (bucket_id = 'logos' and public.is_admin()) with check (bucket_id = 'logos' and public.is_admin());

-- ===== Realtime: display menerima perubahan tanpa reload =====
do $$ begin
  begin alter publication supabase_realtime add table public.agendas; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.app_settings; exception when duplicate_object then null; end;
end $$;

-- ===== Data awal (hanya contoh master; tidak ada agenda, kontak, atau URL karangan) =====
insert into public.activity_types (name, sort) values
 ('Rapat',1),('Penerimaan Tamu',2),('Kunjungan Kerja',3),('Audiensi',4),('Rapat Paripurna',5),
 ('Rapat Komisi',6),('Rapat Pimpinan',7),('Sosialisasi',8),('Kegiatan Internal',9),('Kegiatan Lainnya',10)
on conflict (name) do nothing;
insert into public.meeting_rooms (name, sort) values
 ('Ruang Rapat Paripurna',1),('Ruang Rapat Komisi A',2),('Ruang Rapat Komisi B',3),('Ruang Rapat Komisi C',4),
 ('Ruang Rapat Komisi D',5),('Ruang Rapat Komisi E',6),('Ruang Pimpinan',7),('Ruang Tamu',8),('Aula',9),('Halaman Kantor',10)
on conflict (name) do nothing;
insert into public.app_settings (id, data) values (1, jsonb_build_object(
  'org','DPRD KABUPATEN SUKOHARJO','theme','mhe','duration',60,
  'show', jsonb_build_object('akan_datang',true,'berlangsung',true,'selesai',true,'showDone',true),
  'surveyTitle','SURVEI KEPUASAN PELAYANAN TAHUN 2026','surveyOn',true,'surveyUrl',''
)) on conflict (id) do nothing;
