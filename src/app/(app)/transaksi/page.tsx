import Link from "next/link";
import { ArrowDownLeft, ArrowUpRight, Search } from "lucide-react";
import { MovementForm } from "@/components/forms";
import { Pagination } from "@/components/pagination";
import { requireUser } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { listItemOptions, searchMovements } from "@/lib/inventory";
import { parsePage } from "@/lib/pagination";

type HistoryParams = { q?: string; type?: string; from?: string; to?: string; page?: string };

function validDate(value: string | undefined) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const date = new Date(`${value}T00:00:00+07:00`);
  return !Number.isNaN(date.getTime()) && new Date(date.getTime() + 7 * 60 * 60 * 1000).toISOString().slice(0, 10) === value
    ? date : undefined;
}

export default async function TransactionsPage({ searchParams }: { searchParams: Promise<HistoryParams> }) {
  const params = await searchParams;
  const from = validDate(params.from);
  const to = validDate(params.to);
  const query = typeof params.q === "string" ? params.q.trim().slice(0, 100) : "";
  const type = params.type === "in" || params.type === "out" ? params.type : undefined;
  const page = parsePage(params.page);
  const user = await requireUser();
  const [items, history] = await Promise.all([
    listItemOptions(),
    searchMovements({
      query, type,
      from,
      until: to ? new Date(to.getTime() + 24 * 60 * 60 * 1000) : undefined,
      page,
    }),
  ]);
  return <>
    <div className="page-heading"><div><p className="eyebrow">PERGERAKAN STOK</p><h1>Transaksi barang</h1><p className="muted">Setiap barang masuk dan keluar tercatat bersama pelakunya.</p></div></div>
    <section className="card narrow-card border border-base-200 bg-base-100 shadow-sm">
      <div className="section-heading"><div><h2>Catat transaksi baru</h2><p className="muted">Barang keluar tidak dapat melebihi stok tersedia.</p></div></div>
      {items.length ? <MovementForm items={items} /> : <p className="muted">Tambahkan barang terlebih dahulu sebelum mencatat transaksi.</p>}
    </section>
    <section className="card table-card border border-base-200 bg-base-100 shadow-sm">
      <div className="section-heading"><div><h2>Riwayat transaksi</h2><p className="muted">{history.total} transaksi ditemukan. Waktu mengikuti WIB.</p></div></div>
      <form method="get" className="form-grid px-6 pb-5">
        <label className="span-2">Cari barang, petugas, atau keterangan<input className="input" name="q" maxLength={100} defaultValue={query} placeholder="Cari riwayat" /></label>
        <label>Jenis<select className="select" name="type" defaultValue={type ?? ""}><option value="">Semua</option><option value="in">Masuk</option><option value="out">Keluar</option></select></label>
        <label>Dari tanggal<input className="input" type="date" name="from" defaultValue={params.from ?? ""} /></label>
        <label>Sampai tanggal<input className="input" type="date" name="to" defaultValue={params.to ?? ""} /></label>
        <div className="form-footer"><button className="btn btn-primary" type="submit"><Search size={16} /> Terapkan</button><Link className="btn btn-ghost" href="/transaksi">Reset</Link></div>
      </form>
      <div className="table-scroll"><table className="table table-zebra"><thead><tr><th>Waktu</th><th>Barang</th><th>Jenis</th><th>Jumlah</th><th>Keterangan</th><th>Dicatat oleh</th>{user.role === "admin" && <th>Aksi</th>}</tr></thead>
        <tbody>{history.rows.map(row => <tr key={row.id}><td>{formatDate(row.createdAt)}</td><td><strong>{row.itemName}</strong><small className="cell-note mono">{row.itemCode}</small></td><td><span className={`movement-label ${row.type}`}>{row.type === "in" ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}{row.type === "in" ? "Masuk" : "Keluar"}</span></td><td><strong>{row.type === "in" ? "+" : "−"}{row.quantity}</strong></td><td>{row.note || "—"}{row.reversalOf && <small className="cell-note">Entri koreksi</small>}{row.reversed && <small className="cell-note">Sudah dibalik</small>}</td><td>{row.actorName}</td>{user.role === "admin" && <td>{!row.reversalOf && !row.reversed && <Link className="btn btn-ghost btn-sm" href={`/transaksi/${row.id}/koreksi`}>Koreksi</Link>}</td>}</tr>)}</tbody>
      </table>{history.rows.length === 0 && <p className="table-empty">Tidak ada transaksi yang cocok.</p>}</div>
      <Pagination path="/transaksi" {...history} filters={{ q: query, type, from: from ? params.from : undefined, to: to ? params.to : undefined }} />
    </section>
  </>;
}
