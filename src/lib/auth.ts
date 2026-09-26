import { compare, hash } from "bcryptjs";
import { and, count, eq, sql } from "drizzle-orm";
import { SignJWT, jwtVerify } from "jose";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getDb } from "@/db/client";
import { users } from "@/db/schema";

const COOKIE_NAME = "inventaris_session";
const SESSION_AGE = 60 * 60 * 8;

function sessionKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET harus berisi minimal 32 karakter.");
  }
  return new TextEncoder().encode(secret);
}

export async function signIn(email: string, password: string) {
  const [user] = await getDb().select().from(users).where(eq(users.email, email.toLowerCase()));
  if (!user || !user.active || !(await compare(password, user.passwordHash))) return false;

  const token = await new SignJWT({ role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_AGE}s`)
    .sign(sessionKey());

  (await cookies()).set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_AGE,
  });
  return true;
}

export async function signOut() {
  (await cookies()).delete(COOKIE_NAME);
}

export const currentUser = cache(async function currentUser() {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, sessionKey(), { algorithms: ["HS256"] });
    if (!payload.sub) return null;
    const [user] = await getDb()
      .select({ id: users.id, email: users.email, name: users.name, role: users.role })
      .from(users)
      .where(and(eq(users.id, payload.sub), eq(users.active, true)));
    return user ?? null;
  } catch {
    return null;
  }
});

export async function requireUser() {
  const user = await currentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "admin") throw new Error("Akses hanya untuk admin.");
  return user;
}

export async function listUsers() {
  await requireAdmin();
  return getDb()
    .select({ id: users.id, name: users.name, email: users.email, role: users.role, active: users.active })
    .from(users);
}

export async function getUserForAdmin(id: string) {
  await requireAdmin();
  const [user] = await getDb().select({ id: users.id, name: users.name,
    email: users.email, role: users.role, active: users.active })
    .from(users).where(eq(users.id, id));
  return user;
}

export async function addUser(input: {
  name: string;
  email: string;
  password: string;
  role: "admin" | "staff";
}) {
  await requireAdmin();
  await getDb().insert(users).values({
    name: input.name,
    email: input.email.toLowerCase(),
    passwordHash: await hash(input.password, 12),
    role: input.role,
  });
}

export async function updateUser(id: string, actorId: string, input: { name: string; role: "admin" | "staff" }) {
  await getDb().transaction(async (tx) => {
    await tx.execute(sql`SELECT pg_advisory_xact_lock(48, 1)`);
    const [target] = await tx.select().from(users).where(eq(users.id, id));
    if (!target) throw new Error("Pengguna tidak ditemukan.");
    if (id === actorId && input.role !== "admin") throw new Error("Anda tidak dapat menurunkan peran sendiri.");
    if (target.active && target.role === "admin" && input.role !== "admin") {
      const [{ total }] = await tx.select({ total: count() }).from(users)
        .where(and(eq(users.role, "admin"), eq(users.active, true)));
      if (total <= 1) throw new Error("Minimal satu administrator aktif harus tersedia.");
    }
    await tx.update(users).set(input).where(eq(users.id, id));
  });
}

export async function setUserActive(id: string, actorId: string, active: boolean) {
  if (id === actorId) throw new Error("Anda tidak dapat menonaktifkan akun sendiri.");
  await getDb().transaction(async (tx) => {
    await tx.execute(sql`SELECT pg_advisory_xact_lock(48, 1)`);
    const [target] = await tx.select().from(users).where(eq(users.id, id));
    if (!target) throw new Error("Pengguna tidak ditemukan.");
    if (!active && target.active && target.role === "admin") {
      const [{ total }] = await tx.select({ total: count() }).from(users)
        .where(and(eq(users.role, "admin"), eq(users.active, true)));
      if (total <= 1) throw new Error("Minimal satu administrator aktif harus tersedia.");
    }
    await tx.update(users).set({ active }).where(eq(users.id, id));
  });
}

export async function resetUserPassword(id: string, actorId: string, password: string) {
  if (id === actorId) throw new Error("Gunakan halaman Akun untuk mengganti kata sandi sendiri.");
  const [updated] = await getDb().update(users).set({ passwordHash: await hash(password, 12) })
    .where(eq(users.id, id)).returning({ id: users.id });
  if (!updated) throw new Error("Pengguna tidak ditemukan.");
}

export async function changePassword(currentPassword: string, nextPassword: string) {
  const session = await requireUser();
  const [user] = await getDb().select().from(users).where(eq(users.id, session.id));
  if (!user || !(await compare(currentPassword, user.passwordHash))) {
    throw new Error("Kata sandi saat ini salah.");
  }
  await getDb().update(users)
    .set({ passwordHash: await hash(nextPassword, 12) })
    .where(eq(users.id, user.id));
}
