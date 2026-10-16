# FMCU Enterprise Learning Center Portal (One-Gate System)

> **Portal Terpadu Satu Pintu (*One-Gate System*) Pelatihan, Sertifikasi, dan Manajemen Kompetensi Karyawan FMCU.**

---

## 🌟 Fitur Utama

1. **One-Gate Application Hub**
   - Akses terpusat dengan Single Sign-On (SSO) ke platform pelatihan:
     - **Core LMS** (Moodle Enterprise)
     - **Virtual Classroom** (Microsoft Teams / Zoom Live)
     - **Assessment & Exam Center** (Ujian Proctored & Kuis)
     - **E-Certificate & Credential Hub** (Sertifikat Terverifikasi QR)
     - **Digital Library & SOP Repository** (Arsip Panduan Kerja)
     - **Competency & Skill Matrix** (Peta Gap Pelatihan)
   - Filter Kategori & Fitur **Pin Favorit** untuk mempermudah akses harian.
   - Simulasi otentikasi SAML 2.0 / SSO Handshake interaktif.

2. **Personalized Learner Dashboard & Compliance Tracker**
   - Peringatan batas waktu pelatihan wajib (*Compliance Alert*).
   - Indikator jam belajar tahun berjalan (*Learning Hours YTD*).
   - Tracker progres modul pelatihan (*In-Progress vs Completed*).

3. **Event & Training Calendar**
   - Jadwal webinar eksekutif, workshop tatap muka (*offline*), dan ujian kompetensi.
   - Tombol registrasi dan akses langsung ke ruang kelas virtual.

4. **Pusat SOP & Knowledge Base**
   - Filter kategori dokumen (SOP Keselamatan, Panduan Sistem, Slide Presentasi).
   - Unduh dokumen dengan feedback instan.

5. **Universal Enterprise Header & Global Search**
   - Pencarian real-time lintas aplikasi, modul, dan materi.
   - Notifikasi interaktif & kartu profil pengguna lengkap dengan status kepatuhan.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, TypeScript)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Utility**: `clsx`, `tailwind-merge`

---

## 🚀 Menjalankan Proyek Secara Lokal

Pastikan Anda memiliki [Node.js](https://nodejs.org/) (v18+) terinstal.

```bash
# 1. Masuk ke direktori proyek
cd "c:\PORTAL FMCU"

# 2. Instal dependensi (jika belum)
npm install

# 3. Jalankan server pengembangan lokal
npm run dev
```

Buka peramban Anda di [http://localhost:3000](http://localhost:3000) untuk melihat portal.

---

## 📦 Build untuk Produksi

```bash
npm run build
npm start
```

---

## 🔒 Standar Keamanan & Integrasi Korporat

- **Autentikasi**: Terintegrasi protokol SSO Enterprise (Active Directory / Azure AD / SAML 2.0).
- **Aksesibilitas**: Standar WCAG 2.1 dengan kontras tinggi dan layout responsif untuk desktop maupun perangkat mobile.
