import e from "express";
import { getColleges } from "../controllers/colleges.controller";
import verifyJWT from "../middlewares/auth";

const collegeRouter = e.Router();

collegeRouter.get("/", verifyJWT, getColleges);

export default collegeRouter;
