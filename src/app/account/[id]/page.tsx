// ProfilePage.tsx
"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, LogOut, ImageOff } from "lucide-react";
import { useUser, useClerk, useAuth } from "@clerk/nextjs";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { fetchSubscriptionDetails, fetchUserImages } from "@/services/AccountServices"; // Adjust path

function ImageWithSkeleton({ src, alt, className = "", ...props }: { src: string; alt: string; className?: string }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="relative h-full w-full">
      {!loaded && <Skeleton className="absolute inset-0" />}
      <img
        src={src}
        alt={alt}
        {...props}
        className={`${className} ${!loaded ? "opacity-0" : "opacity-100"} transition-opacity duration-300 object-cover rounded-md`}
        onLoad={() => setLoaded(true)} // Changed to onLoad for <img>
      />
    </div>
  );
}

export default function ProfilePage() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const { userId, getToken } = useAuth();
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 8;

  // Fetch token asynchronously
  const fetchToken = async () => {
    const token = await getToken();
    if (!token) throw new Error("No authentication token available");
    return token;
  };

  // Subscription Query
  const {
    data: subscription,
    isLoading: subLoading,
    error: subError,
  } = useQuery({
    queryKey: ["subscription", userId],
    queryFn: async () => {
      if (!userId) throw new Error("User ID not available");
      const token = await fetchToken();
      return fetchSubscriptionDetails(userId, token);
    },
    enabled: !!userId,
  });

  // Images Query
  const {
    data: generatedImages = [],
    isLoading: isImagesLoading,
    error: imagesError,
  } = useQuery({
    queryKey: ["userImages", userId],
    queryFn: async () => {
      if (!userId) throw new Error("User ID not available");
      const token = await fetchToken();
      return fetchUserImages(userId, token);
    },
    enabled: !!userId,
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white p-4 sm:p-6 md:p-8">
        <Skeleton className="h-10 w-48 mb-10 mx-auto" />
        <div className="flex flex-col items-center mb-10">
          <Skeleton className="rounded-full h-24 w-24 mb-4" />
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-4 w-48 mb-3" />
          <Skeleton className="h-8 w-24" />
        </div>
      </div>
    );
  }

  const avatarUrl = user.imageUrl;
  const email = user.primaryEmailAddress?.emailAddress;
  const fullName = `${user.firstName} ${user.lastName}`;
  const username = user.username || (email ? email.split("@")[0] : "Not set");
  const totalPages = Math.ceil(generatedImages.length / itemsPerPage);
  const currentImages = generatedImages.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white p-4 sm:p-6 md:p-8 lg:p-12">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">Account Settings</h1>
        <Button variant="secondary" size="sm" onClick={() => signOut()}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>

      <section className="mb-10 flex justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <Avatar className="w-20 h-20 sm:w-24 sm:h-24 mb-4 mx-auto">
            <AvatarImage src={avatarUrl} alt="Profile" />
            <AvatarFallback>{user.firstName?.charAt(0)}{user.lastName?.charAt(0)}</AvatarFallback>
          </Avatar>
          <h2 className="text-xl sm:text-2xl font-semibold mb-1">{fullName}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{email}</p>
        </motion.div>
      </section>

      <section className="mb-10">
        <h2 className="text-lg sm:text-xl font-semibold mb-4">Subscription</h2>
        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm mb-6">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">{subscription?.plan_name || "Free Plan"}</CardTitle>
            <CardDescription className="text-gray-500 dark:text-gray-400 text-sm">
              {subscription?.plan_expiry_date
                ? `Renews on ${new Date(subscription.plan_expiry_date).toLocaleDateString()}`
                : "No active subscription"}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            {subLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-4 w-[180px]" />
                <Skeleton className="h-4 w-[220px]" />
              </div>
            ) : subError ? (
              <p className="text-red-500 text-sm">{subError.message || "Failed to load subscription details"}</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Tokens Remaining</p>
                  <p>{subscription?.tokens_remaining || 0}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Model Trainings</p>
                  <p>{subscription?.model_trainings_remaining || 0}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Private Models</p>
                  <p>{subscription?.private_model_loads_remaining || 0}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Plan Status</p>
                  <p>{subscription?.plan ? "Active" : "Inactive"}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Plan Expiry Date</p>
                  <p>{subscription?.plan_expiry_date || "N/A"}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <Card className="relative overflow-hidden rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
            <div className="relative h-40 sm:h-48">
              {/* Retained Next.js Image here since it’s a static URL */}
              <img
                src="https://images.unsplash.com/photo-1739286955038-a4e5ce4f9462?q=80&w=3330&auto=format&fit=crop"
                alt="Promotion"
                className="object-cover w-full h-full"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent flex items-center p-4 sm:p-6">
                <div>
                  <p className="text-xs sm:text-sm text-white mb-1">Limited Time Offer</p>
                  <h3 className="text-lg sm:text-xl font-semibold text-white">Upgrade to Premium</h3>
                </div>
                <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 ml-auto text-white" />
              </div>
            </div>
          </Card>
        </motion.div>
      </section>

      <section className="mb-10">
        <h2 className="text-lg sm:text-xl font-semibold mb-4">Your Generated Images</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          You have generated {generatedImages.length} images.
        </p>
        {isImagesLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: itemsPerPage }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-md" />
            ))}
          </div>
        ) : imagesError ? (
          <p className="text-red-500 text-sm">{imagesError.message}</p>
        ) : generatedImages.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center py-10 text-gray-500 dark:text-gray-400"
          >
            <ImageOff className="w-12 h-12 mb-2" />
            <p className="text-sm sm:text-base">You haven’t created any images yet.</p>
          </motion.div>
        ) : (
          <div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {currentImages.map((img, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                >
                  <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-0">
                      <div className="relative h-32">
                        <ImageWithSkeleton
                          src={img.download_url}
                          alt={`Generated image ${i + 1}`}
                          className="w-full h-full object-cover rounded-md"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row justify-center items-center mt-6 gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={currentPage === 0}
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Page {currentPage + 1} of {totalPages}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={currentPage === totalPages - 1}
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        )}
      </section>

      <section className="mb-10">
        <h2 className="text-lg sm:text-xl font-semibold mb-4">Account Details</h2>
        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
          <CardContent className="p-4 sm:p-6 space-y-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Username</p>
              <div className="flex justify-between items-center">
                <p className="text-sm">{username}</p>
                <Button variant="ghost" size="sm">Change</Button>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Email</p>
              <p className="text-sm">{email}</p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="mb-10">
        <h2 className="text-lg sm:text-xl font-semibold mb-4">Delete Account</h2>
        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <p className="text-sm text-red-600 dark:text-red-400">
                Permanently delete your account, all your data, and cancel your subscription.
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
              >
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
