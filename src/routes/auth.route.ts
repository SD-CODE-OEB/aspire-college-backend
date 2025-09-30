import express from "express";
import verifyJWT, { refreshTokenHandler } from "../middlewares/auth";
import {
  currentUser,
  Login,
  Register,
  logoutHandler,
} from "../controllers/auth.controller";

const authRouter = express.Router();

authRouter.post("/register", Register);
authRouter.post("/login", Login);
authRouter.post("/logout", logoutHandler);
authRouter.get("/me", verifyJWT, currentUser);
authRouter.get("/refresh", refreshTokenHandler);

export default authRouter;
