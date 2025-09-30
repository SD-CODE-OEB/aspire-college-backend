import e from "express";
import {
  deleteUserFavorite,
  getAllUserFavorites,
  postUserFavorite,
} from "../controllers/favorites.controller";
import verifyJWT from "../middlewares/auth";

const favoritesRouter = e.Router();

favoritesRouter.get("/", verifyJWT, getAllUserFavorites);
favoritesRouter.post("/", verifyJWT, postUserFavorite);
favoritesRouter.delete("/:cid", verifyJWT, deleteUserFavorite);

export default favoritesRouter;
