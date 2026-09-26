import { Download } from "lucide-react";
import { ListSearch } from "@/components/list-search";
import { Pagination } from "@/components/pagination";
import { inventoryTotals, searchItems } from "@/lib/inventory";
import { requireUser } from "@/lib/auth";
import { parsePage } from "@/lib/pagination";

export default async function ReportsPage({ searchParams }: { searchParams: Promise<{ q?: string; page?: string }> }) {
  await requireUser();
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q.trim().slice(0, 100) : "";
  const [stats, items] = await Promise.all([
    inventoryTotals(), searchItems(query, parsePage(params.page)),
  ]);
  return <>
    <div className="page-heading"><div><p className="eyebrow">PELAPORAN</p><h1>Laporan inventaris</h1><p className="muted">Rekap stok terkini untuk kebutuhan administrasi.</p></div>
      <a href="/api/laporan/csv" className="btn btn-primary"><Download size={17} /> Unduh CSV</a>
    </div>
    <div className="report-banner"><div><strong>{stats.totalItems} jenis barang</strong><span>tercatat dalam inventaris</span></div><div><strong>{stats.totalUnits} unit</strong><span>tersedia saat ini</span></div><div><strong>{stats.lowStock} barang</strong><span>pada batas stok minimum</span></div></div>
    <section className="card table-card border border-base-200 bg-base-100 shadow-sm"><div className="section-heading"><div><h2>Rekap per barang</h2><p className="muted">Data pada laporan mengikuti stok saat ini.</p></div></div>
      <ListSearch path="/laporan" query={query} label="Cari barang" placeholder="Kode, nama, kategori, lokasi" />
      <div className="table-scroll"><table className="table table-zebra"><thead><tr><th>Kode</th><th>Barang</th><th>Kategori</th><th>Lokasi</th><th>Stok</th><th>Minimum</th></tr></thead><tbody>{items.rows.map(item => <tr key={item.id}><td className="mono">{item.code}</td><td><strong>{item.name}</strong></td><td>{item.category ?? "—"}</td><td>{item.location || "—"}</td><td>{item.currentStock} {item.unit}</td><td>{item.minStock} {item.unit}</td></tr>)}</tbody></table>{items.rows.length === 0 && <p className="table-empty">{query ? "Tidak ada barang yang cocok." : "Belum ada barang."}</p>}</div>
      <Pagination path="/laporan" {...items} filters={{ q: query }} />
    </section>
  </>;
}
