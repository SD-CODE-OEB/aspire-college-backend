import { varchar, serial, pgTable, timestamp } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  uid: serial("uid").primaryKey(),
  name: varchar("name", { length: 50 }).notNull(),
  email: varchar("email", { length: 100 }).notNull().unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
