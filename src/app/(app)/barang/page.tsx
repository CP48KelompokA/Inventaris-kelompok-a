import Link from "next/link";
import { PackagePlus, Search } from "lucide-react";
import { CategoryForm, ItemForm } from "@/components/forms";
import { requireUser } from "@/lib/auth";
import { listCategories, listItems, listLocations } from "@/lib/inventory";

export default async function ItemsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const [user, categories, locations, items, params] = await Promise.all([
    requireUser(), listCategories(), listLocations(), listItems(), searchParams,
  ]);
  const query = (params.q ?? "").trim().toLowerCase();
  const filtered = query
    ? items.filter((item) => [item.code, item.name, item.category ?? "", item.location ?? ""]
        .some((field) => field.toLowerCase().includes(query)))
    : items;

  return <>
    <div className="page-heading"><div><p className="eyebrow">MASTER DATA</p><h1>Data barang</h1><p className="muted">Daftar barang beserta stok yang tersedia.</p></div><span className="count-pill">{items.length} jenis barang</span></div>
    {user.role === "admin" && <div className="entry-grid">
      <section className="card border border-base-200 bg-base-100 shadow-sm">
        <div className="section-heading"><div><h2><PackagePlus size={19} /> Tambah barang</h2><p className="muted">Stok awal dicatat sebagai transaksi masuk agar ada riwayat.</p></div></div>
        <ItemForm categories={categories} locations={locations} />
        {locations.length === 0 && <p className="muted">Belum ada lokasi? <Link href="/lokasi">Tambahkan lokasi</Link> agar barang dapat ditempatkan.</p>}
      </section>
      <section className="card border border-base-200 bg-base-100 shadow-sm">
        <div className="section-heading"><div><h2>Kategori</h2><p className="muted">Kelompokkan barang agar mudah ditemukan.</p></div></div>
        <CategoryForm />
        <div className="tags">{categories.length ? categories.map(c => <span className="badge badge-ghost" key={c.id}>{c.name}</span>) : <span className="muted">Belum ada kategori.</span>}</div>
      </section>
    </div>}
    <section className="card table-card border border-base-200 bg-base-100 shadow-sm">
      <div className="section-heading"><div><h2>Daftar inventaris</h2><p className="muted">Stok diperbarui otomatis dari transaksi.</p></div>
        <form className="search-field" method="get"><Search size={17} /><input className="input" name="q" defaultValue={params.q ?? ""} placeholder="Cari kode, nama, kategori..." aria-label="Cari barang" /><button type="submit" className="sr-only">Cari</button></form>
      </div>
      <div className="table-scroll"><table className="table table-zebra"><thead><tr><th>Kode</th><th>Nama barang</th><th>Kategori</th><th>Lokasi</th><th>Stok</th><th>Status</th>{user.role === "admin" && <th>Aksi</th>}</tr></thead>
        <tbody>{filtered.map(item => <tr key={item.id}><td className="mono">{item.code}</td><td><strong>{item.name}</strong><small className="cell-note">{item.notes}</small></td><td>{item.category ?? "—"}</td><td>{item.location ?? "—"}</td><td><strong>{item.currentStock}</strong> {item.unit}</td><td><span className={`badge ${item.currentStock <= item.minStock ? "badge-warning" : "badge-success"}`}>{item.currentStock <= item.minStock ? "Stok menipis" : "Tersedia"}</span></td>{user.role === "admin" && <td><Link className="btn btn-ghost btn-sm" href={`/barang/${item.id}/edit`}>Edit</Link></td>}</tr>)}</tbody>
      </table>{filtered.length === 0 && <p className="table-empty">Tidak ada barang yang cocok.</p>}</div>
    </section>
  </>;
}
