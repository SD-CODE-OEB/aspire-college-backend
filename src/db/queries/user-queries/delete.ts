import { eq } from "drizzle-orm";
import { db } from "..";
import { checkExistingUser } from "./fetch";
import { usersTable } from "../schema";

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
