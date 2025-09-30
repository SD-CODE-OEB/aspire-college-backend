import { Request, Response } from "express";
import asyncHandler from "../middlewares/asyncHandler";
import { getAllCollegesWithCourses } from "../services/colleges.service";

const getColleges = asyncHandler(async (req: Request, res: Response) => {
  const colleges = await getAllCollegesWithCourses();
  return res.status(200).json({
    data: colleges,
    message: "Colleges fetched successfully",
    status: "success",
  });
});

export { getColleges };
