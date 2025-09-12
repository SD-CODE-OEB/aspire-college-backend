import * as dotenv from "dotenv";
dotenv.config({ debug: true }); // Load environment variables first
import { db } from "./db/index";
import userRouter from "./routes/user.route";
import { errorHandler, notFoundHandler } from "./middlewares";
import express, { Application, Request, Response } from "express";

export const app: Application = express();
const port: number = 5000;

//middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//routes
app.use("/api/users", userRouter);

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

app.listen(port, () => {
  if (!db) {
    console.error("Database connection failed");
    return;
  } else {
    console.log(`Server is running on http://localhost:${port}`);
  }
});
