import { UserForm } from "@/components/forms";
import { listUsers } from "@/lib/auth";

export default async function UsersPage() {
  const users = await listUsers();
  return <>
    <div className="page-heading"><div><p className="eyebrow">AKSES APLIKASI</p><h1>Pengguna</h1><p className="muted">Buat akun terpisah untuk setiap petugas inventaris.</p></div></div>
    <section className="card narrow-card"><div className="section-heading"><div><h2>Tambah pengguna</h2><p className="muted">Bagikan kata sandi awal langsung kepada pemilik akun.</p></div></div><UserForm /></section>
    <section className="card table-card"><div className="section-heading"><div><h2>Daftar pengguna</h2></div></div>
      <div className="table-scroll"><table><thead><tr><th>Nama</th><th>Email</th><th>Peran</th></tr></thead><tbody>{users.map(user => <tr key={user.id}><td><strong>{user.name}</strong></td><td>{user.email}</td><td><span className="pill ok">{user.role === "admin" ? "Administrator" : "Staf"}</span></td></tr>)}</tbody></table></div>
    </section>
  </>;
}
