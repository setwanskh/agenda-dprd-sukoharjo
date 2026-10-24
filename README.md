# Agenda Hari Ini – DPRD Kabupaten Sukoharjo

Papan agenda digital untuk TV kantor + dashboard admin. React + TypeScript + Vite, database Supabase, hosting Vercel.

**Status pengerjaan**
- [x] Tahap 1: fondasi, database + keamanan (RLS), login admin, fungsi waktu WIB
- [x] Tahap 2: halaman display (header, logo, agenda, status otomatis, QR, pengaduan, realtime)
- [x] Tahap 3: dashboard admin (agenda, master jenis dan ruang, pengaturan: logo, tema, status, survei, pengaduan, kata sandi)

## 1. Persiapan Supabase
1. Daftar di supabase.com, klik **New project** (pilih region Singapore).
2. Buka **SQL Editor > New query**, tempel seluruh isi `supabase/migrations/001_init.sql`, klik **Run**.
3. Buka **Authentication > Providers > Email**, matikan **Allow new users to sign up** (agar orang lain tidak bisa mendaftar).
4. Buka **Authentication > Users > Add user**, buat akun admin (email + kata sandi kuat), centang auto confirm.
5. Daftarkan admin: di SQL Editor jalankan (ganti emailnya):
   ```sql
   insert into public.admin_users (user_id)
   select id from auth.users where email = 'email-admin@contoh.go.id';
   ```
6. Buka **Project Settings > API**, salin **Project URL** dan **anon / publishable key**.
   Jangan pernah memakai `service_role` key di aplikasi ini.

## 2. Jalankan di komputer
```bash
npm install
cp .env.example .env     # isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY
npm run dev              # buka http://localhost:5173  (display) dan /admin
```

## 3. Unggah ke GitHub
Buat repository baru di github.com, lalu:
```bash
git init && git add . && git commit -m "Tahap 1"
git branch -M main
git remote add origin https://github.com/NAMA-ANDA/agenda-dprd-sukoharjo.git
git push -u origin main
```
File `.env` sudah dikecualikan oleh `.gitignore`, jadi kunci tidak ikut terunggah.

## 4. Deploy ke Vercel
1. vercel.com > **Add New > Project** > pilih repository tadi.
2. Di **Environment Variables** isi `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY`.
3. Klik **Deploy**. TV membuka alamat utama; admin di `/admin`.

## 5. Pengujian
```bash
npm test          # tes jam WIB, pergantian tanggal, status, urutan
npm run build     # build produksi
```
Tes manual keamanan: buka situs tanpa login lalu coba `/admin`; harus tampil form login, bukan data admin.

## Catatan keamanan
- Pengunjung hanya bisa **membaca** data display. Ubah/hapus hanya untuk akun di `admin_users` (dipaksa oleh RLS database, bukan hanya oleh tampilan).
- Bucket logo: tulis hanya admin, maks 2 MB, PNG/JPG/WebP.

## Panduan admin singkat
Buka `/admin`, login, lalu pakai menu: **Kelola Agenda** (tambah, ubah, hapus, cari, filter Hari ini/Mendatang/Riwayat, salin dari tanggal lain),
**Master Jenis Kegiatan** dan **Master Ruang dan Tempat** (tambah, ganti nama, aktif/nonaktif, hapus), serta **Pengaturan** (nama instansi, tema, logo, status, survei, pengaduan, kata sandi).
Perubahan agenda dan pengaturan muncul di display otomatis tanpa reload. Hapus berlaku dua klik untuk mencegah salah hapus.

## Laporan tahunan
Menu **Laporan Tahunan**: pilih tahun, klik **Unduh laporan** (Excel: lembar Ringkasan dan Daftar Agenda).
Setelah laporan terunduh, muncul bagian penghapusan: centang konfirmasi dan ketik `HAPUS <tahun>`. Yang dihapus hanya agenda yang ada di laporan tersebut.
Penghapusan permanen; simpan file laporan sebelum menghapus.
