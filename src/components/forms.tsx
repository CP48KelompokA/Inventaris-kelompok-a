"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import {
  categoryAction, itemAction, locationAction, loginAction, movementAction, passwordAction,
  deleteCategoryAction, deleteItemAction, deleteLocationAction, resetUserPasswordAction,
  reverseMovementAction, updateCategoryAction, updateItemAction, updateLocationAction,
  updateUserAction, userAction, userStatusAction,
} from "@/app/actions";
import type { FormState } from "@/app/actions";

const initialFormState: FormState = { error: "", success: "" };

function useResetOnSuccess(state: typeof initialFormState) {
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => { if (state.success) formRef.current?.reset(); }, [state]);
  return formRef;
}

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
  const formRef = useResetOnSuccess(state);
  return <form ref={formRef} action={action} className="form-inline">
    <label className="sr-only" htmlFor="category-name">Nama kategori</label>
    <input className="input" id="category-name" name="name" required minLength={2} maxLength={80} placeholder="Contoh: Peralatan kelas" />
    <button className="btn btn-outline btn-primary" disabled={pending}>Tambah</button>
    <Feedback {...state} />
  </form>;
}

export function CategoryManage({ category, itemCount }: { category: { id: string; name: string }; itemCount: number }) {
  const [state, action, pending] = useActionState(updateCategoryAction, initialFormState);
  return <div>
    <form action={action} className="form-inline">
      <input type="hidden" name="id" value={category.id} />
      <label className="sr-only" htmlFor={`category-${category.id}`}>Nama kategori</label>
      <input className="input" id={`category-${category.id}`} name="name" minLength={2} maxLength={80} required defaultValue={category.name} />
      <button className="btn btn-ghost btn-sm" disabled={pending}>Simpan</button>
      <Feedback {...state} />
    </form>
    {itemCount === 0
      ? <DeleteForm id={category.id} action={deleteCategoryAction} label="Hapus kategori" name={category.name} />
      : <span className="muted">Kosongkan kategori dari barang sebelum menghapus.</span>}
  </div>;
}

export function LocationForm() {
  const [state, action, pending] = useActionState(locationAction, initialFormState);
  const formRef = useResetOnSuccess(state);
  return <form ref={formRef} action={action} className="form-inline">
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

export function DeleteForm({ id, action, label, name }: {
  id: string;
  action: (state: typeof initialFormState, form: FormData) => Promise<typeof initialFormState>;
  label: string;
  name: string;
}) {
  const [state, submit, pending] = useActionState(action, initialFormState);
  const [confirming, setConfirming] = useState(false);
  return <form action={submit} className="confirm-actions">
    <input type="hidden" name="id" value={id} />
    {confirming ? <>
      <span role="alert" className="muted">Hapus {name} secara permanen?</span>
      <button type="submit" className="btn btn-error btn-sm" disabled={pending}>{pending ? "Menghapus..." : "Ya, hapus"}</button>
      <button type="button" className="btn btn-ghost btn-sm" onClick={() => setConfirming(false)} disabled={pending}>Batal</button>
    </> : <button type="button" className="btn btn-error btn-outline btn-sm" onClick={() => setConfirming(true)}>{label}</button>}
    <Feedback {...state} />
  </form>;
}

export function LocationDeleteForm({ location }: { location: { id: string; name: string } }) {
  return <DeleteForm id={location.id} action={deleteLocationAction} label="Hapus" name={`lokasi ${location.name}`} />;
}

export function ItemDeleteForm({ item }: { item: { id: string; name: string } }) {
  return <DeleteForm id={item.id} action={deleteItemAction} label="Hapus barang" name={`barang ${item.name}`} />;
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
  const formRef = useResetOnSuccess(item ? initialFormState : state);
  return <form ref={formRef} action={action} className="form-grid">
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
    <MovementFields key={state.revision ?? 0} items={items} pending={pending} />
    <div className="span-2"><Feedback {...state} /></div>
  </form>;
}

function MovementFields({ items, pending }: {
  items: { id: string; code: string; name: string; currentStock: number; unit: string }[];
  pending: boolean;
}) {
  const [selectedId, setSelectedId] = useState("");
  const [type, setType] = useState<"in" | "out">("in");
  const selected = items.find(item => item.id === selectedId);
  const noStock = type === "out" && selected?.currentStock === 0;
  return <>
    <label className="span-2">Barang<select className="select" name="itemId" required value={selectedId} onChange={event => setSelectedId(event.target.value)}><option value="" disabled>Pilih barang</option>{items.map(item => <option key={item.id} value={item.id}>{item.code} · {item.name} (stok {item.currentStock} {item.unit})</option>)}</select></label>
    <label>Jenis transaksi<select className="select" name="type" value={type} onChange={event => setType(event.target.value as "in" | "out")}><option value="in">Barang masuk</option><option value="out">Barang keluar</option></select></label>
    <label>Jumlah<input className="input" name="quantity" type="number" min="1" max={type === "out" ? selected?.currentStock : undefined} step="1" required placeholder="0" /></label>
    {selected && <p className="span-2 muted m-0" role="status">Stok saat ini: {selected.currentStock} {selected.unit}.{type === "out" ? " Jumlah keluar tidak boleh melebihi stok." : ""}</p>}
    {noStock && <p className="span-2 form-feedback alert alert-warning alert-soft" role="alert">Barang ini belum memiliki stok untuk dikeluarkan.</p>}
    <label className="span-2">Keterangan<textarea className="textarea" name="note" rows={2} maxLength={500} placeholder="Contoh: Penerimaan barang / pemakaian ruang" /></label>
    <div className="span-2 form-footer"><button className="btn btn-primary" disabled={pending || noStock}>{pending ? "Mencatat..." : "Catat transaksi"}</button></div>
  </>;
}

export function UserForm() {
  const [state, action, pending] = useActionState(userAction, initialFormState);
  const formRef = useResetOnSuccess(state);
  return <form ref={formRef} action={action} className="form-grid">
    <label>Nama<input className="input" name="name" minLength={2} maxLength={120} required placeholder="Nama staf" /></label>
    <label>Email<input className="input" name="email" type="email" required placeholder="nama@sekolah.sch.id" /></label>
    <label>Peran<select className="select" name="role" defaultValue="staff"><option value="staff">Staf</option><option value="admin">Administrator</option></select></label>
    <label>Kata sandi awal<input className="input" name="password" type="password" minLength={12} maxLength={128} required autoComplete="new-password" /></label>
    <div className="span-2 form-footer"><Feedback {...state} /><button className="btn btn-primary" disabled={pending}>{pending ? "Membuat..." : "Buat akun"}</button></div>
  </form>;
}

export function UserEditForms({ user, currentUserId }: {
  user: { id: string; name: string; role: "admin" | "staff"; active: boolean };
  currentUserId: string;
}) {
  const [editState, edit, editPending] = useActionState(updateUserAction, initialFormState);
  const [statusState, status, statusPending] = useActionState(userStatusAction, initialFormState);
  const [resetState, reset, resetPending] = useActionState(resetUserPasswordAction, initialFormState);
  const resetRef = useResetOnSuccess(resetState);
  const [confirmingStatus, setConfirmingStatus] = useState(false);
  return <div className="management-grid">
    <section className="card border border-base-200 bg-base-100 shadow-sm">
      <h2>Profil dan peran</h2><p className="muted">Ubah nama atau hak akses petugas.</p>
      <form action={edit} className="form-stack">
        <input type="hidden" name="id" value={user.id} />
        <label>Nama<input className="input" name="name" defaultValue={user.name} minLength={2} maxLength={120} required /></label>
        <label>Peran<select className="select" name="role" defaultValue={user.role} disabled={user.id === currentUserId}><option value="admin">Administrator</option><option value="staff">Staf</option></select></label>
        {user.id === currentUserId && <input type="hidden" name="role" value="admin" />}
        {user.id === currentUserId && <p className="muted m-0">Peran akun sendiri tidak dapat diturunkan.</p>}
        <div><button className="btn btn-primary" disabled={editPending}>{editPending ? "Menyimpan..." : "Simpan perubahan"}</button></div><Feedback {...editState} />
      </form>
    </section>
    {user.id !== currentUserId && <div className="form-stack management-side">
      <section className="card border border-base-200 bg-base-100 shadow-sm">
        <h2>Status akun</h2><p className="muted">Akun nonaktif tidak dapat masuk atau menggunakan sesi lama.</p>
        <form action={status} className="form-stack">
          <input type="hidden" name="id" value={user.id} /><input type="hidden" name="active" value={String(!user.active)} />
          {confirmingStatus ? <div className="confirm-actions">
            <span role="alert" className="muted">{user.active ? `Nonaktifkan ${user.name} sekarang?` : `Aktifkan ${user.name} kembali?`}</span>
            <button type="submit" className={`btn ${user.active ? "btn-warning" : "btn-success"}`} disabled={statusPending}>{statusPending ? "Memproses..." : "Ya, lanjutkan"}</button>
            <button type="button" className="btn btn-ghost" onClick={() => setConfirmingStatus(false)} disabled={statusPending}>Batal</button>
          </div> : <div><button type="button" className={`btn ${user.active ? "btn-warning" : "btn-success"}`} onClick={() => setConfirmingStatus(true)}>{user.active ? "Nonaktifkan akun" : "Aktifkan akun"}</button></div>}
          <Feedback {...statusState} />
        </form>
      </section>
      <section className="card border border-base-200 bg-base-100 shadow-sm">
        <h2>Reset kata sandi</h2><p className="muted">Berikan kata sandi baru langsung kepada pemilik akun.</p>
        <form ref={resetRef} action={reset} className="form-stack">
          <input type="hidden" name="id" value={user.id} />
          <label>Kata sandi baru<input className="input" name="password" type="password" minLength={12} maxLength={128} required autoComplete="new-password" /></label>
          <div><button className="btn btn-outline" disabled={resetPending}>Reset kata sandi</button></div><Feedback {...resetState} />
        </form>
      </section>
    </div>}
  </div>;
}

export function ReverseMovementForm({ id }: { id: string }) {
  const [state, action, pending] = useActionState(reverseMovementAction, initialFormState);
  return <form action={action} className="form-stack">
      <input type="hidden" name="id" value={id} />
      <label>Alasan koreksi<textarea className="textarea" name="reason" minLength={5} maxLength={450} required placeholder="Alasan pembatalan transaksi" /></label>
      <div><button className="btn btn-warning" disabled={pending}>{pending ? "Mencatat koreksi..." : "Konfirmasi koreksi"}</button></div><Feedback {...state} />
    </form>;
}

export function PasswordForm() {
  const [state, action, pending] = useActionState(passwordAction, initialFormState);
  const formRef = useResetOnSuccess(state);
  return <form ref={formRef} action={action} className="form-stack">
    <label>Kata sandi saat ini<input className="input" name="currentPassword" type="password" required autoComplete="current-password" /></label>
    <label>Kata sandi baru<input className="input" name="nextPassword" type="password" required minLength={12} autoComplete="new-password" /></label>
    <label>Ulangi kata sandi baru<input className="input" name="confirmPassword" type="password" required minLength={12} autoComplete="new-password" /></label>
    <Feedback {...state} />
    <button className="btn btn-primary" disabled={pending}>{pending ? "Menyimpan..." : "Ganti kata sandi"}</button>
  </form>;
}
