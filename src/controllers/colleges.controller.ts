import { Request, Response } from "express";
import {
  addCourseToCollege,
  createCollegeWithCourses,
  createCollegeWithoutCourses,
  fetchAllColleges,
  fetchAllCollegesWithCourses,
} from "../services/colleges.service";
import { ValidationError } from "../middlewares/error";
import asyncHandler from "../middlewares/asyncHandler";

const getColleges = asyncHandler(async (req: Request, res: Response) => {
  const colleges = await fetchAllColleges();
  console.log("Fetched colleges:", colleges);
  return res.status(200).json({
    data: colleges,
    message: "Colleges fetched successfully",
    status: "success",
  });
});

const getCollegesWithCourses = asyncHandler(
  async (req: Request, res: Response) => {
    const colleges = await fetchAllCollegesWithCourses();
    console.log("Fetched colleges:", colleges);
    return res.status(200).json({
      data: colleges,
      message: "Colleges with Courses fetched successfully",
      status: "success",
    });
  }
);

const postCollege = asyncHandler(async (req: Request, res: Response) => {
  const { collegeName, location, courses } = req.body;
  if (!collegeName || !location) {
    console.log(collegeName, location, "req.body");
    throw new ValidationError("collegeName and location are required");
  }
  if ((!courses || courses.length === 0) && collegeName && location) {
    const newCollege = await createCollegeWithoutCourses({
      collegeName,
      location,
    });
    return res.status(201).json({
      data: newCollege,
      message: "College created successfully without courses",
      status: "success",
    });
  }
  if (courses && courses.length > 0 && collegeName && location) {
    const newCollege = await createCollegeWithCourses({
      collegeName,
      location,
      courses,
    });
    if (newCollege?.message) {
      return res.status(201).json({
        data: newCollege,
        message: newCollege?.message,
        status: "success",
      });
    }
    return res.status(201).json({
      data: newCollege,
      message: "College created successfully with course",
      status: "success",
    });
  }
});

const postCourseToCollege = asyncHandler(
  async (req: Request, res: Response) => {
    const { collegeId, courseName, fee } = req.body;
    if (!collegeId || !courseName || !fee) {
      console.log(collegeId, courseName, fee, "req.body");
      throw new ValidationError("collegeId, courseName and fee are required");
    }
    const newCourse = await addCourseToCollege({ collegeId, courseName, fee });
    return res.status(201).json({
      data: newCourse,
      message: "Course added to college successfully",
      status: "success",
    });
  }
);
export {
  getColleges,
  getCollegesWithCourses,
  postCollege,
  postCourseToCollege,
};
