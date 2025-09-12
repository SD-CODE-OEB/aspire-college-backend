import express from "express";
import {
  deleteSingleUserByEmail,
  getAllUsers,
  InsertSingleUser,
} from "../controllers/user.controller";

const userRouter = express.Router();

userRouter.get("/all", getAllUsers);
userRouter.post("/add", InsertSingleUser);
userRouter.delete("/delete", deleteSingleUserByEmail);

export default userRouter;
