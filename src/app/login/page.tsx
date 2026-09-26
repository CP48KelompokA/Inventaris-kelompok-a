import { redirect } from "next/navigation";
import { PackageCheck } from "lucide-react";
import { currentUser } from "@/lib/auth";
import { LoginForm } from "@/components/forms";

export default async function LoginPage() {
  if (await currentUser()) redirect("/");
  return (
    <main className="login-screen">
      <div className="login-panel">
        <div className="brand-mark"><PackageCheck size={25} /></div>
        <p className="eyebrow">SMK MUHAMMADIYAH 1 PEMALANG</p>
        <h1>Kelola inventaris<br />dengan lebih tertib.</h1>
        <p className="muted">Masuk untuk mencatat barang, memantau stok, dan melihat riwayat transaksi.</p>
        <LoginForm />
        <p className="login-footnote">Akses diberikan oleh administrator sekolah.</p>
      </div>
      <div className="login-aside" aria-hidden="true">
        <div className="aside-card">
          <span className="aside-kicker">INVENTARIS SEKOLAH</span>
          <strong>Satu tempat untuk setiap barang.</strong>
          <span>Data jelas. Pergerakan tercatat. Laporan siap digunakan.</span>
        </div>
      </div>
    </main>
  );
}
