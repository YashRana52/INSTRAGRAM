import React, { useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { readFileAsDataURL } from "@/lib/utils";
import { Loader2, ImagePlus } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { createPost } from "@/redux/slice/postSlice";

function CreatePost({ open, setOpen }) {
  const imageRef = useRef(null);
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const dispatch = useDispatch();
  const { creating } = useSelector((state) => state.post);
  const { user } = useSelector((state) => state.auth);

  const fileChangeHandler = async (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    try {
      const dataUrl = await readFileAsDataURL(selectedFile);
      setImagePreview(dataUrl);
    } catch (error) {
      console.error("Failed to read file:", error);
    }
  };

  const createPostHandler = async (e) => {
    e.preventDefault();

    if (!file) return;

    const formData = new FormData();
    formData.append("caption", caption);
    formData.append("image", file);

    const res = await dispatch(createPost(formData));

    // success
    if (createPost.fulfilled.match(res)) {
      setCaption("");
      setFile(null);
      setImagePreview("");
      setOpen(false); // dialog close
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="sm:max-w-[500px] p-0 gap-0"
        onInteractOutside={() => setOpen(false)}
      >
        <DialogHeader className="p-4 border-b">
          <DialogTitle className="text-center font-semibold text-lg">
            Create new post
          </DialogTitle>
        </DialogHeader>

        <div className="p-4 flex items-center gap-3 border-b">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user.profilePicture} alt="@username" />
            <AvatarFallback>YA</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="font-medium text-sm">{user?.username}</h1>
            {user?.bio && (
              <p className="text-xs text-muted-foreground">{user.bio}</p>
            )}
          </div>
        </div>

        <form onSubmit={createPostHandler} className="flex flex-col">
          <Textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Write a caption..."
            className="min-h-[100px] border-none focus-visible:ring-0 focus-visible:ring-offset-0 resize-none rounded-none px-4 py-3 text-base"
            maxLength={2200}
          />

          {imagePreview && (
            <div className="relative max-h-[380px] overflow-hidden bg-black/5 flex items-center justify-center">
              <img
                src={imagePreview}
                alt="Preview"
                className="max-h-[380px] w-full object-contain"
              />
            </div>
          )}

          <div className="p-4 border-t">
            <input
              ref={imageRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={fileChangeHandler}
            />

            {!imagePreview ? (
              <Button
                type="button"
                variant="outline"
                className="w-full h-11 gap-2"
                onClick={() => imageRef.current?.click()}
              >
                <ImagePlus size={18} />
                Select from computer
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => {
                  setImagePreview("");
                  setFile(null);
                  if (imageRef.current) imageRef.current.value = "";
                }}
              >
                Remove photo
              </Button>
            )}
          </div>

          <div className="px-4 pb-4 pt-2">
            <Button
              type="submit"
              className="w-full bg-[#0095F6] hover:bg-[#1877f2] transition-colors"
              disabled={creating || !imagePreview}
            >
              {creating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Posting...
                </>
              ) : (
                "Share"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default CreatePost;
