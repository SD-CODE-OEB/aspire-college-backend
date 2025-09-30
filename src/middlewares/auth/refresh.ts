import jwt from "jsonwebtoken";
import { db } from "../../db";
import { and, eq } from "drizzle-orm";
import { AppError } from "../error/AppError";
import { NextFunction, Request, Response } from "express";
import { refreshTokenTable, UserTable } from "../../db/schema";
import {
  REFRESH_TOKEN_SECRET,
  JWTPayload,
  generateTokens,
  setTokenCookies,
} from "./jwt-utils";

// Route handler: Refresh expired access token
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

    const storedToken = await db
      .select()
      .from(refreshTokenTable)
      .where(
        and(
          eq(refreshTokenTable.token, refreshToken),
          eq(refreshTokenTable.userId, decoded.id),
          eq(refreshTokenTable.isRevoked, false)
        )
      )
      .limit(1)
      .then((res) => res[0]);

    if (!storedToken || new Date() > storedToken.expiresAt) {
      throw new AppError(
        "Invalid or expired refresh token, please login to continue",
        401
      );
    }

    await db
      .update(refreshTokenTable)
      .set({ isRevoked: true })
      .where(eq(refreshTokenTable.tokenId, storedToken.tokenId));

    const { accessToken, refreshToken: newRefreshToken } = await generateTokens(
      decoded.id
    );
    setTokenCookies(res, accessToken, newRefreshToken);

    const user = await db
      .select({
        userId: UserTable.userId,
        username: UserTable.username,
        email: UserTable.email,
      })
      .from(UserTable)
      .where(eq(UserTable.userId, decoded.id))
      .limit(1)
      .then((res) => res[0]);

    res.json({
      message: "Token refreshed successfully",
      user: user,
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
