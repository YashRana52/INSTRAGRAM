import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button"; // shadcn/ui Button
import { Link } from "react-router-dom";
import {
  followOrUnfollowUser,
  getSuggestedUsers,
} from "@/redux/slice/authSlice";

function RightSidebar() {
  const { user, suggestedUsers } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const handleFollow = (targetUserId) => {
    dispatch(followOrUnfollowUser(targetUserId));
  };

  useEffect(() => {
    if (!suggestedUsers?.length) {
      dispatch(getSuggestedUsers());
    }
  }, [dispatch, suggestedUsers]);

  return (
    <div className="hidden lg:block w-80 xl:w-96 pr-6 py-8 sticky top-0 h-screen overflow-y-auto bg-white">
      <div className="space-y-6">
        {/* Your Profile Card */}
        <Link
          to={`/profile/${user?._id}`}
          className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all group"
        >
          <Avatar className="h-12 w-12 ring-2 ring-offset-2 ring-offset-white ring-blue-100 group-hover:ring-blue-200 transition-all">
            <AvatarImage
              src={user?.profilePicture || "https://github.com/shadcn.png"}
              alt={user?.username}
            />
            <AvatarFallback className="bg-gradient-to-tr from-blue-400 to-purple-400 text-white font-semibold text-lg">
              {user?.username?.slice(0, 2).toUpperCase() || "YR"}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <p className="font-semibold text-base truncate text-gray-900">
              {user?.username}
            </p>
            <p className="text-sm text-gray-500 truncate">
              {user?.bio || "Add your bio..."}
            </p>
          </div>
        </Link>

        {/* Suggested Users Section */}
        <div className="rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 pt-5 pb-3 flex items-center justify-between">
            <h2 className="font-semibold text-gray-700">Suggested for you</h2>
            <button className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">
              See All
            </button>
          </div>

          <div className="divide-y divide-gray-100">
            {suggestedUsers?.map((sugg) => (
              <div
                key={sugg._id}
                className="px-5 py-4 flex items-center justify-between gap-3 hover:bg-gray-50 transition-colors"
              >
                <Link
                  to={`/profile/${sugg._id}`}
                  className="flex items-center gap-3 flex-1"
                >
                  <Avatar className="h-11 w-11 ring-1 ring-offset-1 ring-offset-white ring-gray-200">
                    <AvatarImage
                      src={
                        sugg?.profilePicture || "https://github.com/shadcn.png"
                      }
                      alt={sugg?.username}
                    />
                    <AvatarFallback className="bg-gradient-to-tr from-blue-500 to-purple-500 text-white font-medium">
                      {sugg?.username?.slice(0, 2).toUpperCase() || "?"}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate text-gray-900">
                      {sugg.username}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {sugg?.bio || "Suggested user"}
                    </p>
                  </div>
                </Link>
                <Button
                  onClick={() => handleFollow(sugg._id)}
                  size="sm"
                  variant="outline"
                  className={`rounded-full px-5 transition-colors ${
                    user?.following?.includes(sugg._id)
                      ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      : "border-blue-200 text-blue-600 hover:bg-blue-50"
                  }`}
                >
                  {user?.following?.includes(sugg._id) ? "Unfollow" : "Follow"}
                </Button>
              </div>
            ))}

            {!suggestedUsers?.length && (
              <p className="px-5 py-6 text-center text-gray-500 text-sm">
                No suggestions yet...
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default RightSidebar;
