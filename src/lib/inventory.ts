import { asc, desc, eq, sql } from "drizzle-orm";
import { getDb } from "@/db/client";
import { categories, items, movements, users } from "@/db/schema";

export type NewItem = {
  code: string;
  name: string;
  categoryId: string | null;
  location: string;
  unit: string;
  minStock: number;
  notes: string;
};

export async function listCategories() {
  return getDb().select().from(categories).orderBy(asc(categories.name));
}

export async function addCategory(name: string) {
  await getDb().insert(categories).values({ name });
}

export async function addItem(item: NewItem) {
  await getDb().insert(items).values({ ...item, code: item.code.toUpperCase() });
}

export async function listItems() {
  return getDb()
    .select({
      id: items.id,
      code: items.code,
      name: items.name,
      category: categories.name,
      location: items.location,
      unit: items.unit,
      minStock: items.minStock,
      currentStock: items.currentStock,
      notes: items.notes,
    })
    .from(items)
    .leftJoin(categories, eq(items.categoryId, categories.id))
    .orderBy(asc(items.name));
}

export async function listMovements(limit = 100) {
  return getDb()
    .select({
      id: movements.id,
      type: movements.type,
      quantity: movements.quantity,
      note: movements.note,
      createdAt: movements.createdAt,
      itemCode: items.code,
      itemName: items.name,
      actorName: users.name,
    })
    .from(movements)
    .innerJoin(items, eq(movements.itemId, items.id))
    .innerJoin(users, eq(movements.actorId, users.id))
    .orderBy(desc(movements.createdAt))
    .limit(limit);
}

export async function recordMovement(input: {
  itemId: string;
  actorId: string;
  type: "in" | "out";
  quantity: number;
  note: string;
}) {
  await getDb().transaction(async (tx) => {
    // Serialize updates to the same item so simultaneous withdrawals stay correct.
    await tx.execute(sql`SELECT id FROM items WHERE id = ${input.itemId} FOR UPDATE`);
    const [item] = await tx.select().from(items).where(eq(items.id, input.itemId));
    if (!item) throw new Error("Barang tidak ditemukan.");

    const nextStock =
      item.currentStock + (input.type === "in" ? input.quantity : -input.quantity);
    if (nextStock < 0) throw new Error("Jumlah keluar melebihi stok tersedia.");

    await tx.update(items)
      .set({ currentStock: nextStock, updatedAt: new Date() })
      .where(eq(items.id, input.itemId));
    await tx.insert(movements).values(input);
  });
}
