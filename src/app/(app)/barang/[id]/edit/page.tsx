import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { ItemForm } from "@/components/forms";
import { requireAdmin } from "@/lib/auth";
import { getItem, listCategories, listLocations } from "@/lib/inventory";

export default async function EditItemPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const [item, categories, locations] = await Promise.all([
    getItem(id), listCategories(), listLocations(),
  ]);
  if (!item) notFound();

  return <>
    <div className="page-heading"><div><p className="eyebrow">MASTER DATA</p><h1>Edit barang</h1><p className="muted">{item.code} · {item.name}</p></div><Link className="btn btn-ghost" href="/barang">Kembali</Link></div>
    <section className="card narrow-card border border-base-200 bg-base-100 shadow-sm">
      <div className="section-heading"><div><h2>Informasi barang</h2><p className="muted">Stok saat ini {item.currentStock} {item.unit}. Stok diubah melalui Transaksi; kode barang tetap agar riwayat konsisten.</p></div></div>
      <ItemForm categories={categories} locations={locations} item={item} />
    </section>
  </>;
}
