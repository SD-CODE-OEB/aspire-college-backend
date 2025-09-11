import * as dotenv from "dotenv";
dotenv.config({ debug: true }); // Load environment variables first
import errorHandler from "./middlewares/error";
import express, { Application, Request, Response } from "express";
import { db } from "./db/index";
import { checkExistingUser, getUsers } from "./db/queries/user-queries/fetch";
import { insertUser } from "./db/queries/user-queries/insert";
import { deleteUser } from "./db/queries/user-queries/delete";
const app: Application = express();
const port: number = 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(errorHandler);

app.listen(port, () => {
  if (!db) {
    console.error("Database connection failed");
    return;
  } else {
    console.log(`Server is running on http://localhost:${port}`);
  }
});

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, World!");
});

app.get("/users", async (req: Request, res: Response) => {
  const users = await getUsers();
  if (!users) {
    res.status(500).send("Error fetching users");
  } else {
    console.log("Fetched users!!");
    res
      .status(200)
      .json({ data: users, message: "Users fetched successfully" });
  }
});

app.post("/users", async (req: Request, res: Response) => {
  try {
    const { name, email } = req.body;
    const existingUser = await checkExistingUser(email);
    if (existingUser) {
      console.log("user already exists!!🙂‍↕️🙂‍↕️");
      return res.status(409).json({
        message: "user already exists!!",
        error: "email already exists, use another email",
      });
    } else {
      const response = await insertUser(name, email);
      console.log("User info uploaded!!✅✅");
      return res
        .status(201)
        .json({ data: response, message: "user inserted successfully" });
    }
  } catch (err) {
    return res
      .status(500)
      .json({ message: "user insertion failed!!", error: err });
  }
});

app.delete("/users", async (req: Request, res: Response) => {
  if (req.body) {
    const { email } = req.body;
    const existingUser = await checkExistingUser(email);
    if (!existingUser) {
      console.log("user does not exist!!🙂‍↕️🙂‍↕️");
      return res.status(409).json({
        message: "user does not exist!!",
        error: "email does not exist, use valid email",
      });
    } else {
      const delResponse = await deleteUser(email);
      console.log("user deleted successfully!!✅✅");
      return res
        .status(201)
        .json({ data: delResponse[0], message: "user deleted successfully!!" });
    }
  } else {
    return res.status(500).json({
      message: "user deletion unsuccessful",
      error: "'provide a email to the body",
    });
  }
});
