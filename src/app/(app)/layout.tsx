import Link from "next/link";
import { PackageCheck } from "lucide-react";
import { logoutAction } from "@/app/actions";
import { AppNav } from "@/components/app-nav";
import { requireUser } from "@/lib/auth";

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
        <AppNav role={user.role} />
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
        <AppNav role={user.role} mobile />
        <main className="page-content">{children}</main>
      </div>
    </div>
  );
}
