"use client";

import { useActionState } from "react";
import {
  categoryAction, itemAction, loginAction, movementAction, userAction,
} from "@/app/actions";

const initialFormState = { error: "", success: "" };

function Feedback({ error, success }: { error: string; success: string }) {
  if (error) return <p className="form-feedback error" role="alert">{error}</p>;
  if (success) return <p className="form-feedback success" role="status">{success}</p>;
  return null;
}

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, initialFormState);
  return <form action={action} className="form-stack">
    <label>Email<input name="email" type="email" autoComplete="username" required placeholder="nama@sekolah.sch.id" /></label>
    <label>Kata sandi<input name="password" type="password" autoComplete="current-password" required placeholder="Masukkan kata sandi" /></label>
    <Feedback {...state} />
    <button className="button primary full" disabled={pending}>{pending ? "Memproses..." : "Masuk"}</button>
  </form>;
}

export function CategoryForm() {
  const [state, action, pending] = useActionState(categoryAction, initialFormState);
  return <form action={action} className="form-inline">
    <label className="sr-only" htmlFor="category-name">Nama kategori</label>
    <input id="category-name" name="name" required minLength={2} maxLength={80} placeholder="Contoh: Peralatan kelas" />
    <button className="button secondary" disabled={pending}>Tambah</button>
    <Feedback {...state} />
  </form>;
}

export function ItemForm({ categories }: { categories: { id: string; name: string }[] }) {
  const [state, action, pending] = useActionState(itemAction, initialFormState);
  return <form action={action} className="form-grid">
    <label>Kode barang<input name="code" required maxLength={40} placeholder="BRG-001" /></label>
    <label>Nama barang<input name="name" required maxLength={160} placeholder="Contoh: Proyektor" /></label>
    <label>Kategori<select name="categoryId" defaultValue=""><option value="">Tanpa kategori</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
    <label>Lokasi<input name="location" maxLength={120} placeholder="Contoh: Ruang guru" /></label>
    <label>Satuan<input name="unit" required defaultValue="unit" maxLength={30} /></label>
    <label>Stok minimum<input name="minStock" type="number" min="0" defaultValue="0" required /></label>
    <label className="span-2">Catatan<textarea name="notes" rows={2} maxLength={500} placeholder="Keterangan tambahan (opsional)" /></label>
    <div className="span-2 form-footer"><Feedback {...state} /><button className="button primary" disabled={pending}>{pending ? "Menyimpan..." : "Simpan barang"}</button></div>
  </form>;
}

export function MovementForm({ items }: { items: { id: string; code: string; name: string; currentStock: number; unit: string }[] }) {
  const [state, action, pending] = useActionState(movementAction, initialFormState);
  return <form action={action} className="form-grid">
    <label className="span-2">Barang<select name="itemId" required defaultValue=""><option value="" disabled>Pilih barang</option>{items.map(item => <option key={item.id} value={item.id}>{item.code} · {item.name} (stok {item.currentStock} {item.unit})</option>)}</select></label>
    <label>Jenis transaksi<select name="type" defaultValue="in"><option value="in">Barang masuk</option><option value="out">Barang keluar</option></select></label>
    <label>Jumlah<input name="quantity" type="number" min="1" step="1" required placeholder="0" /></label>
    <label className="span-2">Keterangan<textarea name="note" rows={2} maxLength={500} placeholder="Contoh: Penerimaan barang / pemakaian ruang" /></label>
    <div className="span-2 form-footer"><Feedback {...state} /><button className="button primary" disabled={pending}>{pending ? "Mencatat..." : "Catat transaksi"}</button></div>
  </form>;
}

export function UserForm() {
  const [state, action, pending] = useActionState(userAction, initialFormState);
  return <form action={action} className="form-grid">
    <label>Nama<input name="name" minLength={2} maxLength={120} required placeholder="Nama staf" /></label>
    <label>Email<input name="email" type="email" required placeholder="nama@sekolah.sch.id" /></label>
    <label>Peran<select name="role" defaultValue="staff"><option value="staff">Staf</option><option value="admin">Administrator</option></select></label>
    <label>Kata sandi awal<input name="password" type="password" minLength={12} maxLength={128} required autoComplete="new-password" /></label>
    <div className="span-2 form-footer"><Feedback {...state} /><button className="button primary" disabled={pending}>{pending ? "Membuat..." : "Buat akun"}</button></div>
  </form>;
}
