import { eq } from "drizzle-orm";
import { db } from "../db";
import { CollegeTable, ReviewsTable, UserTable } from "../db/schema";
import { AppError, NotFoundError } from "../middlewares/error";

export const getAllReviews = async () => {
  const reviews = await db
    .select({
      reviewId: ReviewsTable.reviewId,
      userId: ReviewsTable.userId,
      rating: ReviewsTable.rating,
      comment: ReviewsTable.comment,
      collegeName: CollegeTable.collegeName,
      location: CollegeTable.location,
    })
    .from(ReviewsTable)
    .innerJoin(CollegeTable, eq(ReviewsTable.collegeId, CollegeTable.collegeId))
    .then((rows) => rows);
  return reviews;
};

export const getReviewsByUserId = async (userId: number) => {
  if (!userId) {
    throw new AppError("user ID not provided", 400);
  }
  const reviews = await db
    .select({
      reviewId: ReviewsTable.reviewId,
      user: {
        userId: UserTable.userId,
        username: UserTable.username,
        email: UserTable.email,
      },
      rating: ReviewsTable.rating,
      comment: ReviewsTable.comment,
      collegeName: CollegeTable.collegeName,
      location: CollegeTable.location,
    })
    .from(ReviewsTable)
    .innerJoin(CollegeTable, eq(ReviewsTable.collegeId, CollegeTable.collegeId))
    .innerJoin(UserTable, eq(ReviewsTable.userId, UserTable.userId))
    .where(eq(ReviewsTable.userId, userId))
    .then((rows) => rows);

  if (reviews.length === 0) {
    throw new NotFoundError("No reviews found for this user");
  }
  if (reviews instanceof Error) {
    throw new AppError(reviews.message, 500);
  }
  return reviews;
};

export const createReviewForUser = async (
  userId: number,
  cId: number,
  rating: number,
  comment: string
) => {
  const newReview = await db
    .insert(ReviewsTable)
    .values({
      collegeId: cId,
      rating: rating,
      comment: comment,
      userId: userId,
    })
    .returning()
    .then((res) => res[0]);
  if (newReview instanceof Error) {
    console.error(newReview.message);
    throw new AppError(newReview.message, 500);
  }
  return newReview;
};
