import { db } from "../db";
import { eq } from "drizzle-orm";
import { AppError } from "../middlewares/error";
import { CollegeTable, CourseTable } from "../db/schema";

export const getAllCollegesWithCourses = async () => {
  const colleges = await db
    .select({
      collegeId: CollegeTable.collegeId,
      collegeName: CollegeTable.collegeName,
      location: CollegeTable.location,
      course: CourseTable.courseName,
      fee: CourseTable.fee,
    })
    .from(CollegeTable)
    .innerJoin(CourseTable, eq(CollegeTable.collegeId, CourseTable.collegeId))
    .then((rows) => rows);

  if (colleges.length === 0) {
    throw new AppError("No colleges found", 404);
  }
  if (colleges instanceof Error) {
    throw new AppError(colleges.message, 500);
  }
  return colleges;
};
