"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { addUser, changePassword, signIn, signOut, requireAdmin, requireUser } from "@/lib/auth";
import { addCategory, addItem, recordMovement } from "@/lib/inventory";

export type FormState = { error: string; success: string };

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});
const categorySchema = z.object({
  name: z.string().trim().min(2).max(80),
});
const itemSchema = z.object({
  code: z.string().trim().min(2).max(40).regex(/^[a-zA-Z0-9._-]+$/),
  name: z.string().trim().min(2).max(160),
  categoryId: z.union([z.uuid(), z.literal("")]),
  location: z.string().trim().max(120),
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

function values(form: FormData) {
  return Object.fromEntries(form.entries());
}

function actionError(error: unknown) {
  const code = (error as { code?: string })?.code;
  if (code === "23505") return "Kode atau nama sudah digunakan.";
  return error instanceof Error ? error.message : "Terjadi kesalahan. Silakan coba lagi.";
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
    revalidatePath("/barang");
    return { error: "", success: "Kategori berhasil ditambahkan." };
  } catch (error) {
    return { error: actionError(error), success: "" };
  }
}

export async function itemAction(_state: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = itemSchema.safeParse(values(form));
  if (!parsed.success) return { error: "Periksa kembali data barang dan kode uniknya.", success: "" };
  try {
    await addItem({ ...parsed.data, categoryId: parsed.data.categoryId || null });
    revalidatePath("/barang");
    revalidatePath("/");
    return { error: "", success: "Barang berhasil ditambahkan." };
  } catch (error) {
    return { error: actionError(error), success: "" };
  }
}

export async function movementAction(_state: FormState, form: FormData): Promise<FormState> {
  const actor = await requireUser();
  const parsed = movementSchema.safeParse(values(form));
  if (!parsed.success) return { error: "Pilih barang dan isi jumlah yang valid.", success: "" };
  try {
    await recordMovement({ ...parsed.data, actorId: actor.id });
    revalidatePath("/");
    revalidatePath("/barang");
    revalidatePath("/transaksi");
    revalidatePath("/laporan");
    return { error: "", success: "Transaksi stok berhasil dicatat." };
  } catch (error) {
    return { error: actionError(error), success: "" };
  }
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
