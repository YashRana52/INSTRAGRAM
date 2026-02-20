import { Comment } from "../models/comment.js";
import { Post } from "../models/post.js";
import { User } from "../models/user.js";
import sharp from "sharp";
import cloudinary from "../utils/cloudinary.js";
import { getRecieverSocketId, io } from "../socket/socket.js";

// Function to add a new post
export const addNewPost = async (req, res) => {
  try {
    const { caption } = req.body;
    const image = req.file;
    const authorId = req.id;
    console.log("BODY 👉", req.body);
    console.log("FILE 👉", req.file);

    if (!image) return res.status(400).json({ message: "Image required" });

    // Image upload with sharp optimization
    const optimizedImageBuffer = await sharp(image.buffer)
      .resize({ width: 800, height: 800, fit: "inside" })
      .toFormat("jpeg", { quality: 80 })
      .toBuffer();

    const fileUri = `data:image/jpeg;base64,${optimizedImageBuffer.toString("base64")}`;
    const cloudResponse = await cloudinary.uploader.upload(fileUri);
    const post = await Post.create({
      caption,
      image: cloudResponse.secure_url,
      author: authorId,
    });

    const user = await User.findById(authorId);
    if (user) {
      user.posts.push(post._id);
      await user.save();
    }

    // Ensure post is populated with author info
    await post.populate({ path: "author", select: "-password" });

    // Return the newly created post and all posts sorted by creation date (most recent first)
    const posts = await Post.find()
      .sort({ createdAt: -1 }) // Sorting posts by creation date in descending order
      .populate({
        path: "author",
        select: "username profilePicture",
        match: { username: { $ne: "Unknown User" } },
      })
      .populate({
        path: "comments",
        sort: { createdAt: -1 },
        populate: {
          path: "author",
          select: "username profilePicture",
        },
      });

    const filteredPosts = posts.filter((post) => post.author);

    return res.status(201).json({
      message: "New post added",
      post,
      posts: filteredPosts, // Return all posts sorted
      success: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error", success: false });
  }
};

// Function to get all posts (excluding unknown users)
export const getAllPost = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate({
        path: "author",
        select: "username profilePicture",
        match: { username: { $ne: "Unknown User" } },
      })
      .populate({
        path: "comments",
        sort: { createdAt: -1 },
        populate: {
          path: "author",
          select: "username profilePicture",
        },
      });

    // Filter out posts where the author is unknown
    const filteredPosts = posts.filter((post) => post.author);

    return res.status(200).json({
      posts: filteredPosts,
      success: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error", success: false });
  }
};

// Function to get a user's posts (excluding unknown users)
export const getUserPost = async (req, res) => {
  try {
    const authorId = req.id;
    const posts = await Post.find({ author: authorId })
      .sort({ createdAt: -1 })
      .populate({
        path: "author",
        select: "username profilePicture",
        match: { username: { $ne: "Unknown User" } },
      })
      .populate({
        path: "comments",
        sort: { createdAt: -1 },
        populate: {
          path: "author",
          select: "username profilePicture",
        },
      });

    // Filter out posts where the author is unknown
    const filteredPosts = posts.filter((post) => post.author);

    return res.status(200).json({
      posts: filteredPosts,
      success: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error", success: false });
  }
};

export const likePost = async (req, res) => {
  try {
    const userId = req.id;
    const postId = req.params.id;

    const post = await Post.findById(postId);
    if (!post) {
      return res
        .status(404)
        .json({ message: "Post not found", success: false });
    }

    await post.updateOne({ $addToSet: { likes: userId } });

    //socket implemet
    const user = await User.findById(userId).select("username profilePicture");
    const postOwnerId = post.author.toString();
    if (postOwnerId !== userId) {
      //emit notifications
      const notification = {
        type: "like",
        action: "add",
        userId,
        userDetails: user,
        postId,
        message: `Your post was liked by ${user.username} `,
      };

      const postOwnerSocketId = getRecieverSocketId(postOwnerId);

      if (postOwnerSocketId) {
        io.to(postOwnerSocketId).emit("notification", notification);
      }
    }

    return res.status(200).json({
      success: true,
      message: "Post liked",
      userId,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const disLikePost = async (req, res) => {
  try {
    const userId = req.id;
    const postId = req.params.id;

    const post = await Post.findById(postId);
    if (!post) {
      return res
        .status(404)
        .json({ message: "Post not found", success: false });
    }

    await post.updateOne({ $pull: { likes: userId } });

    //socket implemet
    const user = await User.findById(userId).select("username profilePicture");
    const postOwnerId = post.author.toString();
    if (postOwnerId !== userId) {
      //emit notifications
      const notification = {
        type: "dislike",
        action: "remove",
        userId,
        userDetails: user,
        postId,
        message: `Your post was disliked by ${user.username} `,
      };

      const postOwnerSocketId = getRecieverSocketId(postOwnerId);

      if (postOwnerSocketId) {
        io.to(postOwnerSocketId).emit("notification", notification);
      }
    }

    return res.status(200).json({
      success: true,
      message: "Post disliked",
      userId,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Function to add a comment to a post
export const addComment = async (req, res) => {
  try {
    const postId = req.params.id;
    const commentKrneWalaUserKiId = req.id;
    const { text } = req.body;

    const post = await Post.findById(postId);

    if (!text)
      return res
        .status(400)
        .json({ message: "Text is required", success: false });

    const comment = await Comment.create({
      text,
      author: commentKrneWalaUserKiId,
      post: postId,
    });

    await comment.populate({
      path: "author",
      select: "username profilePicture",
    });

    post.comments.push(comment._id);
    await post.save();

    return res.status(201).json({
      message: "Comment Added",
      comment,
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};

// Function to get comments of a post
export const getCommentsOfPost = async (req, res) => {
  try {
    const postId = req.params.id;

    const comments = await Comment.find({ post: postId }).populate(
      "author",
      "username profilePicture",
    );

    if (!comments)
      return res
        .status(404)
        .json({ message: "No comments found for this post", success: false });

    return res.status(200).json({ success: true, comments });
  } catch (error) {
    console.log(error);
  }
};

// Function to delete a post (no authorization required)
export const deletePost = async (req, res) => {
  try {
    const postId = req.params.id;

    const post = await Post.findById(postId);
    if (!post)
      return res
        .status(404)
        .json({ message: "Post not found", success: false });
    if (post.author.toString() !== req.id) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to delete this post",
      });
    }

    await Post.findByIdAndDelete(postId);

    const user = await User.findById(post.author);
    if (user) {
      user.posts = user.posts.filter((id) => id.toString() !== postId);
      await user.save();
    }

    await Comment.deleteMany({ post: postId });

    return res.status(200).json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error", success: false });
  }
};

// Function to bookmark a post
export const bookmarkPost = async (req, res) => {
  try {
    const postId = req.params.id;
    const authorId = req.id;
    const post = await Post.findById(postId);
    if (!post)
      return res
        .status(404)
        .json({ message: "Post not found", success: false });

    const user = await User.findById(authorId);
    if (user.bookmarks.includes(post._id)) {
      // Already bookmarked -> remove from the bookmark
      await user.updateOne({ $pull: { bookmarks: post._id } });
      await user.save();
      return res.status(200).json({
        type: "unsaved",
        message: "Post removed from bookmark",
        success: true,
      });
    } else {
      // Bookmark the post
      await user.updateOne({ $addToSet: { bookmarks: post._id } });
      await user.save();
      return res
        .status(200)
        .json({ type: "saved", message: "Post bookmarked", success: true });
    }
  } catch (error) {
    console.log(error);
  }
};
