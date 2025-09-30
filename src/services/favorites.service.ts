import { eq } from "drizzle-orm";
import { db } from "../db";
import { CollegeTable, FavoriteCollegesTable, UserTable } from "../db/schema";
import { AppError } from "../middlewares/error";
import { and } from "drizzle-orm";

export const fetchUserFavorites = async (userId: number) => {
  const favorites = await db
    .select({
      collegeId: CollegeTable.collegeId,
      collegeName: CollegeTable.collegeName,
      location: CollegeTable.location,
      userId: FavoriteCollegesTable.userId,
      username: UserTable.username,
    })
    .from(FavoriteCollegesTable)
    .innerJoin(
      CollegeTable,
      eq(FavoriteCollegesTable.collegeId, CollegeTable.collegeId)
    )
    .leftJoin(UserTable, eq(FavoriteCollegesTable.userId, UserTable.userId))
    .where(eq(FavoriteCollegesTable.userId, userId))
    .then((rows) => rows);

  if (favorites instanceof Error) {
    throw new AppError(favorites.message, 500);
  }
  return favorites;
};

export const addUserFavorite = async (userId: number, collegeId: number) => {
  if (!userId || !collegeId) {
    throw new AppError("userId and collegeId are required", 400);
  }
  const newFavorite = await db
    .insert(FavoriteCollegesTable)
    .values({
      userId,
      collegeId,
    })
    .returning()
    .then((rows) => rows[0]);
  console.log("New favorite added✅", newFavorite);
  if (newFavorite instanceof Error) {
    console.log("Error adding favorite❌", newFavorite.message);
    throw new AppError(newFavorite.message, 500);
  }
  const favorites = await fetchUserFavorites(userId);
  if (!favorites) {
    throw new Error("Could not fetch user favorites");
  }
  return favorites;
};

export const removeUserFavorite = async (collegeId: number, userId: number) => {
  if (!collegeId) {
    throw new AppError("Favorite ID is required", 400);
  }
  const deletedFavorite = await db
    .delete(FavoriteCollegesTable)
    .where(
      and(
        eq(FavoriteCollegesTable.collegeId, collegeId),
        eq(FavoriteCollegesTable.userId, userId)
      )
    )
    .returning()
    .then((rows) => rows[0]);
  console.log("Favorite removed✅", deletedFavorite);
  if (deletedFavorite instanceof Error) {
    console.log("Error removing favorite❌", deletedFavorite.message);
    throw new AppError(deletedFavorite.message, 500);
  }
  const favorites = await fetchUserFavorites(userId);
  if (!favorites) {
    throw new Error("Could not fetch user favorites");
  }
  return favorites;
};
