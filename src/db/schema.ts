import { sql } from "drizzle-orm";
import {
  check,
  integer,
  boolean,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";

export const userRole = pgEnum("user_role", ["admin", "staff"]);
export const movementType = pgEnum("movement_type", ["in", "out"]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  role: userRole("role").notNull().default("staff"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const locations = pgTable("locations", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const items = pgTable("items", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  categoryId: uuid("category_id").references(() => categories.id, { onDelete: "set null" }),
  // Kept for rollback compatibility; new writes use locationId.
  legacyLocation: text("location").notNull().default(""),
  locationId: uuid("location_id").references(() => locations.id, { onDelete: "restrict" }),
  unit: text("unit").notNull().default("unit"),
  minStock: integer("min_stock").notNull().default(0),
  currentStock: integer("current_stock").notNull().default(0),
  notes: text("notes").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("items_category_id_idx").on(table.categoryId),
  index("items_location_id_idx").on(table.locationId),
  check("items_stock_nonnegative", sql`${table.currentStock} >= 0`),
  check("items_min_stock_nonnegative", sql`${table.minStock} >= 0`),
]);

export const movements = pgTable("movements", {
  id: uuid("id").primaryKey().defaultRandom(),
  itemId: uuid("item_id").notNull().references(() => items.id, { onDelete: "restrict" }),
  actorId: uuid("actor_id").notNull().references(() => users.id, { onDelete: "restrict" }),
  reversalOf: uuid("reversal_of").unique().references((): AnyPgColumn => movements.id, { onDelete: "restrict" }),
  type: movementType("type").notNull(),
  quantity: integer("quantity").notNull(),
  note: text("note").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("movements_item_id_idx").on(table.itemId),
  index("movements_created_id_idx").on(table.createdAt.desc(), table.id.desc()),
  check("movements_quantity_positive", sql`${table.quantity} > 0`),
]);
