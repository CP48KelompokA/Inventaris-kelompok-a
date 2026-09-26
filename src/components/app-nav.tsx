"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Boxes, LayoutDashboard, Repeat2, Users } from "lucide-react";

const links = [
  { href: "/", label: "Ringkasan", icon: LayoutDashboard },
  { href: "/barang", label: "Data barang", icon: Boxes },
  { href: "/transaksi", label: "Transaksi", icon: Repeat2 },
  { href: "/laporan", label: "Laporan", icon: BarChart3 },
];

export function AppNav({ role, mobile = false }: { role: "admin" | "staff"; mobile?: boolean }) {
  const pathname = usePathname();
  const visibleLinks = role === "admin"
    ? [...links, { href: "/pengguna", label: "Pengguna", icon: Users }]
    : links;

  return (
    <nav className={mobile ? "mobile-nav" : "sidebar-nav"} aria-label={mobile ? "Navigasi seluler" : "Navigasi utama"}>
      {visibleLinks.map(({ href, label, icon: Icon }) => (
        <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined}>
          {!mobile && <Icon size={19} aria-hidden="true" />}
          {label}
        </Link>
      ))}
      {mobile && <Link href="/akun" aria-current={pathname === "/akun" ? "page" : undefined}>Akun</Link>}
    </nav>
  );
}
