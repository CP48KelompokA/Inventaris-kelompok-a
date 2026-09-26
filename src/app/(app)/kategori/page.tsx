import Link from "next/link";
import { CategoryForm, CategoryManage } from "@/components/forms";
import { requireAdmin } from "@/lib/auth";
import { categoryItemCounts, listCategories } from "@/lib/inventory";

export default async function CategoriesPage() {
  await requireAdmin();
  const [categories, counts] = await Promise.all([listCategories(), categoryItemCounts()]);
  const usage = new Map(counts.map(row => [row.id, row.total]));
  return <>
    <div className="page-heading"><div><p className="eyebrow">MASTER DATA</p><h1>Kategori barang</h1><p className="muted">Kelompokkan jenis barang untuk pencarian dan laporan.</p></div><Link className="btn btn-ghost" href="/barang">Kembali ke barang</Link></div>
    <section className="card narrow-card border border-base-200 bg-base-100 shadow-sm">
      <div className="section-heading"><div><h2>Tambah kategori</h2><p className="muted">Gunakan nama yang mudah dikenali petugas.</p></div></div>
      <CategoryForm />
    </section>
    <section className="card table-card border border-base-200 bg-base-100 shadow-sm">
      <div className="section-heading"><div><h2>Daftar kategori</h2><p className="muted">Kategori yang sedang dipakai tidak dapat dihapus.</p></div><span className="count-pill">{categories.length} kategori</span></div>
      <div className="table-scroll"><table className="table table-zebra"><thead><tr><th>Nama kategori dan aksi</th><th>Jenis barang</th></tr></thead>
        <tbody>{categories.map(category => <tr key={category.id}><td><CategoryManage category={category} itemCount={usage.get(category.id) ?? 0} /></td><td>{usage.get(category.id) ?? 0}</td></tr>)}</tbody>
      </table>{categories.length === 0 && <p className="table-empty">Belum ada kategori. Tambahkan melalui formulir di atas.</p>}</div>
    </section>
  </>;
}
