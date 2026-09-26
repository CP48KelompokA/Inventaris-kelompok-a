# Inventaris SMK Muhammadiyah 1 Pemalang

Aplikasi inventaris berbasis web untuk tugas Capstone Project STSI4440. Stack: Next.js App Router, TypeScript, PostgreSQL Neon, Drizzle ORM, dan Vercel.

## Antarmuka

UI menggunakan Tailwind CSS 4 dan daisyUI 5 (tema `emerald`). Kelas daisyUI dipakai untuk kontrol formulir, tombol, kartu, badge, notifikasi, dan tabel. `src/app/globals.css` berisi tata letak aplikasi dan warna identitas sekolah yang digunakan bersama. Gunakan komponen dan token tema yang sudah ada saat menambah halaman agar tampilan tetap konsisten.

## Fitur operasional

- Akun administrator dan staf dengan sesi melalui cookie HTTP-only.
- Kategori, master lokasi, dan katalog barang dengan kode unik, satuan, dan batas stok minimum. Admin dapat menambah, mengubah, serta menghapus data master yang belum digunakan; barang hanya bisa dihapus bila stok nol dan belum ada riwayat.
- Pencatatan barang masuk dan keluar. Perubahan stok serta riwayat disimpan dalam satu transaksi database; pengeluaran tidak boleh melebihi stok.
- Ringkasan, pencarian dan paginasi barang, riwayat transaksi dengan pencarian/filter/paginasi, indikator stok minimum, dan laporan CSV.
- Admin dapat membalik transaksi yang keliru dengan alasan. Entri asli dan entri koreksi tetap terlihat; koreksi masuk tidak boleh membuat stok negatif.
- Admin dapat membuat akun, memperbarui nama/peran, menonaktifkan/mengaktifkan akun, dan reset kata sandi pengguna lain. Pengguna dapat mengganti kata sandinya sendiri. Minimal satu administrator aktif wajib dipertahankan.

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

Perintah pemeriksaan: `npm test`, `npm run typecheck`, `npm run lint`, `npm run build`. Perubahan skema: `npm run db:generate`, tinjau SQL baru, lalu `npm run db:migrate` pada branch yang sesuai. Jangan menggunakan `db:push` di production.

Migrasi `0002` menambahkan master lokasi dan memindahkan nama lokasi lama ke relasi baru. Migrasi `0003` menambah status akun, transaksi koreksi, dan indeks. Kolom teks lokasi lama tetap disimpan sementara untuk keamanan rollback. Uji migrasi pada branch Neon terpisah sebelum menerapkannya di production.

Fungsi Vercel dijalankan di region `sin1` agar dekat dengan Neon `ap-southeast-1`; koneksi aplikasi tetap menggunakan URL pooled. Paginasi menghindari mengirim seluruh data barang ke browser. Pada tier gratis, cold start Neon/Vercel masih mungkin terjadi.

## Asumsi yang perlu dikonfirmasi dengan sekolah

Rancangan awal ini memperlakukan satu kode barang sebagai **jenis barang dengan jumlah stok**. Proses inventaris aktual, kebutuhan pencatatan aset per unit/serial number, dokumen sumber barang masuk/keluar, pihak yang menyetujui transaksi, dan format laporan sekolah belum dikonfirmasi. Validasi hal-hal tersebut sebelum fitur dan laporan ditetapkan sebagai hasil final Capstone.

## Aturan data dan batas kebutuhan yang belum divalidasi

Riwayat transaksi dan pengguna yang pernah mencatat transaksi tidak dihapus fisik agar jejak stok dan pelaku tetap utuh. Tidak ada lampiran bukti atau alur persetujuan karena proses tersebut harus dikonfirmasi dengan sekolah. Perubahan data master belum memiliki audit terpisah. Admin pertama dibuat melalui seed, lalu admin dapat menambahkan akun staf dari aplikasi.
