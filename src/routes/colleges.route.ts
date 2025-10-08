import e from "express";
import {
  getColleges,
  getCollegesWithCourses,
  postCollege,
  postCourseToCollege,
} from "../controllers/colleges.controller";
import verifyJWT from "../middlewares/auth";

const collegeRouter = e.Router();

collegeRouter.get("/", verifyJWT, getColleges);
collegeRouter.get("/courses", verifyJWT, getCollegesWithCourses);
collegeRouter.post("/", verifyJWT, postCollege);
collegeRouter.post("/courses", verifyJWT, postCourseToCollege);

export default collegeRouter;
