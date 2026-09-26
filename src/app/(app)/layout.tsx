import Link from "next/link";
import { BarChart3, Boxes, LayoutDashboard, PackageCheck, Repeat2, Users } from "lucide-react";
import { logoutAction } from "@/app/actions";
import { requireUser } from "@/lib/auth";

const links = [
  { href: "/", label: "Ringkasan", icon: LayoutDashboard },
  { href: "/barang", label: "Data barang", icon: Boxes },
  { href: "/transaksi", label: "Transaksi", icon: Repeat2 },
  { href: "/laporan", label: "Laporan", icon: BarChart3 },
];

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link href="/" className="sidebar-brand">
          <span className="brand-mark"><PackageCheck size={21} /></span>
          <span>Inventaris<small>SMK Muhammadiyah 1 Pemalang</small></span>
        </Link>
        <div className="nav-caption">MENU UTAMA</div>
        <nav className="sidebar-nav" aria-label="Navigasi utama">
          {links.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href}><Icon size={19} />{label}</Link>
          ))}
          {user.role === "admin" && <Link href="/pengguna"><Users size={19} />Pengguna</Link>}
        </nav>
        <div className="sidebar-bottom">
          <Link href="/akun" className="user-chip">
            <span className="avatar">{user.name.slice(0, 1).toUpperCase()}</span>
            <span><strong>{user.name}</strong><small>{user.role === "admin" ? "Administrator" : "Staf"}</small></span>
          </Link>
          <form action={logoutAction}><button className="text-button" type="submit">Keluar akun</button></form>
        </div>
      </aside>
      <div className="main-area">
        <header className="mobile-header">
          <Link href="/" className="mobile-brand"><PackageCheck size={20} /> Inventaris</Link>
          <span>{user.name}</span>
        </header>
        <nav className="mobile-nav" aria-label="Navigasi seluler">
          {links.map(({ href, label }) => <Link key={href} href={href}>{label}</Link>)}
          {user.role === "admin" && <Link href="/pengguna">Pengguna</Link>}
          <Link href="/akun">Akun</Link>
        </nav>
        <main className="page-content">{children}</main>
      </div>
    </div>
  );
}
