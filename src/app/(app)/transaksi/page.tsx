import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { MovementForm } from "@/components/forms";
import { formatDate } from "@/lib/format";
import { listItems, listMovements } from "@/lib/inventory";

export default async function TransactionsPage() {
  const [items, movements] = await Promise.all([listItems(), listMovements()]);
  return <>
    <div className="page-heading"><div><p className="eyebrow">PERGERAKAN STOK</p><h1>Transaksi barang</h1><p className="muted">Setiap barang masuk dan keluar tercatat bersama pelakunya.</p></div></div>
    <section className="card narrow-card">
      <div className="section-heading"><div><h2>Catat transaksi baru</h2><p className="muted">Barang keluar tidak dapat melebihi stok tersedia.</p></div></div>
      {items.length ? <MovementForm items={items} /> : <p className="muted">Tambahkan barang terlebih dahulu sebelum mencatat transaksi.</p>}
    </section>
    <section className="card table-card">
      <div className="section-heading"><div><h2>Riwayat transaksi</h2><p className="muted">Menampilkan 100 transaksi terbaru.</p></div></div>
      <div className="table-scroll"><table><thead><tr><th>Waktu</th><th>Barang</th><th>Jenis</th><th>Jumlah</th><th>Keterangan</th><th>Dicatat oleh</th></tr></thead>
        <tbody>{movements.map(row => <tr key={row.id}><td>{formatDate(row.createdAt)}</td><td><strong>{row.itemName}</strong><small className="cell-note mono">{row.itemCode}</small></td><td><span className={`movement-label ${row.type}`}>{row.type === "in" ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}{row.type === "in" ? "Masuk" : "Keluar"}</span></td><td><strong>{row.type === "in" ? "+" : "−"}{row.quantity}</strong></td><td>{row.note || "—"}</td><td>{row.actorName}</td></tr>)}</tbody>
      </table>{movements.length === 0 && <p className="table-empty">Belum ada transaksi.</p>}</div>
    </section>
  </>;
}
