import Link from "next/link";
import { ArrowDownLeft, ArrowUpRight, Boxes, CircleAlert, PackageCheck, Repeat2 } from "lucide-react";
import { listItems, listMovements } from "@/lib/inventory";
import { formatDate } from "@/lib/format";

export default async function DashboardPage() {
  const [items, recent] = await Promise.all([listItems(), listMovements(5)]);
  const lowStock = items.filter((item) => item.currentStock <= item.minStock);
  const totalUnits = items.reduce((sum, item) => sum + item.currentStock, 0);
  return (
    <>
      <div className="page-heading">
        <div><p className="eyebrow">DASHBOARD</p><h1>Ringkasan inventaris</h1><p className="muted">Gambaran stok dan aktivitas barang terkini.</p></div>
        <Link className="button primary" href="/transaksi">Catat transaksi <ArrowUpRight size={17} /></Link>
      </div>
      <div className="stats-grid">
        <Stat icon={<Boxes />} label="Jenis barang" value={items.length} note="Terdaftar dalam sistem" />
        <Stat icon={<PackageCheck />} label="Total unit" value={totalUnits} note="Stok tersedia saat ini" />
        <Stat icon={<CircleAlert />} label="Stok menipis" value={lowStock.length} note="Perlu diperhatikan" warning />
        <Stat icon={<Repeat2 />} label="Aktivitas terbaru" value={recent.length} note="Ditampilkan di bawah" />
      </div>
      <div className="dashboard-grid">
        <section className="card">
          <div className="section-heading"><div><h2>Aktivitas terbaru</h2><p className="muted">Transaksi masuk dan keluar</p></div><Link href="/transaksi">Lihat semua</Link></div>
          {recent.length === 0 ? <Empty text="Belum ada transaksi barang." /> : (
            <div className="activity-list">
              {recent.map((row) => (
                <div className="activity" key={row.id}>
                  <span className={`activity-icon ${row.type}`}>{row.type === "in" ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}</span>
                  <div><strong>{row.itemName}</strong><small>{row.itemCode} · {row.actorName}</small></div>
                  <div className="activity-end"><strong>{row.type === "in" ? "+" : "−"}{row.quantity}</strong><small>{formatDate(row.createdAt)}</small></div>
                </div>
              ))}
            </div>
          )}
        </section>
        <section className="card">
          <div className="section-heading"><div><h2>Perlu perhatian</h2><p className="muted">Barang pada batas stok minimum</p></div></div>
          {lowStock.length === 0 ? <Empty text="Semua stok berada di atas batas minimum." /> : (
            <div className="attention-list">
              {lowStock.slice(0, 6).map((item) => (
                <div key={item.id}><span><strong>{item.name}</strong><small>{item.code}</small></span><span className="pill warning">{item.currentStock} {item.unit}</span></div>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}

function Stat({ icon, label, value, note, warning = false }: { icon: React.ReactNode; label: string; value: number; note: string; warning?: boolean }) {
  return <div className="stat-card"><div className={`stat-icon ${warning ? "warning" : ""}`}>{icon}</div><span>{label}</span><strong>{value.toLocaleString("id-ID")}</strong><small>{note}</small></div>;
}

function Empty({ text }: { text: string }) {
  return <div className="empty"><PackageCheck size={26} /><p>{text}</p></div>;
}
