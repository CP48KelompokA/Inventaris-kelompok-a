import { and, asc, count, desc, eq, gte, ilike, lt, or, sql } from "drizzle-orm";
import { getDb } from "@/db/client";
import { categories, items, locations, movements, users } from "@/db/schema";

export type NewItem = {
  code: string;
  name: string;
  categoryId: string | null;
  locationId: string | null;
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

export async function listLocations() {
  return getDb().select().from(locations).orderBy(asc(locations.name));
}

export async function addLocation(name: string) {
  await getDb().insert(locations).values({ name });
}

export async function updateLocation(id: string, name: string) {
  const [updated] = await getDb().update(locations).set({ name })
    .where(eq(locations.id, id)).returning({ id: locations.id });
  if (!updated) throw new Error("Lokasi tidak ditemukan.");
}

export async function addItem(item: NewItem) {
  await getDb().insert(items).values({ ...item, code: item.code.toUpperCase() });
}

export async function updateItem(id: string, item: NewItem) {
  const [current] = await getDb().select({ code: items.code }).from(items).where(eq(items.id, id));
  if (!current) throw new Error("Barang tidak ditemukan.");
  if (current.code !== item.code.toUpperCase()) throw new Error("Kode barang tidak dapat diubah setelah dibuat.");
  const [updated] = await getDb().update(items)
    .set({ name: item.name, categoryId: item.categoryId, locationId: item.locationId,
      unit: item.unit, minStock: item.minStock, notes: item.notes, updatedAt: new Date() })
    .where(eq(items.id, id)).returning({ id: items.id });
  if (!updated) throw new Error("Barang tidak ditemukan.");
}

const itemColumns = {
  id: items.id,
  code: items.code,
  name: items.name,
  categoryId: items.categoryId,
  locationId: items.locationId,
  category: categories.name,
  location: locations.name,
  unit: items.unit,
  minStock: items.minStock,
  currentStock: items.currentStock,
  notes: items.notes,
};

export async function listItems() {
  return getDb()
    .select(itemColumns)
    .from(items)
    .leftJoin(categories, eq(items.categoryId, categories.id))
    .leftJoin(locations, eq(items.locationId, locations.id))
    .orderBy(asc(items.name));
}

export async function getItem(id: string) {
  const [item] = await getDb().select(itemColumns).from(items)
    .leftJoin(categories, eq(items.categoryId, categories.id))
    .leftJoin(locations, eq(items.locationId, locations.id))
    .where(eq(items.id, id));
  return item;
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

export type MovementFilters = {
  query?: string;
  type?: "in" | "out";
  from?: Date;
  until?: Date;
  page: number;
};

export async function searchMovements(filters: MovementFilters) {
  const terms = [
    filters.query ? or(
      ilike(items.code, `%${filters.query}%`),
      ilike(items.name, `%${filters.query}%`),
      ilike(movements.note, `%${filters.query}%`),
      ilike(users.name, `%${filters.query}%`),
    ) : undefined,
    filters.type ? eq(movements.type, filters.type) : undefined,
    filters.from ? gte(movements.createdAt, filters.from) : undefined,
    filters.until ? lt(movements.createdAt, filters.until) : undefined,
  ];
  const where = and(...terms);
  const db = getDb();
  const [{ total }] = await db.select({ total: count() }).from(movements)
    .innerJoin(items, eq(movements.itemId, items.id))
    .innerJoin(users, eq(movements.actorId, users.id)).where(where);
  const pageSize = 20;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(filters.page, pages);
  const rows = await db.select({
    id: movements.id,
    type: movements.type,
    quantity: movements.quantity,
    note: movements.note,
    createdAt: movements.createdAt,
    itemCode: items.code,
    itemName: items.name,
    actorName: users.name,
  }).from(movements)
    .innerJoin(items, eq(movements.itemId, items.id))
    .innerJoin(users, eq(movements.actorId, users.id))
    .where(where)
    .orderBy(desc(movements.createdAt), desc(movements.id))
    .limit(pageSize).offset((page - 1) * pageSize);
  return { rows, page, pages, total };
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
