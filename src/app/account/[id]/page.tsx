"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, LogOut } from "lucide-react";
import Image from "next/image";
import { useUser, useClerk, useAuth } from "@clerk/nextjs";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from 'axios';

function ImageWithSkeleton({ src, alt, className = "", ...props }: { src: string; alt: string; className?: string }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="relative h-full w-full">
      {!loaded && <Skeleton className="absolute inset-0" />}
      <Image
        src={src}
        alt={alt}
        {...props}
        className={`${className} ${!loaded ? "opacity-0" : "opacity-100"} transition-opacity duration-300`}
        onLoadingComplete={() => setLoaded(true)}
      />
    </div>
  );
}

export default function ProfilePage() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const { userId, getToken } = useAuth();
  const [subscription, setSubscription] = useState<any>(null);
  const [subLoading, setSubLoading] = useState(true);
  const [subError, setSubError] = useState('');
  const [isImagesLoading, setIsImagesLoading] = useState(true);
  const [generatedImages, setGeneratedImages] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 8;

  useEffect(() => {
    const fetchSubDetails = async () => {
      try {
        if (!userId) return; // Ensure userId is available
        const token = await getToken();
        const response = await axios.get(
          `https://api.imagepipeline.io/user/${userId}`, // Use userId directly
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
        setSubscription(response.data);
      } catch (err) {
        setSubError('Failed to fetch subscription details');
        console.error('Subscription error:', err);
      } finally {
        setSubLoading(false);
      }
    };

    const fetchImages = async () => {
      try {
        if (!userId) return; // Ensure userId is available
        const token = await getToken();
        const response = await axios.get(
          `https://api.imagepipeline.io/user/${userId}/images`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setGeneratedImages(response.data);
      } catch (err) {
        console.error('Failed to fetch images:', err);
      } finally {
        setIsImagesLoading(false);
      }
    };

    fetchSubDetails();
    fetchImages();
  }, [userId, getToken]); // Add userId and getToken to dependency array

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white p-6 md:p-8 lg:p-12">
        <Skeleton className="h-10 w-48 mb-10" />
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white p-6 md:p-8 lg:p-12 overflow-y-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Account Settings</h1>
        <Button variant="secondary" size="sm" onClick={() => signOut()}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>

      <section className="mb-10">
        <div className="flex flex-col items-center">
          <Avatar className="w-24 h-24 mb-4">
            <AvatarImage src={avatarUrl} alt="Profile" />
            <AvatarFallback>{user.firstName?.charAt(0)}{user.lastName?.charAt(0)}</AvatarFallback>
          </Avatar>
          <h2 className="text-2xl font-semibold mb-1">{fullName}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{email}</p>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Subscription</h2>
        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 mb-4">
          <CardHeader>
            <CardTitle className="text-lg">
              {subscription?.plan_name || "Free Plan"}
            </CardTitle>
            <CardDescription className="text-gray-500 dark:text-gray-400">
              {subscription?.plan_expiry_date ? `Renews on ${new Date(subscription.plan_expiry_date).toLocaleDateString()}` : "No active subscription"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {subLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-4 w-[180px]" />
                <Skeleton className="h-4 w-[220px]" />
              </div>
            ) : subError ? (
              <p className="text-red-500 text-sm">{subError}</p>
            ) : (
              <div className="grid grid-cols-2 gap-4 text-sm">
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
                  <p>{subscription?.plan_expiry_date || 0}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <Card className="relative overflow-hidden rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <div className="relative h-48">
              <Image
                src="https://images.unsplash.com/photo-1739286955038-a4e5ce4f9462?q=80&w=3330&auto=format&fit=crop"
                alt="Promotion"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center p-6">
                <div>
                  <p className="text-sm text-white mb-1">Limited Time Offer</p>
                  <h3 className="text-xl font-semibold text-white">Upgrade to Premium</h3>
                </div>
                <ArrowRight className="w-6 h-6 ml-auto text-white" />
              </div>
            </div>
          </Card>
        </motion.div>
      </section>

      {/* Generated Images Section with Pagination */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Your Generated Images</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          You have generated {generatedImages.length} images.
        </p>
        {isImagesLoading ? (
          <div className="flex space-x-4 overflow-x-auto pb-4">
            {Array.from({ length: itemsPerPage }).map((_, i) => (
              <Skeleton
                key={i}
                className="min-w-[150px] h-32 rounded-md"
              />
            ))}
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {currentImages.map((img, i) => (
                <Card
                  key={i}
                  className="min-w-[150px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                >
                  <CardContent className="p-0">
                    <div className="relative h-32">
                      {/* <ImageWithSkeleton
                        src={img.download_url}
                        alt={`Generated image ${i + 1}`}
                        fill
                        className="object-cover rounded-md"
                      /> */}

                      <img src={img.download_url} alt={`Generated image ${i + 1}`} />
                    </div>

                  </CardContent>
                </Card>
              ))}
            </div>
            {totalPages > 1 && (
              <div className="flex justify-center mt-4 space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={currentPage === 0}
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
                >
                  Previous
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={currentPage === totalPages - 1}
                  onClick={() =>
                    setCurrentPage((prev) =>
                      Math.min(prev + 1, totalPages - 1)
                    )
                  }
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Account Details Section */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Account Details</h2>
        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <CardContent className="p-6 space-y-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Username
              </p>
              <div className="flex justify-between items-center">
                <p className="text-sm">{username}</p>
                <Button variant="ghost" size="sm">
                  Change
                </Button>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Email
              </p>
              <p className="text-sm">{email}</p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Delete Account Section */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Delete Account</h2>
        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <p className="text-sm text-red-600 dark:text-red-400 mb-4 sm:mb-0">
                Permanently delete your account, all your data, and cancel your
                subscription.
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