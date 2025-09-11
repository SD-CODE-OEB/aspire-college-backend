import { eq } from "drizzle-orm";
import { db } from ".";
import { usersTable } from "./schema";

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
