import express from "express";
import upload from "../middlewares/multer.js";
import {
  addComment,
  addNewPost,
  bookmarkPost,
  deletePost,
  disLikePost,
  getAllPost,
  getCommentsOfPost,
  getUserPost,
  likePost,
} from "../controllers/postController.js";
import isAuthenticated from "../middlewares/auth.js";

const postRouter = express.Router();

// Create post
postRouter.post(
  "/addpost",
  isAuthenticated,
  upload.single("image"),
  addNewPost,
);

// Get all posts
postRouter.get("/all", isAuthenticated, getAllPost);

// Get logged-in user's posts
postRouter.get("/userpost/all", isAuthenticated, getUserPost);

// Like post
postRouter.post("/:id/like", isAuthenticated, likePost);

// Dislike post
postRouter.post("/:id/dislike", isAuthenticated, disLikePost);

// Add comment
postRouter.post("/:id/comment", isAuthenticated, addComment);

// Get all comments of a post
postRouter.get("/:id/comment/all", isAuthenticated, getCommentsOfPost);

// Delete post
postRouter.delete("/delete/:id", isAuthenticated, deletePost);

// Bookmark post
postRouter.get("/:id/bookmark", isAuthenticated, bookmarkPost);

export default postRouter;
