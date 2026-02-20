import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import { followOrUnfollowUser, getProfile } from "@/redux/slice/authSlice";

import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { AtSign, HeartIcon, MessageCircle } from "lucide-react";

function Profile() {
  const { userProfile, followLoading, error, user } = useSelector(
    (state) => state.auth,
  );
  const { id } = useParams();
  const dispatch = useDispatch();

  const [activeTab, setActiveTab] = useState("posts");

  const isOwnProfile = user?._id === id;

  const isFollowing = user?.following?.includes(id);
  const handleFollow = (targetUserId) => {
    dispatch(followOrUnfollowUser(targetUserId));
  };

  useEffect(() => {
    dispatch(getProfile(id));
  }, [dispatch, id]);

  if (followLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading profile...
      </div>
    );
  }

  if (!userProfile || error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        Profile not found
      </div>
    );
  }

  const displayPosts =
    activeTab === "posts"
      ? userProfile.posts || []
      : activeTab === "saved"
        ? userProfile.bookmarks || []
        : [];

  return (
    <div className="min-h-screen bg-white pb-10">
      <div className="max-w-4xl mx-auto px-4">
        <div className="pt-6 pb-8 flex flex-col sm:flex-row gap-8">
          {/* Avatar */}
          <div className="flex justify-center sm:justify-start">
            <div className="p-1 rounded-full ">
              <Avatar className="h-34 w-34 border-4 border-white">
                <AvatarImage
                  src={userProfile.profilePicture}
                  alt={userProfile.username}
                />
                <AvatarFallback className="bg-gray-800 text-white text-3xl font-bold">
                  {userProfile.username?.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 space-y-5">
            {/* Username + buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-light">{userProfile.username}</h2>

              {isOwnProfile ? (
                <>
                  <Link to="/account/edit">
                    <Button variant="outline" size="sm">
                      Edit profile
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm">
                    View archive
                  </Button>
                </>
              ) : isFollowing ? (
                <>
                  <Button variant="outline" size="sm">
                    Following
                  </Button>
                  <Link to={"/chat"}>
                    <Button variant="outline" size="sm">
                      Message
                    </Button>
                  </Link>
                </>
              ) : (
                <Button
                  onClick={() => handleFollow(id)}
                  className="bg-[#0095f6] hover:bg-[#1877f2] text-white"
                >
                  Follow
                </Button>
              )}
            </div>

            {/* Stats */}
            <div className="flex gap-10 text-sm">
              <div>
                <span className="font-semibold">
                  {userProfile.posts?.length || 0}
                </span>{" "}
                posts
              </div>
              <div>
                <span className="font-semibold">
                  {userProfile.followers?.length || 0}
                </span>{" "}
                followers
              </div>
              <div>
                <span className="font-semibold">
                  {userProfile.following?.length || 0}
                </span>{" "}
                following
              </div>
            </div>

            {/* Bio */}
            <div className="text-sm space-y-1">
              <p className="font-semibold">{userProfile.fullname}</p>
              <p className="whitespace-pre-line">{userProfile.bio}</p>
              <div className="flex items-center gap-1 text-gray-500">
                <AtSign size={14} />
                {userProfile.username}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200">
          <div className="flex justify-around text-xs font-semibold text-gray-500">
            {["posts", "reels", "saved", "tagged"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 flex-1 uppercase transition
                  ${
                    activeTab === tab
                      ? "border-t-2 border-black text-black"
                      : "hover:text-gray-800"
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {activeTab === "posts" || activeTab === "saved" ? (
          displayPosts.length > 0 ? (
            <div className="grid grid-cols-3 gap-1 mt-2">
              {displayPosts.map((post) => (
                <div
                  key={post._id}
                  className="relative group aspect-square bg-gray-100 overflow-hidden"
                >
                  <img
                    src={post.image}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-105 transition"
                  />

                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                    <div className="flex gap-6 text-white text-sm">
                      <div className="flex items-center gap-1">
                        <HeartIcon size={16} fill="white" />
                        {post.likes?.length || 0}
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle size={16} fill="white" />
                        {post.comments?.length || 0}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center text-gray-500">
              No {activeTab === "posts" ? "posts" : "saved posts"} yet
            </div>
          )
        ) : (
          <div className="py-24 text-center text-gray-400">
            {activeTab.toUpperCase()} coming soon 🚧
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
