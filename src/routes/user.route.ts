import express from "express";
import {
  deleteUserByEmail,
  deleteUserByUserId,
  getAllUsers,
} from "../controllers/user.controller";
import verifyJWT from "../middlewares/auth";

const userRouter = express.Router();

userRouter.get("/all", verifyJWT, getAllUsers);
userRouter.delete("/delete", deleteUserByEmail);
userRouter.delete("/delete/:uid", deleteUserByUserId);

export default userRouter;
