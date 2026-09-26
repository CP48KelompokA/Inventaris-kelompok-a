import { PasswordForm } from "@/components/forms";
import { requireUser } from "@/lib/auth";

export default async function AccountPage() {
  const user = await requireUser();
  return <>
    <div className="page-heading"><div><p className="eyebrow">PENGATURAN</p><h1>Akun saya</h1><p className="muted">{user.name} · {user.email}</p></div></div>
    <section className="card narrow-card"><div className="section-heading"><div><h2>Ganti kata sandi</h2><p className="muted">Gunakan kata sandi baru minimal 12 karakter.</p></div></div><PasswordForm /></section>
  </>;
}
