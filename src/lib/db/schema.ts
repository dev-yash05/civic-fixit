import {
  pgTable,
  text,
  timestamp,
  integer,
  real,
  pgEnum,
  primaryKey,
} from "drizzle-orm/pg-core";

// ─── enums ───────────────────────────────────────────────────────────────────

export const categoryEnum = pgEnum("category", [
  "road",
  "lighting",
  "waste",
  "water",
  "park",
  "other",
]);

export const statusEnum = pgEnum("status", [
  "open",
  "in_progress",
  "resolved",
]);

// ─── nextauth tables ──────────────────────────────────────────────────────────

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const accounts = pgTable(
  "accounts",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.provider, table.providerAccountId] }),
  })
);

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.identifier, table.token] }),
  })
);

// ─── app tables ───────────────────────────────────────────────────────────────

export const issues = pgTable("issues", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: categoryEnum("category").notNull(),
  status: statusEnum("status").default("open").notNull(),
  imageUrl: text("image_url"),
  lat: real("lat").notNull(),
  lng: real("lng").notNull(),
  address: text("address"),
  upvoteCount: integer("upvote_count").default(0).notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const upvotes = pgTable(
  "upvotes",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    issueId: text("issue_id")
      .notNull()
      .references(() => issues.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.issueId] }),
  })
);

// ─── types ────────────────────────────────────────────────────────────────────

export type User = typeof users.$inferSelect;
export type Issue = typeof issues.$inferSelect;
export type Upvote = typeof upvotes.$inferSelect;
export type NewIssue = typeof issues.$inferInsert;