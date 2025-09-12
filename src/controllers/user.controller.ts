import { Request, Response } from "express";
import { AppError } from "../middlewares/AppError";
import asyncHandler from "../middlewares/asyncHandler";
import {
  getUsers,
  checkExistingUser,
  deleteUser,
  insertUser,
} from "../services/user.service";

const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const users = await getUsers();
  if (!users) {
    throw new AppError("Error fetching users", 500);
  }
  console.log("Fetched users!!");
  res.status(200).json({ data: users, message: "Users fetched successfully" });
});

const InsertSingleUser = asyncHandler(async (req: Request, res: Response) => {
  const { name, email } = req.body;
  const existingUser = await checkExistingUser(email);
  if (existingUser) {
    console.log("user already exists!!🙂‍↕️🙂‍↕️");
    throw new AppError("user already exists!!", 409);
  }
  const response = await insertUser(name, email);
  console.log("User info uploaded!!✅✅");
  res
    .status(201)
    .json({ data: response, message: "user inserted successfully" });
});

const deleteSingleUserByEmail = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.body) {
      throw new AppError("provide a email to the body", 400);
    }
    const { email } = req.body;
    const existingUser = await checkExistingUser(email);
    if (!existingUser) {
      console.log("user does not exist!!🙂‍↕️🙂‍↕️");
      throw new AppError("user does not exist!!", 409);
    }
    const delResponse = await deleteUser(email);
    console.log("user deleted successfully!!✅✅");
    res
      .status(200)
      .json({ data: delResponse[0], message: "user deleted successfully!!" });
  }
);

export { getAllUsers, InsertSingleUser, deleteSingleUserByEmail };
