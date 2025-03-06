import { HelpCircle, Zap, User, LogOut } from "lucide-react";
import { useClerk, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

interface ProfileSectionProps {
  planName: string;
  creditsLeft: number;
}

export function ProfileSection({ planName, creditsLeft }: ProfileSectionProps) {
  const { user } = useUser();
  const { signOut } = useClerk();

  // Show a skeleton state while user data is loading.
  if (!user) {
    return (
      <div className="w-full max-w-sm bg-text dark:bg-[#1B1B1D] rounded-lg shadow p-4">
        {/* Profile header skeleton */}
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full animate-pulse" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4 animate-pulse" />
            <Skeleton className="h-3 w-1/2 animate-pulse" />
          </div>
        </div>
        {/* Divider */}
        <div className="my-4">
          <Skeleton className="h-px w-full animate-pulse" />
        </div>
        {/* Plan info skeleton */}
        <div className="space-y-3">
          <Skeleton className="h-3 w-1/2 animate-pulse" />
          <Skeleton className="h-8 w-full animate-pulse" />
        </div>
      </div>
    );
  }

  // Extract user info.
  const avatarUrl = user.imageUrl;
  const email = user.primaryEmailAddress?.emailAddress;
  const uniqueName = email ? email.split("@")[0] : "profile";

  return (
    <div className="w-full max-w-sm bg-text dark:bg-[#1B1B1D] rounded-lg shadow overflow-hidden">
      {/* Profile Section */}
      <div className="p-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Profile Picture"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-bordergraydark dark:text-bordergray">
                {user.firstName?.charAt(0)}
                {user.lastName?.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800 dark:text-bordergray">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{email}</p>
          </div>
        </div>
        
      </div>
      <div className="h-px bg-bordergray dark:bg-[#2A2A2D]" />

      {/* Plan Info - Hidden on mobile and tablet */}
      <div className="p-4 md:block hidden cursor-default">
        <div className="flex justify-between text-sm">
          <span className="font-medium text-gray-800 dark:text-bordergray">
            {planName}
          </span>
          <span className="text-gray-500 dark:text-bordergray">
            {creditsLeft} credits left
          </span>
        </div>
        <button className="mt-3 w-full rounded-md border border-accent dark:border-notice bg-lightblue dark:bg-blue-900/20 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors duration-200 flex items-center justify-center gap-2 cursor-pointer">
          <Zap className="h-4 w-4" />
          <Link
          href="https://docs.imagepipeline.io/pricing"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-gray-800 dark:text-bordergray hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors duration-200 cursor-pointer"
        >
          Upgrade plan
        </Link>
        </button>
      </div>
      <div className="h-px bg-bordergray dark:bg-[#2A2A2D]" />

      {/* Footer Section */}
      <div className="p-4 flex flex-col gap-2 cursor-default">
        <Link
          href="https://docs.imagepipeline.io/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-gray-800 dark:text-bordergray hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors duration-200 cursor-pointer"
        >
          <HelpCircle className="h-4 w-4" />
          Help & Documentation
        </Link>

        <Link
          href={`/account/${uniqueName}`}
          className="flex items-center gap-2 text-sm text-accent dark:text-notice hover:text-blue-800 transition-colors duration-200 cursor-pointer"
        >
          <User className="h-4 w-4" />
          Profile
        </Link>
        <button
          onClick={() => signOut()}
          className="flex items-center gap-2 text-sm text-destructive dark:text-chart-1 hover:text-red-800 transition-colors duration-200 cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </div>
  );
}