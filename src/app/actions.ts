"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { addUser, changePassword, resetUserPassword, setUserActive, signIn, signOut, requireAdmin, requireUser, updateUser } from "@/lib/auth";
import { addCategory, addItem, addLocation, deleteCategory, deleteItem, deleteLocation, recordMovement, reverseMovement, updateCategory, updateItem, updateLocation } from "@/lib/inventory";

export type FormState = { error: string; success: string; revision?: number };

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});
const categorySchema = z.object({
  name: z.string().trim().min(2).max(80),
});
const locationSchema = z.object({
  name: z.string().trim().min(2).max(120),
});
const itemSchema = z.object({
  code: z.string().trim().min(2).max(40).regex(/^[a-zA-Z0-9._-]+$/),
  name: z.string().trim().min(2).max(160),
  categoryId: z.union([z.uuid(), z.literal("")]),
  locationId: z.union([z.uuid(), z.literal("")]),
  unit: z.string().trim().min(1).max(30),
  minStock: z.coerce.number<number>().int().min(0),
  notes: z.string().trim().max(500),
});
const movementSchema = z.object({
  itemId: z.uuid(),
  type: z.enum(["in", "out"]),
  quantity: z.coerce.number<number>().int().positive(),
  note: z.string().trim().max(500),
});
const userSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.email(),
  password: z.string().min(12).max(128),
  role: z.enum(["admin", "staff"]),
});
const passwordSchema = z.object({
  currentPassword: z.string().min(1),
  nextPassword: z.string().min(12).max(128),
  confirmPassword: z.string().min(1),
}).refine(data => data.nextPassword === data.confirmPassword, {
  message: "Konfirmasi kata sandi tidak cocok.",
});
const userEditSchema = z.object({ name: z.string().trim().min(2).max(120), role: z.enum(["admin", "staff"]) });
const reasonSchema = z.string().trim().min(5).max(450);

function values(form: FormData) {
  return Object.fromEntries(form.entries());
}

function actionError(error: unknown) {
  const dbError = error as { code?: string; cause?: { code?: string } } | null;
  const code = dbError?.code ?? dbError?.cause?.code;
  if (code === "23505") return "Kode atau nama sudah digunakan.";
  if (code === "23503") return "Data masih digunakan sehingga tidak dapat dihapus, atau pilihan terkait tidak tersedia.";
  if (code === "23514") return "Operasi ditolak karena melanggar aturan stok.";
  const safeMessages = new Set([
    "Kategori tidak ditemukan.", "Kategori masih digunakan oleh barang.", "Lokasi tidak ditemukan.", "Barang tidak ditemukan.",
    "Barang tidak ditemukan atau stoknya belum nol.", "Jumlah transaksi harus bilangan bulat positif.",
    "Jumlah keluar melebihi stok tersedia.", "Jumlah stok terlalu besar.",
    "Kode barang tidak dapat diubah setelah dibuat.", "Transaksi tidak ditemukan.",
    "Transaksi koreksi tidak dapat dibatalkan lagi.", "Transaksi ini sudah dikoreksi.",
    "Pengguna tidak ditemukan.", "Anda tidak dapat menurunkan peran sendiri.",
    "Anda tidak dapat menonaktifkan akun sendiri.", "Minimal satu administrator aktif harus tersedia.",
    "Gunakan halaman Akun untuk mengganti kata sandi sendiri.", "Kata sandi saat ini salah.",
  ]);
  if (error instanceof Error && safeMessages.has(error.message)) return error.message;
  return "Terjadi kesalahan. Silakan coba lagi.";
}

export async function loginAction(_state: FormState, form: FormData): Promise<FormState> {
  const parsed = loginSchema.safeParse(values(form));
  if (!parsed.success) return { error: "Isi email dan kata sandi yang valid.", success: "" };
  try {
    if (!(await signIn(parsed.data.email, parsed.data.password))) {
      return { error: "Email atau kata sandi salah.", success: "" };
    }
  } catch {
    return { error: "Login belum tersedia. Hubungi administrator.", success: "" };
  }
  redirect("/");
}

export async function logoutAction() {
  await signOut();
  redirect("/login");
}

export async function categoryAction(_state: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = categorySchema.safeParse(values(form));
  if (!parsed.success) return { error: "Nama kategori minimal 2 karakter.", success: "" };
  try {
    await addCategory(parsed.data.name);
    revalidatePath("/kategori");
    revalidatePath("/barang");
    return { error: "", success: "Kategori berhasil ditambahkan." };
  } catch (error) {
    return { error: actionError(error), success: "" };
  }
}

export async function updateCategoryAction(_state: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const id = z.uuid().safeParse(form.get("id"));
  const parsed = categorySchema.safeParse(values(form));
  if (!id.success || !parsed.success) return { error: "Nama kategori harus 2–80 karakter.", success: "" };
  try {
    await updateCategory(id.data, parsed.data.name);
    revalidatePath("/kategori");
    revalidatePath("/barang");
    revalidatePath("/laporan");
    return { error: "", success: "Kategori diperbarui." };
  } catch (error) { return { error: actionError(error), success: "" }; }
}

export async function deleteCategoryAction(_state: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const id = z.uuid().safeParse(form.get("id"));
  if (!id.success) return { error: "Kategori tidak valid.", success: "" };
  try {
    await deleteCategory(id.data);
    revalidatePath("/kategori");
    revalidatePath("/barang");
    return { error: "", success: "Kategori kosong berhasil dihapus." };
  } catch (error) { return { error: actionError(error), success: "" }; }
}

export async function locationAction(_state: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = locationSchema.safeParse(values(form));
  if (!parsed.success) return { error: "Nama lokasi harus 2–120 karakter.", success: "" };
  try {
    await addLocation(parsed.data.name);
    revalidatePath("/lokasi");
    revalidatePath("/barang");
    return { error: "", success: "Lokasi berhasil ditambahkan." };
  } catch (error) {
    return { error: actionError(error), success: "" };
  }
}

export async function updateLocationAction(_state: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const id = z.uuid().safeParse(form.get("id"));
  const parsed = locationSchema.safeParse(values(form));
  if (!id.success || !parsed.success) return { error: "Nama lokasi harus 2–120 karakter.", success: "" };
  try {
    await updateLocation(id.data, parsed.data.name);
    revalidatePath("/lokasi");
    revalidatePath("/barang");
    revalidatePath("/laporan");
    return { error: "", success: "Lokasi berhasil diperbarui." };
  } catch (error) {
    return { error: actionError(error), success: "" };
  }
}

export async function deleteLocationAction(_state: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const id = z.uuid().safeParse(form.get("id"));
  if (!id.success) return { error: "Lokasi tidak valid.", success: "" };
  try {
    await deleteLocation(id.data);
    revalidatePath("/lokasi");
    return { error: "", success: "Lokasi kosong berhasil dihapus." };
  } catch (error) { return { error: actionError(error), success: "" }; }
}

export async function itemAction(_state: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = itemSchema.safeParse(values(form));
  if (!parsed.success) return { error: "Periksa kembali data barang dan kode uniknya.", success: "" };
  try {
    await addItem({ ...parsed.data, categoryId: parsed.data.categoryId || null, locationId: parsed.data.locationId || null });
    revalidatePath("/barang");
    revalidatePath("/");
    return { error: "", success: "Barang berhasil ditambahkan." };
  } catch (error) {
    return { error: actionError(error), success: "" };
  }
}

export async function updateItemAction(_state: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const id = z.uuid().safeParse(form.get("id"));
  const parsed = itemSchema.safeParse(values(form));
  if (!id.success || !parsed.success) return { error: "Periksa kembali data barang.", success: "" };
  try {
    await updateItem(id.data, {
      ...parsed.data,
      categoryId: parsed.data.categoryId || null,
      locationId: parsed.data.locationId || null,
    });
    revalidatePath("/barang");
    revalidatePath(`/barang/${id.data}/edit`);
    revalidatePath("/laporan");
    revalidatePath("/transaksi");
    revalidatePath("/");
    return { error: "", success: "Barang berhasil diperbarui. Stok tidak berubah." };
  } catch (error) {
    return { error: actionError(error), success: "" };
  }
}

export async function deleteItemAction(_state: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const id = z.uuid().safeParse(form.get("id"));
  if (!id.success) return { error: "Barang tidak valid.", success: "" };
  try {
    await deleteItem(id.data);
    revalidatePath("/barang");
    revalidatePath("/");
  } catch (error) { return { error: actionError(error), success: "" }; }
  redirect("/barang");
}

export async function movementAction(state: FormState, form: FormData): Promise<FormState> {
  const actor = await requireUser();
  const parsed = movementSchema.safeParse(values(form));
  if (!parsed.success) return { error: "Pilih barang dan isi jumlah yang valid.", success: "" };
  try {
    await recordMovement({ ...parsed.data, actorId: actor.id });
    revalidatePath("/");
    revalidatePath("/barang");
    revalidatePath("/transaksi");
    revalidatePath("/laporan");
    return { error: "", success: "Transaksi stok berhasil dicatat.", revision: (state.revision ?? 0) + 1 };
  } catch (error) {
    return { error: actionError(error), success: "" };
  }
}

export async function reverseMovementAction(_state: FormState, form: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  const id = z.uuid().safeParse(form.get("id"));
  const reason = reasonSchema.safeParse(form.get("reason"));
  if (!id.success || !reason.success) return { error: "Alasan koreksi minimal 5 karakter.", success: "" };
  try {
    await reverseMovement(id.data, admin.id, reason.data);
    for (const path of ["/", "/barang", "/transaksi", "/laporan"]) revalidatePath(path);
    revalidatePath(`/transaksi/${id.data}/koreksi`);
    return { error: "", success: "Transaksi dibalik; catatan asli tetap tersimpan." };
  } catch (error) { return { error: actionError(error), success: "" }; }
}

export async function userAction(_state: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = userSchema.safeParse(values(form));
  if (!parsed.success) return { error: "Periksa nama, email, dan kata sandi minimal 12 karakter.", success: "" };
  try {
    await addUser(parsed.data);
    revalidatePath("/pengguna");
    return { error: "", success: "Akun pengguna berhasil dibuat." };
  } catch (error) {
    return { error: actionError(error), success: "" };
  }
}

export async function updateUserAction(_state: FormState, form: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  const id = z.uuid().safeParse(form.get("id"));
  const parsed = userEditSchema.safeParse(values(form));
  if (!id.success || !parsed.success) return { error: "Nama atau peran tidak valid.", success: "" };
  try {
    await updateUser(id.data, admin.id, parsed.data);
    revalidatePath("/pengguna");
    revalidatePath(`/pengguna/${id.data}`);
    return { error: "", success: "Pengguna diperbarui." };
  } catch (error) { return { error: actionError(error), success: "" }; }
}

export async function userStatusAction(_state: FormState, form: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  const id = z.uuid().safeParse(form.get("id"));
  const active = z.enum(["true", "false"]).safeParse(form.get("active"));
  if (!id.success || !active.success) return { error: "Permintaan tidak valid.", success: "" };
  try {
    await setUserActive(id.data, admin.id, active.data === "true");
    revalidatePath("/pengguna");
    revalidatePath(`/pengguna/${id.data}`);
    return { error: "", success: active.data === "true" ? "Akun diaktifkan." : "Akun dinonaktifkan." };
  } catch (error) { return { error: actionError(error), success: "" }; }
}

export async function resetUserPasswordAction(_state: FormState, form: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  const id = z.uuid().safeParse(form.get("id"));
  const password = z.string().min(12).max(128).safeParse(form.get("password"));
  if (!id.success || !password.success) return { error: "Kata sandi baru minimal 12 karakter.", success: "" };
  try {
    await resetUserPassword(id.data, admin.id, password.data);
    return { error: "", success: "Kata sandi pengguna direset. Sampaikan langsung kepada pemilik akun." };
  } catch (error) { return { error: actionError(error), success: "" }; }
}

export async function passwordAction(_state: FormState, form: FormData): Promise<FormState> {
  await requireUser();
  const parsed = passwordSchema.safeParse(values(form));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Periksa kata sandi baru.", success: "" };
  try {
    await changePassword(parsed.data.currentPassword, parsed.data.nextPassword);
    return { error: "", success: "Kata sandi berhasil diperbarui." };
  } catch (error) {
    return { error: actionError(error), success: "" };
  }
}
