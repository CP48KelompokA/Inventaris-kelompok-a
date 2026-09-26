import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Inventaris SMK Muhammadiyah 1 Pemalang",
  description: "Pencatatan barang dan pergerakan stok sekolah.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" data-theme="emerald">
      <body>{children}</body>
    </html>
  );
}
