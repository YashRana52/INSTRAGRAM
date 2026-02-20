import React, { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent } from "./ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Link } from "react-router-dom";

import { Button } from "./ui/button";
import { formatDateReadable } from "./date/date";
import { useDispatch, useSelector } from "react-redux";
import { addComment, getCommentsOfPost } from "@/redux/slice/postSlice";
import EmojiPicker from "emoji-picker-react";

function CommentDIaloge({ open, setOpen, post }) {
  const [text, setText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const emojiRef = useRef(null);

  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const onEmojiClick = (emojiObject) => {
    setText((prev) => prev + emojiObject.emoji);
  };

  useEffect(() => {
    if (open && post.comments.length === 0) {
      dispatch(getCommentsOfPost(post._id));
    }
  }, [open, post._id, post.comments.length, dispatch]);

  {
    post.commentLoading && <p>Loading comments...</p>;
  }

  const sendMessageHandler = async () => {
    await dispatch(
      addComment({
        postId: post._id,
        text,
      }),
    ).unwrap();

    setText("");
  };

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiRef.current && !emojiRef.current.contains(event.target)) {
        setShowEmoji(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="max-w-[95vw] w-full h-[95vh] p-0 gap-0 overflow-hidden 
               bg-white dark:bg-neutral-950 border-none shadow-2xl rounded-xl
               sm:max-w-[85vw] md:max-w-5xl lg:max-w-6xl"
        onInteractOutside={() => setOpen(false)}
      >
        <div className="flex h-full">
          {/* Left Image */}
          <div className="hidden md:block md:w-1/2 bg-black relative">
            <img
              src={
                post?.image ||
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTIiVE1NFJo91ZA-O_XWXv_1mNuGSnnPceW8tcTr__mUHZ1aiTTjkaw_vnTvQfuUj6DDAnJeR8uRzp6NtOs_4baZnLg_tg4zQSqGkxnGoOU&s=10"
              }
              alt="Post"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>

          {/* Right Content */}
          <div className="w-full md:w-1/2 flex flex-col h-full bg-white dark:bg-neutral-950">
            {/* Header */}
            <div className="flex items-center gap-3 py-1.5 mt-1">
              <Link to="/profile" className="shrink-0">
                <Avatar className="h-9 w-9 ring-2 ring-offset-1 ring-offset-background ring-neutral-200/70 dark:ring-neutral-700/60 hover:ring-neutral-300 dark:hover:ring-neutral-600 transition-all duration-200 hover:scale-105 ml-2">
                  <AvatarImage
                    src={
                      post?.author?.profilePicture ||
                      "https://github.com/shadcn.png"
                    }
                    alt={post?.author?.username}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-linear-to-br from-violet-500 to-fuchsia-600 text-white font-semibold text-base tracking-tight">
                    {post?.author?.username?.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Link>

              <div className="flex flex-col justify-center min-w-0">
                <Link
                  to="/profile"
                  className="font-semibold text-base leading-none hover:underline transition-colors"
                >
                  {post?.author?.username}
                </Link>

                {post?.caption && (
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-snug mt-0.5 line-clamp-2">
                    {post.caption}
                  </p>
                )}
              </div>
            </div>
            <hr className="mt-2" />

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4 md:space-y-5 max-h-[32rem]">
              {post.comments.length > 0 ? (
                [...post.comments].reverse().map((comment) => (
                  <div key={comment._id} className="flex gap-3">
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarImage
                        src={
                          comment?.author?.profilePicture ||
                          "https://github.com/shadcn.png"
                        }
                      />
                      <AvatarFallback>UN</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-semibold mr-1.5">
                          {comment.author.username}
                        </span>
                        {comment?.text}
                      </p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                        {comment.createdAt
                          ? formatDateReadable(comment.createdAt)
                          : "Just now"}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-full flex items-center justify-center text-sm text-neutral-500 dark:text-neutral-400">
                  No comments yet • Be the first!
                </div>
              )}

              <div className="h-24 md:h-20" />
            </div>

            {/* Comment Input */}
            <div className="shrink-0 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
              <div className="px-4 py-3 flex items-center gap-2.5">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.profilePicture} alt="You" />
                  <AvatarFallback>You</AvatarFallback>
                </Avatar>

                {/* Input + Emoji */}
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Add a comment..."
                    className={`
              w-full bg-neutral-50/70 dark:bg-neutral-900/70 
              border border-neutral-200 dark:border-neutral-800 
              rounded-full px-4 py-2.5 text-sm
              placeholder:text-neutral-400 dark:placeholder:text-neutral-500
              focus:outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20
              transition-all duration-200
            `}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        if (text.trim()) sendMessageHandler();
                      }
                    }}
                  />

                  {/* Emoji toggle button */}
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xl"
                    onClick={() => setShowEmoji(!showEmoji)}
                  >
                    😀
                  </button>

                  {/* Emoji Picker */}
                  {showEmoji && (
                    <div
                      ref={emojiRef}
                      className="absolute bottom-full right-0 mb-2 z-50"
                    >
                      <EmojiPicker
                        onEmojiClick={onEmojiClick}
                        height={300}
                        width={300}
                      />
                    </div>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  disabled={!text.trim()}
                  onClick={sendMessageHandler}
                  className={`
            font-medium text-blue-600 dark:text-blue-500
            hover:text-blue-700 dark:hover:text-blue-400
            disabled:opacity-40 disabled:cursor-not-allowed
            px-3 min-w-52px
            transition-colors
          `}
                >
                  Post
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default CommentDIaloge;
