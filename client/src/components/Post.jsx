import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import {
  Bookmark,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Send,
  BookmarkCheck,
} from "lucide-react";
import { Button } from "./ui/button";

import CommentDIaloge from "./CommentDIaloge";

import { Input } from "./ui/input";
import { Separator } from "./ui/separator";
import { useDispatch, useSelector } from "react-redux";
import {
  addComment,
  deletePost,
  likeOrDislikePost,
} from "@/redux/slice/postSlice";
import { Badge } from "./ui/badge";
import { bookMark, followOrUnfollowUser } from "@/redux/slice/authSlice";

function Post({ post }) {
  const { user, bookmarks } = useSelector((state) => state.auth);
  const { deletingPostId, commentingPostId } = useSelector(
    (state) => state.post,
  );
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);

  const [likeLoading, setLikeLoading] = useState(false);

  const dispatch = useDispatch();
  // ye use hota jb ek br comment pe click kr diya to pta chal jaye ki comment ho rhi pending state show krta
  const isDeleting = deletingPostId === post._id;
  const isCommentLoading = commentingPostId === post._id;
  const isBookmarked = bookmarks.includes(post._id);

  const changeEventHandler = async (e) => {
    e.preventDefault();
    const inputText = e.target.value;
    if (inputText.trim()) {
      setText(inputText);
    } else {
      setText("");
    }
  };
  //delete post handler
  const deletePostHandler = async () => {
    dispatch(deletePost(post._id));
  };
  //like dislike post handler
  const likeOrDislikeHandler = async () => {
    if (likeLoading) return;

    setLikeLoading(true);

    const action = isLiked ? "dislike" : "like";

    try {
      await dispatch(
        likeOrDislikePost({
          postId: post._id,
          action,
        }),
      ).unwrap();
    } finally {
      setLikeLoading(false);
    }
  };

  const isLiked = post.likes?.some(
    (id) => id === user._id || id?._id === user._id,
  );

  //comment post handler
  const commentHandler = async () => {
    if (!text.trim()) return;
    await dispatch(
      addComment({
        postId: post._id,
        text,
      }),
    ).unwrap();

    setText("");
  };

  //handler bookmark
  const handleBookmark = () => {
    dispatch(bookMark({ postId: post._id }));
  };

  const handleFollow = (targetUserId) => {
    dispatch(followOrUnfollowUser(targetUserId));
  };

  return (
    <div className="my-6 w-full max-w-md mx-auto bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 ring-2 ring-offset-2 ring-offset-background ring-primary/30 transition-all hover:ring-primary/60">
            <AvatarImage
              src={
                post?.author?.profilePicture || "https://github.com/shadcn.png"
              }
              alt={post?.author?.username || "User"}
            />
            <AvatarFallback className="bg-gradient-to-tr from-violet-500 to-fuchsia-500 text-white font-medium">
              {post?.author?.username?.slice(0, 2).toUpperCase() || "YR"}
            </AvatarFallback>
          </Avatar>

          <div className="flex items-center gap-2.5">
            <span className="font-medium text-base tracking-tight">
              {post?.author?.username || "Yash Rana"}
            </span>

            {post.author?._id === user._id && (
              <Badge
                variant="secondary"
                className="text-xs font-semibold px-2 py-0.5 bg-primary/10 text-primary hover:bg-primary/15 transition-colors"
              >
                author
              </Badge>
            )}
          </div>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-xs p-2 rounded-2xl">
            <div className="flex flex-col divide-y divide-neutral-200 dark:divide-neutral-800">
              {post.author._id !== user._id && (
                <Button
                  onClick={() => handleFollow(post.author._id)}
                  variant="ghost"
                  className="justify-center py-3 text-red-500 hover:text-red-600 font-medium rounded-none"
                >
                  {user?.following?.includes(post.author._id)
                    ? "Unfollow"
                    : "Follow"}
                </Button>
              )}

              <Button
                onClick={handleBookmark}
                variant="ghost"
                className="justify-center py-3 rounded-none"
              >
                Add to favorites
              </Button>

              {post.author._id === user._id && (
                <Button
                  onClick={deletePostHandler}
                  disabled={isDeleting}
                  variant="ghost"
                  className="justify-center py-3 text-red-500 hover:text-red-600 rounded-none"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Image */}
      <div className="relative aspect-square bg-neutral-100 dark:bg-neutral-900">
        <img
          src={post.image}
          alt="Post"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-5">
          {/* LIKE */}
          <div className="relative group">
            <button
              onClick={() => likeOrDislikeHandler(post._id)}
              disabled={likeLoading}
              className={`transition-colors cursor-pointer ${
                isLiked
                  ? "text-red-500"
                  : "text-neutral-700 dark:text-neutral-300"
              }`}
            >
              <Heart
                className="h-6 w-6"
                strokeWidth={1.8}
                fill={isLiked ? "currentColor" : "none"}
              />
            </button>

            <span
              className="absolute -top-7 left-1/2 -translate-x-1/2
      scale-0 group-hover:scale-100 transition-transform
      bg-black text-white text-xs px-2 py-1 rounded-md whitespace-nowrap"
            >
              {isLiked ? "Dislike" : "Like"}
            </span>
          </div>

          {/* COMMENT */}
          <div className="relative group">
            <button
              onClick={() => setOpen(true)}
              className="text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white"
            >
              <MessageCircle className="h-6 w-6" strokeWidth={1.8} />
            </button>

            <span
              className="absolute -top-7 left-1/2 -translate-x-1/2
      scale-0 group-hover:scale-100 transition-transform
      bg-black text-white text-xs px-2 py-1 rounded-md"
            >
              Comment
            </span>
          </div>

          {/* SHARE */}
          <div className="relative group">
            <button className="text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white">
              <Send className="h-6 w-6" strokeWidth={1.8} />
            </button>

            <span
              className="absolute -top-7 left-1/2 -translate-x-1/2
      scale-0 group-hover:scale-100 transition-transform
      bg-black text-white text-xs px-2 py-1 rounded-md"
            >
              Share
            </span>
          </div>
        </div>

        <div className="relative group">
          <button
            onClick={() => handleBookmark(post._id)}
            className="transition-all duration-200 hover:scale-110"
            aria-label={isBookmarked ? "Remove bookmark" : "Bookmark"}
          >
            {isBookmarked ? (
              <BookmarkCheck className="h-6 w-6 text-yellow-500" />
            ) : (
              <Bookmark className="h-6 w-6 text-neutral-700 dark:text-neutral-300" />
            )}
          </button>

          <span
            className="absolute -top-7 left-1/2 -translate-x-1/2
    scale-0 group-hover:scale-100 transition-transform duration-150
    bg-black text-white text-xs px-2 py-1 rounded-md whitespace-nowrap"
          >
            {isBookmarked ? "Unsave" : "Save"}
          </span>
        </div>
      </div>

      {/* Likes */}
      {post.likes.length > 0 && (
        <div className="px-4 pb-1">
          <span className="font-semibold text-sm">
            {post.likes.length} {post.likes.length === 1 ? "like" : "likes"}
          </span>
        </div>
      )}

      {/* Caption */}
      <div className="px-4 pb-2 text-sm">
        <span className="font-semibold mr-2">
          {" "}
          {post.author?.username || "Unknown"}
        </span>
        {post?.caption}
      </div>

      {/* View comments */}
      {post.comments.length > 1 && (
        <button
          onClick={() => setOpen(true)}
          className="cursor-pointer px-4 pb-3 text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
        >
          View all {post.comments.length} comments
        </button>
      )}

      <Separator className="mx-4" />

      {/* Comment input */}
      <div className="flex items-center gap-3 px-4 py-3">
        <Input
          value={text}
          onChange={changeEventHandler}
          placeholder="Add a comment..."
          className="border-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent text-sm placeholder:text-neutral-400 dark:placeholder:text-neutral-600"
        />

        {text && (
          <Button
            onClick={commentHandler}
            disabled={isCommentLoading}
            variant="ghost"
            size="sm"
            className="font-medium px-3 text-blue-500 hover:text-blue-600 "
          >
            {isCommentLoading ? "Posting..." : "Post"}
          </Button>
        )}
      </div>

      {/*  comment dialog component */}
      <CommentDIaloge post={post} open={open} setOpen={setOpen} />
    </div>
  );
}

export default Post;
