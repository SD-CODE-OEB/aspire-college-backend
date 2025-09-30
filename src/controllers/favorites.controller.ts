import { Request, Response } from "express";
import { RequestUser } from "../middlewares/auth";
import asyncHandler from "../middlewares/asyncHandler";
import {
  addUserFavorite,
  fetchUserFavorites,
  removeUserFavorite,
} from "../services/favorites.service";

const getAllUserFavorites = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId } = req.user as RequestUser;

    const favorites = await fetchUserFavorites(userId);
    if (!favorites) {
      throw new Error("Could not fetch user favorites");
    }
    return res.status(200).json({
      data: favorites,
      success: true,
      message: "User favorites fetched successfully",
      timestamp: new Date().toISOString(),
    });
  }
);

const postUserFavorite = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.user as RequestUser;
  const { collegeId } = req.body;
  const addFavorite = await addUserFavorite(userId, collegeId);
  if (!addFavorite) {
    throw new Error("Could not add favorite");
  }
  return res.status(201).json({
    data: addFavorite,
    success: true,
    message: "Favorite added successfully",
    timestamp: new Date().toISOString(),
  });
});

const deleteUserFavorite = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.user as RequestUser;
  const { cid } = req.params;
  const removeFavorite = await removeUserFavorite(Number(cid), userId);
  return res.status(200).json({
    data: removeFavorite,
    success: true,
    message: "Favorite removed successfully",
    timestamp: new Date().toISOString(),
  });
});

export { getAllUserFavorites, postUserFavorite, deleteUserFavorite };
