import { db } from "../../db";
import { eq } from "drizzle-orm";
import { Response } from "express";
import { configDotenv } from "dotenv";
import jwt, { JwtPayload } from "jsonwebtoken";
import { DatabaseError } from "../error/AppError";
import { refreshTokenTable, UserTable } from "../../db/schema";

configDotenv();

// JWT Secrets and expiry times
export const ACCESS_TOKEN_SECRET =
  process.env.ACCESS_TOKEN_SECRET || process.env.SECRET_JWT_KEY;
export const REFRESH_TOKEN_SECRET =
  process.env.REFRESH_TOKEN_SECRET || process.env.SECRET_JWT_KEY + "_refresh";

if (!ACCESS_TOKEN_SECRET) {
  throw new Error("JWT secrets not configured properly");
}

// JWT Payload interface
export interface JWTPayload extends JwtPayload {
  id: number;
  email: string;
  name: string;
}

// Helper function: Generate both access and refresh tokens
export const generateTokens = async (userId: number) => {
  const user = await db
    .select()
    .from(UserTable)
    .where(eq(UserTable.userId, userId))
    .limit(1)
    .then((res) => res[0]);
  if (!user) throw new DatabaseError("User not found");

  // Token payload (data stored in token)
  const payload = { id: userId, email: user.email, name: user.username };

  // Create tokens
  const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });
  const refreshToken = jwt.sign(payload, REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await db.insert(refreshTokenTable).values({
    userId: userId,
    token: refreshToken,
    expiresAt: expiresAt,
  });

  return { accessToken, refreshToken };
};

// Helper function: Set secure cookies with tokens
export const setTokenCookies = (
  res: Response,
  accessToken: string,
  refreshToken: string
) => {
  const isProduction = process.env.NODE_ENV === "production";

  const cookieOptions = {
    httpOnly: true, // Prevent JavaScript access
    secure: isProduction, // HTTPS only in production
    sameSite: (isProduction ? "none" : "lax") as "none" | "lax", // CSRF protection
    path: "/",
  };

  // Set access token cookie (15 minutes)
  res.cookie("accessToken", accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000,
  });

  // Set refresh token cookie (7 days)
  res.cookie("refreshToken", refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

// Helper function: Clear auth cookies
export const clearTokenCookies = (res: Response) => {
  const isProduction = process.env.NODE_ENV === "production";

  const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: (isProduction ? "none" : "lax") as "none" | "lax",
    path: "/",
  };

  res.clearCookie("accessToken", cookieOptions);
  res.clearCookie("refreshToken", cookieOptions);
};
