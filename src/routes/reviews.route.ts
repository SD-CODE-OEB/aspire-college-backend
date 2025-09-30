import e from "express";
import {
  getReviewsForUser,
  postReview,
} from "../controllers/reviews.controller";
import verifyJWT from "../middlewares/auth";

const reviewsRouter = e.Router();

reviewsRouter.get("/", verifyJWT, getReviewsForUser);
reviewsRouter.post("/", verifyJWT, postReview);

export default reviewsRouter;
