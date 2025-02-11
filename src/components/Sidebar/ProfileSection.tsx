import { Zap } from "lucide-react";
import { useUser } from "@clerk/nextjs"; // Import Clerk's useUser hook

export function ProfileSection() {
  // Fetch the user data using Clerk's useUser hook
  const { user } = useUser();

  // If the user is not loaded yet, show a loading state
  if (!user) {
    return <div>Loading...</div>;
  }

  // Extract the user's avatar URL and email
  const avatarUrl = user.imageUrl; // Clerk provides the user's avatar URL
  const email = user.primaryEmailAddress?.emailAddress; // Clerk provides the primary email address

  return (
    <div className="w-full max-w-sm border-none dark:bg-gray-800 rounded-lg shadow-sm">
      {/* Profile Section */}
      <div className="pb-2 px-4 pt-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full overflow-hidden">
            {/* Display the user's avatar */}
            <img
              src={avatarUrl}
              alt="Profile Picture"
              className="h-full w-full object-cover"
            />
            {/* Fallback if no avatar is available */}
            <div className="h-full w-full flex items-center justify-center bg-gray-300 dark:bg-gray-700">
              {user.firstName?.charAt(0)}
              {user.lastName?.charAt(0)}
            </div>
          </div>
          <div>
            {/* Display the user's full name */}
            <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
              {user.firstName} {user.lastName}
            </div>
            {/* Display the user's email */}
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {email}
            </div>
          </div>
        </div>
      </div>
      <div className="h-px bg-gray-200 dark:bg-gray-700 mx-4" />

      {/* Plan Info */}
      <div className="pt-4 pb-2 px-4">
        <div className="flex justify-between text-sm">
          <span className="font-medium text-gray-800 dark:text-gray-200">Free</span>
          <span className="text-gray-500 dark:text-gray-400">10 credits left</span>
        </div>
        <button
          className="mt-3 w-full rounded-md border border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 py-2 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors duration-200 flex items-center justify-center gap-2"
        >
          <Zap className="h-4 w-4" />
          Upgrade plan
        </button>
      </div>
      <div className="h-px bg-gray-200 dark:bg-gray-700 mx-4" />
    </div>
  );
}