import e from "express";
import {
  getAllReviews,
  getReviewsForUser,
  postReview,
} from "../controllers/reviews.controller";
import verifyJWT from "../middlewares/auth";

const reviewsRouter = e.Router();

reviewsRouter.get("/", verifyJWT, getAllReviews);
reviewsRouter.get("/user", verifyJWT, getReviewsForUser);
reviewsRouter.post("/", verifyJWT, postReview);

export default reviewsRouter;
