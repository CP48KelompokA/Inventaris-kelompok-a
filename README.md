# Inventaris SMK Muhammadiyah 1 Pemalang

Aplikasi inventaris berbasis web untuk tugas Capstone Project STSI4440. Stack: Next.js App Router, TypeScript, PostgreSQL Neon, Drizzle ORM, dan Vercel.

## Antarmuka

UI menggunakan Tailwind CSS 4 dan daisyUI 5 (tema `emerald`). Kelas daisyUI dipakai untuk kontrol formulir, tombol, kartu, badge, notifikasi, dan tabel. `src/app/globals.css` berisi tata letak aplikasi dan warna identitas sekolah yang digunakan bersama. Gunakan komponen dan token tema yang sudah ada saat menambah halaman agar tampilan tetap konsisten.

## Fitur awal

- Akun administrator dan staf dengan sesi melalui cookie HTTP-only.
- Kategori dan katalog barang dengan kode unik, lokasi, satuan, dan batas stok minimum.
- Pencatatan barang masuk dan keluar. Perubahan stok serta riwayat disimpan dalam satu transaksi database; pengeluaran tidak boleh melebihi stok.
- Ringkasan, pencarian barang, riwayat transaksi, indikator stok minimum, dan laporan CSV.
- Admin dapat membuat akun staf. Pengguna dapat mengganti kata sandinya sendiri.

## Struktur

- `src/db`: skema dan koneksi database.
- `src/lib`: aturan autentikasi dan transaksi inventaris.
- `src/app`: halaman, Server Actions, dan ekspor laporan.
- `drizzle`: migrasi SQL yang dikomit bersama kode.
- `neon.ts`: kebijakan layanan Neon, sesuai konfigurasi awal proyek.

## Persiapan lingkungan

1. Gunakan Node.js 20.9 atau lebih baru, lalu jalankan `npm ci`.
2. Tautkan project Vercel/Neon milik kelompok dan siapkan variabel pada `.env.example`. Jangan memasukkan nilainya ke Git.
3. Gunakan `DATABASE_URL` **pooled** untuk aplikasi, serta `DATABASE_URL_UNPOOLED` **direct** untuk migrasi.
4. Buat `SESSION_SECRET` acak dengan panjang minimal 32 karakter.
5. Setelah branch database yang dituju dipastikan benar, jalankan `npm run db:migrate`.
6. Isi `ADMIN_EMAIL` dan `ADMIN_PASSWORD` (minimal 12 karakter) secara lokal, jalankan `npm run db:seed`, lalu hapus dua variabel itu dari lingkungan bila tidak lagi diperlukan.
7. Jalankan `npm run dev` dan buka `http://localhost:3000`.

Perintah pemeriksaan: `npm run typecheck`, `npm run lint`, `npm run build`. Perubahan skema: `npm run db:generate`, tinjau SQL baru, lalu `npm run db:migrate` pada branch yang sesuai. Jangan menggunakan `db:push` di production.

## Asumsi yang perlu dikonfirmasi dengan sekolah

Rancangan awal ini memperlakukan satu kode barang sebagai **jenis barang dengan jumlah stok**. Proses inventaris aktual, kebutuhan pencatatan aset per unit/serial number, dokumen sumber barang masuk/keluar, pihak yang menyetujui transaksi, dan format laporan sekolah belum dikonfirmasi. Validasi hal-hal tersebut sebelum fitur dan laporan ditetapkan sebagai hasil final Capstone.

## Batas versi awal

Belum ada alur koreksi transaksi, penghapusan barang, perubahan profil selain kata sandi, lampiran bukti, atau audit perubahan data master. Riwayat transaksi tidak menyediakan tombol hapus agar jejak stok tetap terlacak. Admin pertama dibuat melalui seed, lalu admin dapat menambahkan akun staf dari aplikasi.
