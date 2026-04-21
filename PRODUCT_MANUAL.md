# Juara Ratecard Manager: Panduan Pengguna Lengkap

![Manual Cover](file:///Users/yudiqitrick/.gemini/antigravity/brain/0dda9fe4-9a44-4f5c-9fb8-034581a1499f/juara_ratecard_manual_cover_1776756171161.png)

## 1. Pendahuluan
**Juara Ratecard Manager** adalah solusi profesional untuk pembuatan dan pengelolaan penawaran harga (quotation) yang dirancang khusus untuk tim operasional **PT Juara**. Aplikasi ini menggabungkan fleksibilitas Excel dengan kekuatan database cloud untuk memastikan data Anda aman dan terstandarisasi.

---

## 2. Cara Mengakses Aplikasi

---

## 3. Keamanan & Sistem Multi-User

Aplikasi ini sekarang dilengkapi dengan sistem keamanan tingkat industri untuk melindungi data ratecard perusahaan.

### 🔑 Cara Login
1.  Buka [https://juara-ratecard.vercel.app/login](https://juara-ratecard.vercel.app/login).
2.  Masukkan **Email Bisnis** dan **Password** yang telah didaftarkan.
3.  Sistem akan mengarahkan Anda ke Dashboard sesuai dengan hak akses Anda.

### 👥 Peran Pengguna (Roles)
Sistem membedakan tiga tingkat akses:
*   **Admin**: Hak akses penuh. Bisa mengubah harga Master Ratecard, menambah kategori produk, dan mengelola seluruh penawaran.
*   **Editor**: Bisa membuat, mengedit, dan menduplikasi penawaran (quotation), tetapi **tidak bisa** mengubah harga dasar (Master) di halaman Ratecard.
*   **Viewer**: Hanya bisa melihat daftar penawaran dan melakukan Preview/Print. Cocok untuk pihak manajemen yang hanya perlu meninjau dokumen.

---

## 3. Fitur Utama Builder

### 📊 Navigasi Mirip Excel
Anda tidak perlu lagi mengklik tombol "Edit" satu per satu. Cukup klik pada kotak mana saja (Nama, Qty, Harga) dan langsung ketik.
- **Arrows (↑ ↓ ← →)**: Berpindah antar kotak dengan cepat.
- **Tab**: Berpindah ke kotak berikutnya.

### 🔢 Smart Hierarchy (Penomoran Pintar)
Sistem ini secara otomatis mengatur nomor urut produk berdasarkan kategori:
- **Seksi**: A, B, C...
- **Kategori**: A.1, A.2...
- **Item**: A.1.1, A.1.1.1...
Setiap kali Anda memindah posisi produk, nomor ini akan **otomatis berubah** tanpa perlu Anda ketik manual.

### 📝 Technical Specification (Multi-line & Bullet)
Kolom **Specification** kini mendukung teks yang panjang dan terstruktur:
- **Baris Baru**: Tekan **Enter** di dalam kolom spesifikasi untuk membuat baris baru.
- **List/Bullet**: Gunakan tanda `-` atau `*` untuk membuat daftar fitur teknik.
- **Tampilan Print**: Semua daftar teknik akan tampil rapi dan rapat saat dicetak ke PDF.

---

## 4. Pencetakan & Export PDF

Untuk menghasilkan dokumen penawaran bagi klien:
1.  Klik tombol **"Print Document"** di bagian atas builder.
2.  Gunakan **Print Preview** untuk memeriksa tampilan (Pastikan kolom penomoran sudah rata kanan dan rapi).
3.  Simpan sebagai PDF melalui dialog sistem Print (`Cmd + P` di Mac).

---

## 5. Ringkasan Tombol Cepat (Shortcuts)

| Tombol | Fungsi |
| :--- | :--- |
| `Cmd + S` | Simpan Draft Manual |
| `Enter` | (Di dalam Spek) Buat baris baru |
| `Panah Bawah` | Berpindah ke baris di bawahnya |
| `Print Document` | Masuk ke mode cetak resmi |

---

## 6. Pertanyaan Umum (FAQ)

**Q: Mengapa data saya hilang saat refresh?**
A: Pastikan Anda terkoneksi internet untuk sinkronisasi cloud. Jika offline, data disimpan di memori lokal sementara.

**Q: Bagaimana cara membuat Sub-kategori?**
A: Gunakan fitur pengelompokan (Indentation) di dalam Builder. Sistem akan mengenali hierarkinya secara otomatis.

---
*Dibuat khusus untuk PT Juara oleh Antigravity.*
