import argon from "argon2";
import { checkExistingUser, insertUser } from "./users.service";
import {
  DatabaseError,
  NotFoundError,
  ValidationError,
} from "../middlewares/error/AppError";

export const createUser = async (name: string, email: string, pwd: string) => {
  const existingUser = await checkExistingUser(email);
  if (existingUser) {
    throw new DatabaseError("user already exists!!");
  } else {
    const hashedPassword = await argon.hash(pwd);
    const user = await insertUser({ name, email, pwd: hashedPassword });
    return user;
  }
};

export const loginUser = async (email: string, pwd: string) => {
  const userExists = await checkExistingUser(email);
  if (!userExists) {
    throw new NotFoundError("Incorrect email, user not found!!");
  } else {
    const matchPasswords = await argon.verify(userExists.password, pwd);
    if (!matchPasswords) {
      throw new ValidationError("incorrect password!!");
    }
    return userExists;
  }
};
