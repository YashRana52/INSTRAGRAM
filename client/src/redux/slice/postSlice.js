import { axiosInstance } from "@/lib/axios";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { toast } from "sonner";

export const createPost = createAsyncThunk(
  "post/create",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post("/post/addpost", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success(res.data.message || res.data || "post added");
      return res.data.post || res.data;
    } catch (err) {
      toast.error(err.response.data.message || "failed to add post");
      return rejectWithValue(
        err.response?.data?.message || "failed to add post",
      );
    }
  },
);
export const deletePost = createAsyncThunk(
  "post/delete",
  async (postId, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.delete(`/post/delete/${postId}`);

      toast.success(res.data.message || "Post deleted");

      // IMPORTANT: return only postId
      return postId;
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete post");
      return rejectWithValue(
        err.response?.data?.message || "Failed to delete post",
      );
    }
  },
);
export const likeOrDislikePost = createAsyncThunk(
  "post/likeOrDislike",
  async ({ postId, action }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(`/post/${postId}/${action}`);

      toast.success(res.data.message);

      return {
        postId,
        action,
        userId: res.data.userId,
      };
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
      return rejectWithValue(err.response?.data?.message || "Failed");
    }
  },
);
export const addComment = createAsyncThunk(
  "post/addComment",
  async ({ postId, text }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(`/post/${postId}/comment`, { text });

      toast.success(res.data.message);

      return {
        postId,
        comment: res.data.comment,
      };
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add comment");
      return rejectWithValue(
        err.response?.data?.message || "Failed to add comment",
      );
    }
  },
);

export const getAllPosts = createAsyncThunk(
  "post/getAllPosts",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/post/all", {});

      return res.data.posts || res.data;
    } catch (err) {
      toast.error(err.response.data.message || "failed to add post");
      return rejectWithValue(
        err.response?.data?.message || "failed to add post",
      );
    }
  },
);
export const getCommentsOfPost = createAsyncThunk(
  "post/getComments",
  async (postId, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`/post/${postId}/comment/all`);
      return {
        postId,
        comments: res.data.comments,
      };
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to fetch comments");
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch comments",
      );
    }
  },
);

const postSlice = createSlice({
  name: "post",
  initialState: {
    posts: [],
    loading: false,
    error: null,
    creating: false,
    deletingPostId: null,
    commentingPostId: null,
    commentLoading: null,
  },
  reducers: {
    setPosts: (state, action) => {
      state.posts = action.payload;
    },
    clearPosts: (state) => {
      state.posts = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // CREATE POST
      .addCase(createPost.pending, (state) => {
        state.creating = true;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.creating = false;
        state.posts.unshift(action.payload);
      })
      .addCase(createPost.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload;
      })
      .addCase(getAllPosts.fulfilled, (state, action) => {
        state.posts = action.payload;
      })
      // DELETE POST
      .addCase(deletePost.pending, (state, action) => {
        state.deletingPostId = action.meta.arg;
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        state.posts = state.posts.filter((post) => post._id !== action.payload);
        state.deletingPostId = null;
      })
      .addCase(deletePost.rejected, (state, action) => {
        state.deletingPostId = null;
        state.error = action.payload;
      })
      //like dislike
      .addCase(likeOrDislikePost.fulfilled, (state, action) => {
        const { postId, action: type, userId } = action.payload;

        const post = state.posts.find((p) => p._id === postId);
        if (!post) return;

        if (type === "like") {
          post.likes.push(userId);
        } else {
          post.likes = post.likes.filter((id) => id !== userId);
        }
      })
      // ADD COMMENT
      .addCase(addComment.pending, (state, action) => {
        state.commentingPostId = action.meta.arg.postId;
      })

      .addCase(addComment.fulfilled, (state, action) => {
        const { postId, comment } = action.payload;

        const post = state.posts.find((p) => p._id === postId);
        if (!post) return;

        post.comments.push(comment);
        state.commentingPostId = null;
      })

      .addCase(addComment.rejected, (state) => {
        state.commentingPostId = null;
      })
      // COMMENTS of post

      .addCase(getCommentsOfPost.pending, (state, action) => {
        const postId = action.meta.arg;
        const post = state.posts.find((p) => p._id === postId);
        if (post) post.commentLoading = true;
      })
      .addCase(getCommentsOfPost.fulfilled, (state, action) => {
        const { postId, comments } = action.payload;
        const post = state.posts.find((p) => p._id === postId);
        if (!post) return;

        post.comments = comments;
        post.commentLoading = false;
      })
      .addCase(getCommentsOfPost.rejected, (state, action) => {
        const postId = action.meta.arg;
        const post = state.posts.find((p) => p._id === postId);
        if (post) post.commentLoading = false;
        state.error = action.payload;
      });
  },
});
export const { clearPosts } = postSlice.actions;
export default postSlice.reducer;
