import { LocationForm, LocationRenameForm } from "@/components/forms";
import { requireAdmin } from "@/lib/auth";
import { listItems, listLocations } from "@/lib/inventory";

export default async function LocationsPage() {
  await requireAdmin();
  const [locations, items] = await Promise.all([listLocations(), listItems()]);
  const itemCounts = new Map<string, number>();
  for (const item of items) {
    if (item.locationId) itemCounts.set(item.locationId, (itemCounts.get(item.locationId) ?? 0) + 1);
  }
  return <>
    <div className="page-heading"><div><p className="eyebrow">MASTER DATA</p><h1>Lokasi barang</h1><p className="muted">Nama lokasi yang konsisten memudahkan pencarian dan pelaporan.</p></div></div>
    <section className="card narrow-card border border-base-200 bg-base-100 shadow-sm">
      <div className="section-heading"><div><h2>Tambah lokasi</h2><p className="muted">Contoh: Ruang guru, Laboratorium komputer, Gudang.</p></div></div>
      <LocationForm />
    </section>
    <section className="card table-card border border-base-200 bg-base-100 shadow-sm">
      <div className="section-heading"><div><h2>Daftar lokasi</h2><p className="muted">Nama lokasi dapat diperbaiki tanpa memindahkan barang.</p></div></div>
      <div className="table-scroll"><table className="table table-zebra"><thead><tr><th>Nama lokasi</th><th>Jenis barang</th><th>Perbaiki nama</th></tr></thead>
        <tbody>{locations.map(location => <tr key={location.id}><td><strong>{location.name}</strong></td><td>{itemCounts.get(location.id) ?? 0}</td><td><LocationRenameForm location={location} /></td></tr>)}</tbody>
      </table>{locations.length === 0 && <p className="table-empty">Belum ada lokasi.</p>}</div>
    </section>
  </>;
}
