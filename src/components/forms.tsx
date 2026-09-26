"use client";

import { useActionState } from "react";
import {
  categoryAction, itemAction, locationAction, loginAction, movementAction, passwordAction,
  updateItemAction, updateLocationAction, userAction,
} from "@/app/actions";

const initialFormState = { error: "", success: "" };

function Feedback({ error, success }: { error: string; success: string }) {
  if (error) return <p className="form-feedback alert alert-error alert-soft" role="alert">{error}</p>;
  if (success) return <p className="form-feedback alert alert-success alert-soft" role="status">{success}</p>;
  return null;
}

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, initialFormState);
  return <form action={action} className="form-stack">
    <label>Email<input className="input" name="email" type="email" autoComplete="username" required placeholder="nama@sekolah.sch.id" /></label>
    <label>Kata sandi<input className="input" name="password" type="password" autoComplete="current-password" required placeholder="Masukkan kata sandi" /></label>
    <Feedback {...state} />
    <button className="btn btn-primary w-full" disabled={pending}>{pending ? "Memproses..." : "Masuk"}</button>
  </form>;
}

export function CategoryForm() {
  const [state, action, pending] = useActionState(categoryAction, initialFormState);
  return <form action={action} className="form-inline">
    <label className="sr-only" htmlFor="category-name">Nama kategori</label>
    <input className="input" id="category-name" name="name" required minLength={2} maxLength={80} placeholder="Contoh: Peralatan kelas" />
    <button className="btn btn-outline btn-primary" disabled={pending}>Tambah</button>
    <Feedback {...state} />
  </form>;
}

export function LocationForm() {
  const [state, action, pending] = useActionState(locationAction, initialFormState);
  return <form action={action} className="form-inline">
    <label className="sr-only" htmlFor="location-name">Nama lokasi</label>
    <input className="input" id="location-name" name="name" required minLength={2} maxLength={120} placeholder="Contoh: Ruang guru" />
    <button className="btn btn-outline btn-primary" disabled={pending}>Tambah</button>
    <Feedback {...state} />
  </form>;
}

export function LocationRenameForm({ location }: { location: { id: string; name: string } }) {
  const [state, action, pending] = useActionState(updateLocationAction, initialFormState);
  return <form action={action} className="form-inline">
    <input type="hidden" name="id" value={location.id} />
    <label className="sr-only" htmlFor={`location-${location.id}`}>Nama lokasi {location.name}</label>
    <input className="input" id={`location-${location.id}`} name="name" required minLength={2} maxLength={120} defaultValue={location.name} />
    <button className="btn btn-ghost btn-sm" disabled={pending}>{pending ? "Menyimpan..." : "Simpan"}</button>
    <Feedback {...state} />
  </form>;
}

type ItemFields = {
  id: string;
  code: string;
  name: string;
  categoryId: string | null;
  locationId: string | null;
  unit: string;
  minStock: number;
  notes: string;
};

export function ItemForm({ categories, locations, item }: {
  categories: { id: string; name: string }[];
  locations: { id: string; name: string }[];
  item?: ItemFields;
}) {
  const [state, action, pending] = useActionState(item ? updateItemAction : itemAction, initialFormState);
  return <form action={action} className="form-grid">
    {item && <input type="hidden" name="id" value={item.id} />}
    <label>Kode barang<input className="input" name="code" required minLength={2} maxLength={40} defaultValue={item?.code} readOnly={Boolean(item)} placeholder="BRG-001" /></label>
    <label>Nama barang<input className="input" name="name" required minLength={2} maxLength={160} defaultValue={item?.name} placeholder="Contoh: Proyektor" /></label>
    <label>Kategori<select className="select" name="categoryId" defaultValue={item?.categoryId ?? ""}><option value="">Tanpa kategori</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
    <label>Lokasi<select className="select" name="locationId" defaultValue={item?.locationId ?? ""}><option value="">Belum ditentukan</option>{locations.map(location => <option key={location.id} value={location.id}>{location.name}</option>)}</select></label>
    <label>Satuan<input className="input" name="unit" required defaultValue={item?.unit ?? "unit"} maxLength={30} /></label>
    <label>Stok minimum<input className="input" name="minStock" type="number" min="0" step="1" defaultValue={item?.minStock ?? 0} required /></label>
    <label className="span-2">Catatan<textarea className="textarea" name="notes" rows={2} maxLength={500} defaultValue={item?.notes} placeholder="Keterangan tambahan (opsional)" /></label>
    <div className="span-2 form-footer"><Feedback {...state} /><button className="btn btn-primary" disabled={pending}>{pending ? "Menyimpan..." : item ? "Simpan perubahan" : "Simpan barang"}</button></div>
  </form>;
}

export function MovementForm({ items }: { items: { id: string; code: string; name: string; currentStock: number; unit: string }[] }) {
  const [state, action, pending] = useActionState(movementAction, initialFormState);
  return <form action={action} className="form-grid">
    <label className="span-2">Barang<select className="select" name="itemId" required defaultValue=""><option value="" disabled>Pilih barang</option>{items.map(item => <option key={item.id} value={item.id}>{item.code} · {item.name} (stok {item.currentStock} {item.unit})</option>)}</select></label>
    <label>Jenis transaksi<select className="select" name="type" defaultValue="in"><option value="in">Barang masuk</option><option value="out">Barang keluar</option></select></label>
    <label>Jumlah<input className="input" name="quantity" type="number" min="1" step="1" required placeholder="0" /></label>
    <label className="span-2">Keterangan<textarea className="textarea" name="note" rows={2} maxLength={500} placeholder="Contoh: Penerimaan barang / pemakaian ruang" /></label>
    <div className="span-2 form-footer"><Feedback {...state} /><button className="btn btn-primary" disabled={pending}>{pending ? "Mencatat..." : "Catat transaksi"}</button></div>
  </form>;
}

export function UserForm() {
  const [state, action, pending] = useActionState(userAction, initialFormState);
  return <form action={action} className="form-grid">
    <label>Nama<input className="input" name="name" minLength={2} maxLength={120} required placeholder="Nama staf" /></label>
    <label>Email<input className="input" name="email" type="email" required placeholder="nama@sekolah.sch.id" /></label>
    <label>Peran<select className="select" name="role" defaultValue="staff"><option value="staff">Staf</option><option value="admin">Administrator</option></select></label>
    <label>Kata sandi awal<input className="input" name="password" type="password" minLength={12} maxLength={128} required autoComplete="new-password" /></label>
    <div className="span-2 form-footer"><Feedback {...state} /><button className="btn btn-primary" disabled={pending}>{pending ? "Membuat..." : "Buat akun"}</button></div>
  </form>;
}

export function PasswordForm() {
  const [state, action, pending] = useActionState(passwordAction, initialFormState);
  return <form action={action} className="form-stack">
    <label>Kata sandi saat ini<input className="input" name="currentPassword" type="password" required autoComplete="current-password" /></label>
    <label>Kata sandi baru<input className="input" name="nextPassword" type="password" required minLength={12} autoComplete="new-password" /></label>
    <label>Ulangi kata sandi baru<input className="input" name="confirmPassword" type="password" required minLength={12} autoComplete="new-password" /></label>
    <Feedback {...state} />
    <button className="btn btn-primary" disabled={pending}>{pending ? "Menyimpan..." : "Ganti kata sandi"}</button>
  </form>;
}
