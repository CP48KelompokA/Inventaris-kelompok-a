import { compare, hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { SignJWT, jwtVerify } from "jose";
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
  if (!user || !(await compare(password, user.passwordHash))) return false;

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

export async function currentUser() {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, sessionKey(), { algorithms: ["HS256"] });
    if (!payload.sub) return null;
    const [user] = await getDb()
      .select({ id: users.id, email: users.email, name: users.name, role: users.role })
      .from(users)
      .where(eq(users.id, payload.sub));
    return user ?? null;
  } catch {
    return null;
  }
}

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
    .select({ id: users.id, name: users.name, email: users.email, role: users.role })
    .from(users);
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
