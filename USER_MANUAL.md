# 📘 Panduan Pengguna: Juara Ratecard Manager

Selamat datang di aplikasi **Juara Ratecard Manager**. Dokumen ini menjelaskan cara menjalankan dan menggunakan aplikasi ini dengan mudah.

---

## 🚀 Cara Cepat Membuka Aplikasi (Shortcut)

Saya telah membuatkan shortcut agar Anda bisa membuka aplikasi hanya dengan satu klik:

1.  Buka folder project: `/Users/yudiqitrick/Desktop/juara-ratecard`
2.  Cari file bernama **`JUARA_LAUNCHER.command`**.
3.  **Double-klik** file tersebut.
4.  Terminal akan terbuka secara otomatis dan menjalankan aplikasi.
5.  Browser Anda akan otomatis membuka alamat `http://localhost:5173`.

> [!TIP]
> Anda bisa menarik (drag) file `JUARA_LAUNCHER.command` ini ke **Desktop** atau **Dock** Mac Anda untuk akses yang lebih cepat di masa mendatang.

---

## 🛠 Cara Membuka Manual (via Terminal)

Jika Anda ingin menjalankannya secara manual melalui Terminal:

1.  Buka aplikasi **Terminal**.
2.  Masuk ke folder aplikasi:
    ```bash
    cd /Users/yudiqitrick/Desktop/juara-ratecard/app
    ```
3.  Jalankan perintah development server:
    ```bash
    npm run dev
    ```
4.  Buka browser dan akses: [http://localhost:5173](http://localhost:5173)

---

## 📝 Catatan Penting
- **Node.js:** Pastikan komputer Anda sudah terinstall Node.js.
- **Koneksi Database:** Aplikasi ini terhubung dengan Supabase. Pastikan Anda memiliki akses internet saat menggunakannya.
- **Menutup Aplikasi:** Untuk mematikan server, buka jendela Terminal yang sedang berjalan dan tekan `Ctrl + C`.

---

## 🎨 Tips Antarmuka (Premium Design)
Aplikasi ini sudah mendukung **Dark Mode** secara default. Untuk pengeditan harga:
- Anda bisa langsung mengklik sel pada tabel untuk mengedit (seperti di Excel).
- Gunakan tombol **Add Item** di baris paling bawah untuk menambah baris baru.
- Gunakan fitur **Export JSON** untuk mencadangkan data Anda.

---
*Dibuat khusus untuk PT Juara oleh Antigravity.*
