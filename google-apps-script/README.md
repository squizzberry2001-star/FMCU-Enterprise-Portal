# Panduan Setup Google Apps Script & Google Drive Database FMCU

Panduan ini menjelaskan cara menghubungkan **FMCU Enterprise Portal** dengan **Google Spreadsheet (sebagai Database)** dan **Google Drive (sebagai Storage File PDF/SOP)** agar perubahan data otomatis sinkron ke seluruh perangkat secara gratis tanpa server database khusus!

---

## 📋 Struktur Tabel Database (5 Sheets Otomatis)

Skrip `Code.gs` secara otomatis akan mengelola 5 sheet tabel:

1. **`tb_apps`** (Master Link Connection)
   - Kolom: `id`, `name`, `shortDesc`, `category`, `categoryLabel`, `url`, `iconName`, `customIconUrl`, `ssoSupported`, `status`, `tags`, `updatedAt`
2. **`tb_courses`** (Pelatihan & Compliance)
   - Kolom: `id`, `title`, `category`, `progress`, `dueDate`, `isMandatory`, `totalModules`, `completedModules`, `estimatedHours`, `status`, `updatedAt`
3. **`tb_events`** (Jadwal & Webinar)
   - Kolom: `id`, `title`, `type`, `trainer`, `date`, `time`, `location`, `isOnline`, `meetingUrl`, `registeredCount`, `maxCapacity`, `updatedAt`
4. **`tb_documents`** (Dokumen SOP & Link GDrive)
   - Kolom: `id`, `title`, `category`, `format`, `size`, `updatedAt`, `downloadUrl`, `gdriveFileId`
5. **`tb_settings`** (Pengaturan Global & Peringatan Banner)
   - Kolom: `key`, `value`, `updatedAt`

---

## 🚀 Langkah 1: Buat Spreadsheet & Pasang Skrip

1. Buka [Google Sheets](https://sheets.new) di browser Anda.
2. Beri nama spreadsheet, misalnya: **`Database FMCU Enterprise Portal`**.
3. Klik menu **Ekstensi (Extensions)** -> pilih **Apps Script**.
4. Hapus seluruh kode bawaan yang ada di editor Apps Script.
5. Buka file [`google-apps-script/Code.gs`](file:///C:/PORTAL%20FMCU/google-apps-script/Code.gs) di repositori ini, salin seluruh kodenya, lalu tempelkan (*paste*) ke editor Apps Script.
6. Simpan project (ikon disket atau `Ctrl + S`).

---

## ⚡ Langkah 2: Inisialisasi Tabel

1. Pada dropdown fungsi di sebelah tombol **Run** (Jalankan), pilih fungsi **`setupDatabase`**.
2. Klik tombol **Run** (Jalankan).
3. Jika muncul pop-up izin (*Authorization Required*):
   - Klik **Review Permissions** -> Pilih akun Google Anda.
   - Klik **Advanced** (Lanjutan) -> Klik **Go to Untitled project (unsafe)**.
   - Klik **Allow** (Izinkan).
4. Cek kembali tab Google Sheets Anda: seluruh 5 sheet tabel (`tb_apps`, `tb_courses`, `tb_events`, dll.) sudah otomatis terbuat dengan header berwarna rapi!

---

## 🌐 Langkah 3: Deploy sebagai Web App API

1. Di editor Apps Script, klik tombol biru **Deploy** (Terapkan) di pojok kanan atas -> pilih **New deployment** (Deployment baru).
2. Klik ikon gerigi (Select type) -> pilih **Web app**.
3. Isi konfigurasi berikut:
   - **Description**: `FMCU Portal Production API`
   - **Execute as**: `Me` (*Akun Google Anda*)
   - **Who has access**: **`Anyone`** (*Siapa saja / anonim - agar portal web Next.js bisa membaca & menulis data*)
4. Klik tombol **Deploy**.
5. Salin **Web App URL** yang muncul (formatnya: `https://script.google.com/macros/s/AKfycb.../exec`).

---

## 🔗 Langkah 4: Sambungkan ke Portal FMCU

1. Buka halaman admin portal Anda di: **`https://fmcu-enterprise-portal.vercel.app/admin`** (atau `http://localhost:3000/admin`).
2. Masukkan PIN Admin: **`FMCU2026`**.
3. Buka tab **Pengaturan & Backup**.
4. Pada bagian **"Integrasi Google Apps Script & Google Drive"**:
   - Tempelkan (*paste*) URL Web App yang tadi Anda salin.
   - Klik tombol **"Tes Koneksi"** (Indikator akan berubah menjadi hijau: `🟢 Terhubung`).
   - Klik tombol **"Sinkronkan Data ke Google Sheets"**.
5. Selesai! Kini seluruh perubahan link sistem, modul, jadwal, dan dokumen tersimpan permanen di Google Sheets & Google Drive dan langsung terlihat sama persis di seluruh laptop maupun HP karyawan!
