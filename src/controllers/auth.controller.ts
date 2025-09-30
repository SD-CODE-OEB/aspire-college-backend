import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import {
  generateTokens,
  JWTPayload,
  REFRESH_TOKEN_SECRET,
  setTokenCookies,
} from "../middlewares/auth";
import {
  revokeRefreshToken,
  verifyRefreshToken,
} from "../services/refreshToken.service";
import asyncHandler from "../middlewares/asyncHandler";
import { fetchUserInfo } from "../services/users.service";
import { createUser, loginUser } from "../services/auth.service";
import { AppError, AuthorizationError } from "../middlewares/error/AppError";

const Register = asyncHandler(async (req: Request, res: Response) => {
  const { username, email, password } = req.body;
  const user = await createUser(username, email, password);
  // const { accessToken, refreshToken } = await generateTokens(user.userId);
  // setTokenCookies(res, accessToken, refreshToken);
  console.log("user registration successful", user);
  return res.status(201).json({
    data: user,
    message: "User registered successfully!!",
    success: true,
  });
});

const Login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await loginUser(email, password);

  const { accessToken, refreshToken } = await generateTokens(user.userId);
  setTokenCookies(res, accessToken, refreshToken);
  console.log("user login successful!!", user, refreshToken);
  return res.status(200).json({
    data: { user, refreshToken },
    message: "user login successful!!",
    success: true,
  });
});

const logoutHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (refreshToken) {
      await revokeRefreshToken(refreshToken, res);
    }
    return res.json({ message: "Logged out successfully" });
  } catch (error) {
    next(new AppError("Logout failed", 500));
  }
};

export const refreshTokenHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      throw new AppError("No refresh token found", 401);
    }

    // Verify refresh token
    const decoded = jwt.verify(
      refreshToken,
      REFRESH_TOKEN_SECRET!
    ) as JWTPayload;

    await verifyRefreshToken(decoded.id, refreshToken);

    const { accessToken, refreshToken: newRefreshToken } = await generateTokens(
      decoded.id
    );
    setTokenCookies(res, accessToken, newRefreshToken);

    const user = await fetchUserInfo(decoded.id);

    res.json({
      user: user,
      message: "Token refreshed successfully",
      success: true,
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.name === "TokenExpiredError") {
      return next(new AppError("Please login again", 401));
    }

    if (error instanceof AppError) {
      return next(error);
    }

    next(new AppError("Token refresh failed", 401));
  }
};

const currentUser = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) {
    throw new AuthorizationError("User not authorized");
  }
  console.log("Current user:", user);
  return res.status(200).json({
    data: user,
    message: "User retrieved successfully",
    success: true,
  });
});

export { Register, Login, currentUser, logoutHandler };
