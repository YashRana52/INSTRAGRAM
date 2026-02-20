import React, { useRef, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Loader2 } from "lucide-react";
import { editProfileThunk } from "@/redux/slice/authSlice";

function EditProfile() {
  const imageRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user, loading, error, success } = useSelector((store) => store.auth);

  const [input, setInput] = useState({
    profilePhoto: null,
    bio: user?.bio || "",
    gender: user?.gender || "",
  });
  console.log("user", user);

  useEffect(() => {
    if (success && user.id) {
      navigate(`/profile/${user.id}`);
    }
  }, [success, user, navigate]);

  //  File Change
  const fileChangeHandler = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setInput((prev) => ({
        ...prev,
        profilePhoto: file,
      }));
    }
  };

  const selectChangehandler = (value) => {
    setInput((prev) => ({
      ...prev,
      gender: value,
    }));
  };

  //  Submit Handler
  const editProfileHandler = (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("bio", input.bio);
    formData.append("gender", input.gender);

    if (input.profilePhoto) {
      formData.append("profilePicture", input.profilePhoto);
    }

    dispatch(editProfileThunk(formData));
  };

  return (
    <div className="flex max-w-2xl mx-auto pl-10">
      <form
        onSubmit={editProfileHandler}
        className="flex flex-col gap-6 w-full my-8"
      >
        <h1 className="font-bold text-xl">Edit Profile</h1>

        {/* Profile Section */}
        <div className="flex items-center justify-between bg-gray-100 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12">
              <AvatarImage
                src={
                  input.profilePhoto
                    ? URL.createObjectURL(input.profilePhoto)
                    : user?.profilePicture || "default-avatar.png"
                }
                alt="profile_img"
                className="object-cover rounded-full"
              />
              <AvatarFallback>
                {user?.username?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>

            <div className="flex flex-col">
              <h1 className="font-bold text-sm text-gray-800">
                {user?.username || "Unknown"}
              </h1>
              <span className="text-gray-600 text-sm whitespace-nowrap">
                {input.bio || "Add your bio"}
              </span>
            </div>
          </div>

          <input
            type="file"
            className="hidden"
            ref={imageRef}
            onChange={fileChangeHandler}
          />

          <Button type="button" onClick={() => imageRef.current?.click()}>
            Change Photo
          </Button>
        </div>

        {/* Bio */}
        <div>
          <h1 className="font-bold text-xl mb-2">Bio</h1>
          <textarea
            value={input.bio}
            onChange={(e) =>
              setInput((prev) => ({
                ...prev,
                bio: e.target.value,
              }))
            }
            className="focus-visible:ring-transparent w-full p-2 border rounded-md"
          />
        </div>

        {/* Gender */}
        <div>
          <h1 className="font-bold mb-2">Gender</h1>
          <Select value={input.gender} onValueChange={selectChangehandler}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Error */}
        {error && <p className="text-red-500 text-sm">{error}</p>}

        {/* Submit */}
        <div className="flex justify-end">
          {loading ? (
            <Button className="w-fit" disabled>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Please wait
            </Button>
          ) : (
            <Button type="submit" className="w-fit">
              Submit
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}

export default EditProfile;
