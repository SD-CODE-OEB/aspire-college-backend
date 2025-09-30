import { db } from "../db";
import { Response } from "express";
import { and, eq } from "drizzle-orm";
import { AppError } from "../middlewares/error";
import { refreshTokenTable } from "../db/schema";
import { clearTokenCookies } from "../middlewares/auth";

export const revokeRefreshToken = async (token: string, res: Response) => {
  if (token) {
    // Revoke refresh token
    await db
      .update(refreshTokenTable)
      .set({ isRevoked: true })
      .where(eq(refreshTokenTable.token, token));
  }
  clearTokenCookies(res);
};

export const verifyRefreshToken = async (
  decodedId: number,
  refreshToken: string
) => {
  const getStoredToken = await db
    .select()
    .from(refreshTokenTable)
    .where(
      and(
        eq(refreshTokenTable.token, refreshToken),
        eq(refreshTokenTable.userId, decodedId),
        eq(refreshTokenTable.isRevoked, false)
      )
    )
    .then((res) => res[0]);

  if (!getStoredToken || new Date() > getStoredToken.expiresAt) {
    throw new AppError("Invalid or expired refresh token", 401);
  }

  //revoke stored refreshToken
  await db
    .update(refreshTokenTable)
    .set({ isRevoked: true })
    .where(eq(refreshTokenTable.tokenId, getStoredToken.tokenId));
};
