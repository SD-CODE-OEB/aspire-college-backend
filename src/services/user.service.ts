import { eq } from "drizzle-orm";
import { db } from "../db";
import { usersTable } from "../db/schema";

export const getUsers = async () => {
  return await db.select().from(usersTable);
};

export const checkExistingUser = async (email: string) => {
  try {
    const user = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .then((res) => {
        return res;
      })
      .catch((err) => {
        return err;
      });
    if (user.length > 0) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.log("error finding user", error);
    return true;
  }
};

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

export const deleteUser = async (email: string) => {
  try {
    const deleteUser = await db
      .delete(usersTable)
      .where(eq(usersTable.email, email))
      .returning()
      .then((res) => {
        return res;
      })
      .catch((err) => {
        return err;
      });
    // console.log(deleteUser);
    return deleteUser;
  } catch (err) {
    console.log(err);
  }
};
