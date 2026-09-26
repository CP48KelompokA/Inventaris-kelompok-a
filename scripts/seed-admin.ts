import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { getDb } from "../src/db/client";
import { users } from "../src/db/schema";

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password || password.length < 12) {
    throw new Error("Set ADMIN_EMAIL dan ADMIN_PASSWORD (minimal 12 karakter) di environment.");
  }
  const db = getDb();
  const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email));
  if (existing) {
    console.log("Admin sudah ada. Tidak ada perubahan.");
    return;
  }
  await db.insert(users).values({
    email,
    name: "Administrator",
    role: "admin",
    passwordHash: await hash(password, 12),
  });
  console.log("Akun admin berhasil dibuat.");
}

main().catch(error => { console.error(error.message); process.exitCode = 1; });
