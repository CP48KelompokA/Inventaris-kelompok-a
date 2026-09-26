import Link from "next/link";
import { LocationDeleteForm, LocationForm, LocationRenameForm } from "@/components/forms";
import { ListSearch } from "@/components/list-search";
import { Pagination } from "@/components/pagination";
import { requireAdmin } from "@/lib/auth";
import { searchLocations, locationItemCounts } from "@/lib/inventory";
import { parsePage } from "@/lib/pagination";

export default async function LocationsPage({ searchParams }: { searchParams: Promise<{ q?: string; page?: string }> }) {
  await requireAdmin();
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q.trim().slice(0, 100) : "";
  const locations = await searchLocations(query, parsePage(params.page));
  const counts = await locationItemCounts(locations.rows.map(location => location.id));
  const itemCounts = new Map(counts.map(row => [row.id, row.total]));
  return <>
    <div className="page-heading"><div><p className="eyebrow">MASTER DATA</p><h1>Lokasi barang</h1><p className="muted">Nama lokasi yang konsisten memudahkan pencarian dan pelaporan.</p></div><Link className="btn btn-ghost" href="/barang">Kembali ke barang</Link></div>
    <section className="card narrow-card border border-base-200 bg-base-100 shadow-sm">
      <div className="section-heading"><div><h2>Tambah lokasi</h2><p className="muted">Contoh: Ruang guru, Laboratorium komputer, Gudang.</p></div></div>
      <LocationForm />
    </section>
    <section className="card table-card border border-base-200 bg-base-100 shadow-sm">
      <div className="section-heading"><div><h2>Daftar lokasi</h2><p className="muted">Nama dapat diperbaiki tanpa memindahkan barang. Lokasi yang masih dipakai tidak dapat dihapus.</p></div></div>
      <ListSearch path="/lokasi" query={query} label="Cari lokasi" placeholder="Nama lokasi" />
      <div className="table-scroll"><table className="table table-zebra"><thead><tr><th>Nama lokasi</th><th>Jenis barang</th><th>Perbaiki nama</th><th>Aksi</th></tr></thead>
        <tbody>{locations.rows.map(location => <tr key={location.id}><td><strong>{location.name}</strong></td><td>{itemCounts.get(location.id) ?? 0}</td><td><LocationRenameForm location={location} /></td><td>{!itemCounts.has(location.id) && <LocationDeleteForm location={location} />}</td></tr>)}</tbody>
      </table>{locations.rows.length === 0 && <p className="table-empty">{query ? "Tidak ada lokasi yang cocok." : "Belum ada lokasi."}</p>}</div>
      <Pagination path="/lokasi" {...locations} filters={{ q: query }} />
    </section>
  </>;
}
