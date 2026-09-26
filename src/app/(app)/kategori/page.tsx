import Link from "next/link";
import { CategoryForm, CategoryManage } from "@/components/forms";
import { ListSearch } from "@/components/list-search";
import { Pagination } from "@/components/pagination";
import { requireAdmin } from "@/lib/auth";
import { categoryItemCounts, searchCategories } from "@/lib/inventory";
import { parsePage } from "@/lib/pagination";

export default async function CategoriesPage({ searchParams }: { searchParams: Promise<{ q?: string; page?: string }> }) {
  await requireAdmin();
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q.trim().slice(0, 100) : "";
  const categories = await searchCategories(query, parsePage(params.page));
  const counts = await categoryItemCounts(categories.rows.map(category => category.id));
  const usage = new Map(counts.map(row => [row.id, row.total]));
  return <>
    <div className="page-heading"><div><p className="eyebrow">MASTER DATA</p><h1>Kategori barang</h1><p className="muted">Kelompokkan jenis barang untuk pencarian dan laporan.</p></div><Link className="btn btn-ghost" href="/barang">Kembali ke barang</Link></div>
    <section className="card narrow-card border border-base-200 bg-base-100 shadow-sm">
      <div className="section-heading"><div><h2>Tambah kategori</h2><p className="muted">Gunakan nama yang mudah dikenali petugas.</p></div></div>
      <CategoryForm />
    </section>
    <section className="card table-card border border-base-200 bg-base-100 shadow-sm">
      <div className="section-heading"><div><h2>Daftar kategori</h2><p className="muted">Kategori yang sedang dipakai tidak dapat dihapus.</p></div><span className="count-pill">{categories.total} kategori</span></div>
      <ListSearch path="/kategori" query={query} label="Cari kategori" placeholder="Nama kategori" />
      <div className="table-scroll"><table className="table table-zebra"><thead><tr><th>Nama kategori dan aksi</th><th>Jenis barang</th></tr></thead>
        <tbody>{categories.rows.map(category => <tr key={category.id}><td><CategoryManage category={category} itemCount={usage.get(category.id) ?? 0} /></td><td>{usage.get(category.id) ?? 0}</td></tr>)}</tbody>
      </table>{categories.rows.length === 0 && <p className="table-empty">{query ? "Tidak ada kategori yang cocok." : "Belum ada kategori. Tambahkan melalui formulir di atas."}</p>}</div>
      <Pagination path="/kategori" {...categories} filters={{ q: query }} />
    </section>
  </>;
}
