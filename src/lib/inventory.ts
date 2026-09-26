import { and, asc, count, desc, eq, gte, ilike, lt, or, sql } from "drizzle-orm";
import { getDb } from "@/db/client";
import { categories, items, locations, movements, users } from "@/db/schema";
import { nextStock, opposite } from "@/lib/stock-rules";

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

export async function categoryItemCounts() {
  return getDb().select({ id: items.categoryId, total: count() }).from(items)
    .where(sql`${items.categoryId} IS NOT NULL`).groupBy(items.categoryId);
}

export async function addCategory(name: string) {
  await getDb().insert(categories).values({ name });
}

export async function updateCategory(id: string, name: string) {
  const [updated] = await getDb().update(categories).set({ name })
    .where(eq(categories.id, id)).returning({ id: categories.id });
  if (!updated) throw new Error("Kategori tidak ditemukan.");
}

export async function deleteCategory(id: string) {
  await getDb().transaction(async tx => {
    // FK inserts need a key-share lock, so this lock prevents a concurrent item
    // from appearing between the usage check and deletion.
    await tx.execute(sql`SELECT id FROM categories WHERE id = ${id} FOR UPDATE`);
    const [used] = await tx.select({ id: items.id }).from(items)
      .where(eq(items.categoryId, id)).limit(1);
    if (used) throw new Error("Kategori masih digunakan oleh barang.");
    const [deleted] = await tx.delete(categories).where(eq(categories.id, id))
      .returning({ id: categories.id });
    if (!deleted) throw new Error("Kategori tidak ditemukan.");
  });
}

export async function listLocations() {
  return getDb().select().from(locations).orderBy(asc(locations.name));
}

export async function locationItemCounts() {
  return getDb().select({ id: items.locationId, total: count() }).from(items)
    .where(sql`${items.locationId} IS NOT NULL`).groupBy(items.locationId);
}

export async function addLocation(name: string) {
  await getDb().insert(locations).values({ name });
}

export async function updateLocation(id: string, name: string) {
  const [updated] = await getDb().update(locations).set({ name })
    .where(eq(locations.id, id)).returning({ id: locations.id });
  if (!updated) throw new Error("Lokasi tidak ditemukan.");
}

export async function deleteLocation(id: string) {
  const [deleted] = await getDb().delete(locations).where(eq(locations.id, id))
    .returning({ id: locations.id });
  if (!deleted) throw new Error("Lokasi tidak ditemukan.");
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

export async function deleteItem(id: string) {
  const [deleted] = await getDb().delete(items)
    .where(and(eq(items.id, id), eq(items.currentStock, 0)))
    .returning({ id: items.id });
  if (!deleted) throw new Error("Barang tidak ditemukan atau stoknya belum nol.");
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

export async function searchItems(query: string, requestedPage: number) {
  const where = query ? or(
    ilike(items.code, `%${query}%`), ilike(items.name, `%${query}%`),
    ilike(categories.name, `%${query}%`), ilike(locations.name, `%${query}%`),
  ) : undefined;
  const db = getDb();
  const base = db.select({ total: count() }).from(items)
    .leftJoin(categories, eq(items.categoryId, categories.id))
    .leftJoin(locations, eq(items.locationId, locations.id));
  const [{ total }] = await base.where(where);
  const pageSize = 20;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(Math.max(1, requestedPage), pages);
  const rows = await db.select(itemColumns).from(items)
    .leftJoin(categories, eq(items.categoryId, categories.id))
    .leftJoin(locations, eq(items.locationId, locations.id))
    .where(where).orderBy(asc(items.name), asc(items.id))
    .limit(pageSize).offset((page - 1) * pageSize);
  return { rows, total, page, pages };
}

export async function inventorySummary() {
  const db = getDb();
  const [stats] = await db.select({
    totalItems: count(),
    totalUnits: sql<number>`coalesce(sum(${items.currentStock}), 0)::integer`,
    lowStock: sql<number>`count(*) filter (where ${items.currentStock} <= ${items.minStock})::integer`,
  }).from(items);
  const low = await db.select({ id: items.id, code: items.code, name: items.name,
    currentStock: items.currentStock, unit: items.unit }).from(items)
    .where(sql`${items.currentStock} <= ${items.minStock}`)
    .orderBy(asc(items.currentStock), asc(items.name)).limit(6);
  return { stats, low };
}

export async function listItemOptions() {
  return getDb().select({ id: items.id, code: items.code, name: items.name,
    currentStock: items.currentStock, unit: items.unit }).from(items).orderBy(asc(items.name));
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
      reversalOf: movements.reversalOf,
      reversed: sql<boolean>`exists (select 1 from movements reversal where reversal.reversal_of = ${movements.id})`,
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
    reversalOf: movements.reversalOf,
    reversed: sql<boolean>`exists (select 1 from movements reversal where reversal.reversal_of = ${movements.id})`,
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

    await tx.update(items)
      .set({ currentStock: nextStock(item.currentStock, input.type, input.quantity), updatedAt: new Date() })
      .where(eq(items.id, input.itemId));
    await tx.insert(movements).values(input);
  });
}

export async function reverseMovement(id: string, actorId: string, reason: string) {
  await getDb().transaction(async (tx) => {
    const [original] = await tx.select().from(movements).where(eq(movements.id, id));
    if (!original) throw new Error("Transaksi tidak ditemukan.");
    if (original.reversalOf) throw new Error("Transaksi koreksi tidak dapat dibatalkan lagi.");
    // Item lock serializes correction with normal stock movements.
    await tx.execute(sql`SELECT id FROM items WHERE id = ${original.itemId} FOR UPDATE`);
    const [existing] = await tx.select({ id: movements.id }).from(movements)
      .where(eq(movements.reversalOf, id));
    if (existing) throw new Error("Transaksi ini sudah dikoreksi.");
    const [item] = await tx.select().from(items).where(eq(items.id, original.itemId));
    if (!item) throw new Error("Barang tidak ditemukan.");
    const type = opposite(original.type);
    await tx.update(items)
      .set({ currentStock: nextStock(item.currentStock, type, original.quantity), updatedAt: new Date() })
      .where(eq(items.id, item.id));
    await tx.insert(movements).values({
      itemId: original.itemId, actorId, type, quantity: original.quantity,
      reversalOf: original.id, note: `Koreksi: ${reason}`,
    });
  });
}
