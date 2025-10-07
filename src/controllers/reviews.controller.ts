import { Request, Response } from "express";
import asyncHandler from "../middlewares/asyncHandler";
import {
  createReviewForUser,
  fetchAllReviews,
  getReviewsByUserId,
} from "../services/reviews.service";
import { AppError } from "../middlewares/error";

const getReviewsForUser = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.user!;

  const userReviews = await getReviewsByUserId(userId);
  console.log("User reviews fetched✅");
  return res.status(200).json({
    data: userReviews,
    success: true,
    message: "User reviews fetched successfully",
    timestamp: new Date().toISOString(),
  });
});

const getAllReviews = asyncHandler(async (req: Request, res: Response) => {
  const allReviews = await fetchAllReviews();
  if (allReviews) {
    console.log("All reviews fetched✅");
  }
  return res.status(200).json({
    data: allReviews,
    success: true,
    message: "All reviews fetched successfully",
    timestamp: new Date().toISOString(),
  });
});
const postReview = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.user!;
  const { collegeId, rating, comment } = req.body;

  if (!collegeId || !rating || !comment) {
    throw new AppError("collegeId, rating and comment are required", 400);
  }
  const newReview = await createReviewForUser(
    userId,
    collegeId,
    rating,
    comment
  );
  console.log("New review created✅");
  return res.status(201).json({
    data: newReview,
    success: true,
    message: "Review created successfully",
    timestamp: new Date().toISOString(),
  });
});

export { getReviewsForUser, postReview, getAllReviews };
