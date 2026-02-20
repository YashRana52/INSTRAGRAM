import express from "express";
import {
  editProfile,
  followOrUnfollow,
  getProfile,
  getProfileUser,
  getSuggestedUsers,
  login,
  logout,
  register,
} from "../controllers/userController.js";
import isAuthenticated from "../middlewares/auth.js";
import upload from "../middlewares/multer.js";

const userRouter = express.Router();

/* AUTH ROUTES */
userRouter.post("/register", register);
userRouter.post("/login", login);
userRouter.get("/logout", logout);

/* PROFILE ROUTES */
userRouter.get("/:id/profile", isAuthenticated, getProfile);

userRouter.get("/me", isAuthenticated, getProfileUser);
userRouter.post(
  "/profile/edit",
  isAuthenticated,
  upload.single("profilePicture"),
  editProfile,
);

/* USER ROUTES */
userRouter.get("/suggested", isAuthenticated, getSuggestedUsers);
userRouter.post("/followorunfollow/:id", isAuthenticated, followOrUnfollow);

export default userRouter;
