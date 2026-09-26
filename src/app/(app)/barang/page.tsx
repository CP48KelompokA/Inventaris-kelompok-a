import Link from "next/link";
import { PackagePlus, Search } from "lucide-react";
import { CategoryForm, CategoryManage, ItemForm } from "@/components/forms";
import { requireUser } from "@/lib/auth";
import { categoryItemCounts, listCategories, listLocations, searchItems } from "@/lib/inventory";

export default async function ItemsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q.trim().slice(0, 100) : "";
  const requestedPage = /^\d+$/.test(params.page ?? "") ? Number(params.page) : 1;
  const [user, categories, locations, counts, result] = await Promise.all([
    requireUser(), listCategories(), listLocations(), categoryItemCounts(),
    searchItems(query, Number.isSafeInteger(requestedPage) ? requestedPage : 1),
  ]);
  const categoryCounts = new Map(counts.map(row => [row.id, row.total]));

  return <>
    <div className="page-heading"><div><p className="eyebrow">MASTER DATA</p><h1>Data barang</h1><p className="muted">Daftar barang beserta stok yang tersedia.</p></div><span className="count-pill">{result.total} jenis barang</span></div>
    {user.role === "admin" && <div className="entry-grid">
      <section className="card border border-base-200 bg-base-100 shadow-sm">
        <div className="section-heading"><div><h2><PackagePlus size={19} /> Tambah barang</h2><p className="muted">Stok awal dicatat sebagai transaksi masuk agar ada riwayat.</p></div></div>
        <ItemForm categories={categories} locations={locations} />
        {locations.length === 0 && <p className="muted">Belum ada lokasi? <Link href="/lokasi">Tambahkan lokasi</Link> agar barang dapat ditempatkan.</p>}
      </section>
      <section className="card border border-base-200 bg-base-100 shadow-sm">
        <div className="section-heading"><div><h2>Kategori</h2><p className="muted">Kelompokkan barang agar mudah ditemukan.</p></div></div>
        <CategoryForm />
        <div className="form-stack">{categories.length ? categories.map(c => <div key={c.id} className="border-b border-base-200 pb-2"><CategoryManage category={c} itemCount={categoryCounts.get(c.id) ?? 0} /></div>) : <span className="muted">Belum ada kategori.</span>}</div>
      </section>
    </div>}
    <section className="card table-card border border-base-200 bg-base-100 shadow-sm">
      <div className="section-heading"><div><h2>Daftar inventaris</h2><p className="muted">Stok diperbarui otomatis dari transaksi.</p></div>
        <form className="search-field" method="get"><Search size={17} /><input className="input" name="q" defaultValue={params.q ?? ""} placeholder="Cari kode, nama, kategori..." aria-label="Cari barang" /><button type="submit" className="sr-only">Cari</button></form>
      </div>
      <div className="table-scroll"><table className="table table-zebra"><thead><tr><th>Kode</th><th>Nama barang</th><th>Kategori</th><th>Lokasi</th><th>Stok</th><th>Status</th>{user.role === "admin" && <th>Aksi</th>}</tr></thead>
        <tbody>{result.rows.map(item => <tr key={item.id}><td className="mono">{item.code}</td><td><strong>{item.name}</strong><small className="cell-note">{item.notes}</small></td><td>{item.category ?? "—"}</td><td>{item.location ?? "—"}</td><td><strong>{item.currentStock}</strong> {item.unit}</td><td><span className={`badge ${item.currentStock <= item.minStock ? "badge-warning" : "badge-success"}`}>{item.currentStock <= item.minStock ? "Stok menipis" : "Tersedia"}</span></td>{user.role === "admin" && <td><Link className="btn btn-ghost btn-sm" href={`/barang/${item.id}/edit`}>Edit</Link></td>}</tr>)}</tbody>
      </table>{result.rows.length === 0 && <p className="table-empty">Tidak ada barang yang cocok.</p>}</div>
      {result.pages > 1 && <div className="flex items-center justify-between gap-4 pt-4"><span className="muted">Halaman {result.page} dari {result.pages}</span><div className="flex gap-2">{result.page > 1 && <Link className="btn btn-outline btn-sm" href={`/barang?q=${encodeURIComponent(query)}&page=${result.page - 1}`}>Sebelumnya</Link>}{result.page < result.pages && <Link className="btn btn-outline btn-sm" href={`/barang?q=${encodeURIComponent(query)}&page=${result.page + 1}`}>Berikutnya</Link>}</div></div>}
    </section>
  </>;
}
