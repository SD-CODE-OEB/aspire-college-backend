import { db } from "../db";
import { eq, or } from "drizzle-orm";
import { UserTable } from "../db/schema";

export const fetchAllUsers = async () => {
  const users = await db.select().from(UserTable);
  return users;
};

export const checkExistingUser = async (email?: string, userId?: number) => {
  const conditions = [];
  if (email !== undefined) {
    conditions.push(eq(UserTable.email, email));
  }
  if (userId !== undefined) {
    conditions.push(eq(UserTable.userId, userId));
  }

  const user = await db
    .select()
    .from(UserTable)
    .where(conditions.length > 0 ? or(...conditions) : undefined)
    .limit(1)
    .then((res) => res[0]);
  return user;
};

export const insertUser = async ({
  name,
  email,
  pwd,
}: {
  name: string;
  email: string;
  pwd: string;
}) => {
  const user = db
    .insert(UserTable)
    .values({
      username: name,
      email: email,
      password: pwd,
    })
    .returning()
    .then((res) => res[0]);
  return user;
};

export const deleteUser = async ({ email }: { email: string }) => {
  const user = db
    .delete(UserTable)
    .where(eq(UserTable.email, email))
    .returning()
    .then((res) => res[0]);
  return user;
};

export const fetchUserInfo = async (userId?: number, email?: string) => {
  const conditions = [];
  if (userId !== undefined) {
    conditions.push(eq(UserTable.userId, userId));
  }
  if (email !== undefined) {
    conditions.push(eq(UserTable.email, email));
  }

  return await db
    .select({
      userId: UserTable.userId,
      username: UserTable.username,
      email: UserTable.email,
    })
    .from(UserTable)
    .where(conditions.length > 0 ? or(...conditions) : undefined);
};
