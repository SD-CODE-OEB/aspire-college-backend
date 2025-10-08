import {
  varchar,
  serial,
  pgTable,
  timestamp,
  decimal,
  integer,
  unique,
  primaryKey,
  text,
  boolean,
} from "drizzle-orm/pg-core";

export const UserTable = pgTable("users", {
  userId: serial("user_id").primaryKey(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const CollegeTable = pgTable("colleges", {
  collegeId: serial("college_id").primaryKey(),
  collegeName: varchar("college_name", { length: 255 }).notNull(),
  location: varchar("location", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const CourseTable = pgTable(
  "courses",
  {
    courseId: serial("course_id").primaryKey(),
    courseName: varchar("course_name", { length: 255 }).notNull(),
    fee: decimal("fee", { precision: 10, scale: 2 }).notNull(),
    collegeId: integer("college_id")
      .references(() => CollegeTable.collegeId)
      .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [unique().on(table.courseName, table.collegeId)]
);

export const ReviewsTable = pgTable(
  "reviews",
  {
    reviewId: serial("review_id").primaryKey(),
    rating: integer("rating").notNull(),
    comment: varchar("comment", { length: 1000 }).notNull(),
    collegeId: integer("college_id")
      .references(() => CollegeTable.collegeId, { onDelete: "cascade" })
      .notNull(),
    userId: integer("user_id")
      .notNull()
      .references(() => UserTable.userId, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [unique().on(table.collegeId, table.userId)]
);

export const FavoriteCollegesTable = pgTable(
  "favorite_colleges",
  {
    userId: integer("user_id")
      .notNull()
      .references(() => UserTable.userId, { onDelete: "cascade" }),
    collegeId: integer("college_id")
      .notNull()
      .references(() => CollegeTable.collegeId, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.collegeId] })]
);

export const refreshTokenTable = pgTable("refresh_tokens", {
  tokenId: serial("token_id").primaryKey(),
  userId: integer("user_id")
    .references(() => UserTable.userId)
    .notNull(),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  isRevoked: boolean("is_revoked").notNull().default(false),
});
