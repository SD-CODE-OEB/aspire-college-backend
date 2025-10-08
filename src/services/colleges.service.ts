import { db } from "../db";
import { eq, sql } from "drizzle-orm";
import { AppError } from "../middlewares/error";
import { CollegeTable, CourseTable } from "../db/schema";

export const fetchAllColleges = async () => {
  const colleges = await db
    .select()
    .from(CollegeTable)
    .then((rows) => rows);
  if (colleges.length <= 0) {
    throw new AppError("No colleges found", 404);
  }
  if (colleges instanceof Error) {
    throw new AppError(colleges.message, 500);
  }
  return colleges;
};

export const fetchAllCollegesWithCourses = async () => {
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
  console.log("Colleges with courses:", colleges);
  if (colleges.length <= 0) {
    throw new AppError("No colleges found", 404);
  }
  if (colleges instanceof Error) {
    throw new AppError(colleges.message, 500);
  }
  return colleges;
};

export const checkExistingCollegeByName = async (collegeName: string) => {
  const existingCollege = await db
    .select()
    .from(CollegeTable)
    .where(
      sql`LOWER(${CollegeTable.collegeName}) = ${collegeName.toLowerCase()}`
    )
    .then((rows) => rows[0]);
  return existingCollege;
};

export const createCollegeWithoutCourses = async (collegeData: {
  collegeName: string;
  location: string;
}) => {
  const existingCollege = await checkExistingCollegeByName(
    collegeData.collegeName
  );
  if (existingCollege) {
    throw new AppError("College with this name already exists", 400);
  }
  const newCollege = await db
    .insert(CollegeTable)
    .values({
      collegeName: collegeData.collegeName.trim(),
      location: collegeData.location.trim(),
    })
    .returning()
    .then((rows) => rows[0]);
  if (newCollege instanceof Error) {
    throw new AppError(newCollege.message, 500);
  }
  return newCollege;
};

export const addCourseToCollege = async (courseData: {
  collegeId: number;
  courseName: string;
  fee: number;
}) => {
  const newCourse = await db
    .insert(CourseTable)
    .values({
      collegeId: courseData.collegeId,
      courseName: courseData.courseName.trim(),
      fee: courseData.fee.toString(),
    })
    .returning()
    .then((rows) => rows[0]);
  if (newCourse instanceof Error) {
    throw new AppError(newCourse.message, 500);
  }
  return newCourse;
};

export const createCollegeWithCourses = async (collegeData: {
  collegeName: string;
  location: string;
  courses: { courseName: string; fee: number }[];
}) => {
  const existingCollege = await checkExistingCollegeByName(
    collegeData.collegeName
  );
  if (existingCollege) {
    collegeData.courses.forEach(async (course) => {
      const addCourse = await addCourseToCollege({
        collegeId: existingCollege.collegeId,
        courseName: course.courseName,
        fee: course.fee,
      });
      if (addCourse instanceof Error) {
        console.log(
          "Error adding course to existing college",
          addCourse.message
        );
        throw new AppError(addCourse.message, 500);
      }
      console.log("Course added to existing college", addCourse);
    });
    return { message: "Course added to existing college" };
  } else {
    const newCollege = await createCollegeWithoutCourses({
      collegeName: collegeData.collegeName,
      location: collegeData.location,
    });
    if (newCollege instanceof Error) {
      throw new AppError(newCollege.message, 500);
    }
    collegeData.courses.forEach(async (course) => {
      const addCourse = await addCourseToCollege({
        collegeId: newCollege.collegeId,
        courseName: course.courseName,
        fee: course.fee,
      });
      if (addCourse instanceof Error) {
        console.log("Error adding course to new college", addCourse.message);
        throw new AppError(addCourse.message, 500);
      }
      console.log("Course added to new college", addCourse);
    });
    return { ...newCollege, courses: collegeData.courses };
  }
};
