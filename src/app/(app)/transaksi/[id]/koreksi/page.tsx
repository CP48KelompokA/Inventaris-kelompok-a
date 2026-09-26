import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { ReverseMovementForm } from "@/components/forms";
import { requireAdmin } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { getMovement } from "@/lib/inventory";

export default async function CorrectMovementPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const movement = await getMovement(id);
  if (!movement) notFound();
  const blockedByStock = movement.type === "in" && movement.itemStock < movement.quantity;
  return <>
    <div className="page-heading"><div><p className="eyebrow">PERGERAKAN STOK</p><h1>Koreksi transaksi</h1><p className="muted">Periksa transaksi asli sebelum membuat entri pembalik.</p></div><Link className="btn btn-ghost" href="/transaksi">Kembali ke riwayat</Link></div>
    <section className="card narrow-card border border-base-200 bg-base-100 shadow-sm">
      <div className="section-heading"><div><h2>Transaksi asli</h2><p className="muted">{formatDate(movement.createdAt)} · Dicatat oleh {movement.actorName}</p></div></div>
      <dl className="detail-grid">
        <div><dt>Barang</dt><dd>{movement.itemCode} · {movement.itemName}</dd></div>
        <div><dt>Jenis</dt><dd>{movement.type === "in" ? "Barang masuk" : "Barang keluar"}</dd></div>
        <div><dt>Jumlah</dt><dd>{movement.quantity} {movement.unit}</dd></div>
        <div><dt>Stok sekarang</dt><dd>{movement.itemStock} {movement.unit}</dd></div>
        <div className="detail-full"><dt>Keterangan asli</dt><dd>{movement.note || "—"}</dd></div>
      </dl>
    </section>
    <section className="card narrow-card border border-base-200 bg-base-100 shadow-sm">
      <h2>Catat koreksi</h2>
      {movement.reversalOf || movement.reversed
        ? <p className="alert alert-info alert-soft">Transaksi ini sudah merupakan koreksi atau telah dibalik. Riwayatnya tetap tersedia di halaman transaksi.</p>
        : blockedByStock
          ? <p className="alert alert-warning alert-soft">Stok saat ini kurang dari jumlah barang masuk yang ingin dibalik. Koreksi transaksi keluar terkait terlebih dahulu; stok tidak boleh menjadi negatif.</p>
          : <><p className="muted">Sistem mencatat transaksi {movement.type === "in" ? "keluar" : "masuk"} sejumlah {movement.quantity} {movement.unit}. Transaksi asli tidak dihapus.</p><ReverseMovementForm id={movement.id} /></>}
    </section>
  </>;
}
