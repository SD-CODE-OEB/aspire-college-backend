import { db } from ".";
import { usersTable } from "./schema";

export const insertUser = async (userName: string, email: string) => {
  try {
    const user: typeof usersTable.$inferInsert = {
      name: userName,
      email: email,
    };
    const result = await db.insert(usersTable).values(user).returning();
    if (!result) {
      return;
    }
    return result;
  } catch (err) {
    console.error("Error inserting user:", err);
  }
};
