import * as dotenv from "dotenv";
dotenv.config({ debug: true }); // Load environment variables first
import helmet from "helmet";
import { db } from "./db/index";
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.route";
import authRouter from "./routes/auth.route";
import reviewsRouter from "./routes/reviews.route";
import collegeRouter from "./routes/colleges.route";
import favoritesRouter from "./routes/favorites.route";
import { corsMiddleware } from "./middlewares/cors";
import express, { Application, Request, Response } from "express";
import { errorHandler, notFoundHandler } from "./middlewares/error";

export const app: Application = express();
const port: number = parseInt(process.env.PORT || "5000", 10);

//middlewares
app.use(express.json());
app.use(corsMiddleware);
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(express.static("public"));

//routes
app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/colleges", collegeRouter);
app.use("/api/reviews", reviewsRouter);
app.use("/api/favorites", favoritesRouter);

app.get("/health", (req: Request, res: Response) => {
  console.log("Health check endpoint hit");
  res.json({
    success: true,
    status: "healthy",
    timestamp: new Date().toISOString(),
    database: db ? "connected" : "disconnected",
  });
});

//route not found handler
app.use(notFoundHandler);
//error handler at the end of all routes
app.use(errorHandler);

app.listen(port, "0.0.0.0", () => {
  if (!db) {
    console.error("Database connection failed");
    return;
  } else {
    console.log(`Server is running on http://0.0.0.0:${port}`);
  }
});
