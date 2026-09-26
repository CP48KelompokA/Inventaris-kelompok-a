import Link from "next/link";
import { UserForm } from "@/components/forms";
import { ListSearch } from "@/components/list-search";
import { Pagination } from "@/components/pagination";
import { searchUsers } from "@/lib/auth";
import { parsePage } from "@/lib/pagination";

export default async function UsersPage({ searchParams }: { searchParams: Promise<{ q?: string; page?: string }> }) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q.trim().slice(0, 100) : "";
  const users = await searchUsers(query, parsePage(params.page));
  return <>
    <div className="page-heading"><div><p className="eyebrow">AKSES APLIKASI</p><h1>Pengguna</h1><p className="muted">Buat akun terpisah untuk setiap petugas inventaris.</p></div></div>
    <section className="card narrow-card border border-base-200 bg-base-100 shadow-sm"><div className="section-heading"><div><h2>Tambah pengguna</h2><p className="muted">Bagikan kata sandi awal langsung kepada pemilik akun.</p></div></div><UserForm /></section>
    <section className="card table-card border border-base-200 bg-base-100 shadow-sm"><div className="section-heading"><div><h2>Daftar pengguna</h2></div></div>
      <ListSearch path="/pengguna" query={query} label="Cari pengguna" placeholder="Nama atau email" />
      <div className="table-scroll"><table className="table table-zebra"><thead><tr><th>Nama</th><th>Email</th><th>Peran</th><th>Status</th><th>Aksi</th></tr></thead><tbody>{users.rows.map(user => <tr key={user.id}><td><strong>{user.name}</strong></td><td>{user.email}</td><td><span className="badge badge-success">{user.role === "admin" ? "Administrator" : "Staf"}</span></td><td><span className={`badge ${user.active ? "badge-success" : "badge-ghost"}`}>{user.active ? "Aktif" : "Nonaktif"}</span></td><td><Link className="btn btn-ghost btn-sm" href={`/pengguna/${user.id}`}>Kelola</Link></td></tr>)}</tbody></table>{users.rows.length === 0 && <p className="table-empty">{query ? "Tidak ada pengguna yang cocok." : "Belum ada pengguna."}</p>}</div>
      <Pagination path="/pengguna" {...users} filters={{ q: query }} />
    </section>
  </>;
}
