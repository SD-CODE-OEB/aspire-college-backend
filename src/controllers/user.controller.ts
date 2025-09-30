import { Request, Response } from "express";
import asyncHandler from "../middlewares/asyncHandler";
import {
  checkExistingUser,
  deleteUser,
  fetchAllUsers,
} from "../services/users.service";
import { AppError, DatabaseError } from "../middlewares/error/AppError";

const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const users = await fetchAllUsers();
  if (!users) {
    throw new DatabaseError("Failed to fetch users");
  }
  return res.status(200).json({
    data: users,
    success: true,
    message: "Users fetched successfully",
    timestamp: new Date().toISOString(),
  });
});

const deleteUserByEmail = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;
  const emailExists = await checkExistingUser(email);
  if (!emailExists) {
    throw new AppError("user does not exists, unable to perform action", 409);
  }
  const deletedUser = await deleteUser({ email });
  return res.status(200).json({
    data: deletedUser,
    message: "user deleted successfully!!",
    success: true,
  });
});

const deleteUserByUserId = asyncHandler(async (req: Request, res: Response) => {
  const { uid } = req.params;
  const userExists = await checkExistingUser(undefined, Number(uid));
  if (!userExists) {
    throw new AppError("user does not exists, unable to perform action", 409);
  }
  const deletedUser = await deleteUser({ email: userExists.email });
  return res.status(200).json({
    data: deletedUser,
    message: "user deleted successfully!!",
    success: true,
  });
});

export { getAllUsers, deleteUserByEmail, deleteUserByUserId };
