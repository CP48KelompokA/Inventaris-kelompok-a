import { Download } from "lucide-react";
import { listItems } from "@/lib/inventory";
import { requireUser } from "@/lib/auth";

export default async function ReportsPage() {
  await requireUser();
  const items = await listItems();
  const low = items.filter(item => item.currentStock <= item.minStock);
  return <>
    <div className="page-heading"><div><p className="eyebrow">PELAPORAN</p><h1>Laporan inventaris</h1><p className="muted">Rekap stok terkini untuk kebutuhan administrasi.</p></div>
      <a href="/api/laporan/csv" className="btn btn-primary"><Download size={17} /> Unduh CSV</a>
    </div>
    <div className="report-banner"><div><strong>{items.length} jenis barang</strong><span>tercatat dalam inventaris</span></div><div><strong>{items.reduce((sum, item) => sum + item.currentStock, 0)} unit</strong><span>tersedia saat ini</span></div><div><strong>{low.length} barang</strong><span>pada batas stok minimum</span></div></div>
    <section className="card table-card border border-base-200 bg-base-100 shadow-sm"><div className="section-heading"><div><h2>Rekap per barang</h2><p className="muted">Data pada laporan mengikuti stok saat ini.</p></div></div>
      <div className="table-scroll"><table className="table table-zebra"><thead><tr><th>Kode</th><th>Barang</th><th>Kategori</th><th>Lokasi</th><th>Stok</th><th>Minimum</th></tr></thead><tbody>{items.map(item => <tr key={item.id}><td className="mono">{item.code}</td><td><strong>{item.name}</strong></td><td>{item.category ?? "—"}</td><td>{item.location || "—"}</td><td>{item.currentStock} {item.unit}</td><td>{item.minStock} {item.unit}</td></tr>)}</tbody></table>{items.length === 0 && <p className="table-empty">Belum ada barang.</p>}</div>
    </section>
  </>;
}
