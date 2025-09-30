import { db } from "../../db";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import { UserTable } from "../../db/schema";
import { AppError } from "../error/AppError";
import { NextFunction, Request, Response } from "express";
import { ACCESS_TOKEN_SECRET, JWTPayload } from "./jwt-utils";

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: number;
        username: string;
        email: string;
      };
    }
  }
}

// Main middleware: Verify user is authenticated
const verifyJWT = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const accessToken = req.cookies?.accessToken;
    if (!accessToken) {
      throw new AppError("Please login to continue", 401);
    }

    // Verify the token
    const decoded = jwt.verify(accessToken, ACCESS_TOKEN_SECRET!) as JWTPayload;

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

    if (!user) {
      throw new AppError("User not found", 401);
    }

    // Add user info to request object
    req.user = user;
    next();
  } catch (error: unknown) {
    if (error instanceof Error && error.name === "TokenExpiredError") {
      return next(new AppError("Session expired, please refresh", 401));
    }

    if (error instanceof AppError) {
      return next(error);
    }

    next(new AppError("Invalid token", 401));
  }
};

export default verifyJWT;
