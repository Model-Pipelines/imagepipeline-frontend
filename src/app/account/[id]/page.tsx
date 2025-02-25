// ProfilePage.tsx
"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowRight, LogOut, ImageOff, Home, Eye, EyeOff, Copy, RefreshCw } from "lucide-react";
import { useUser, useClerk, useAuth } from "@clerk/nextjs";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchSubscriptionDetails, fetchUserImages, resetApiKey } from "@/services/AccountServices";
import Link from "next/link";
import { toast } from "@/hooks/use-toast";

function ImageWithSkeleton({ src, alt, className = "", ...props }: { src: string; alt: string; className?: string }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="relative h-full w-full">
      {!loaded && <Skeleton className="absolute inset-0 bg-gray-200 dark:bg-gray-700" />}
      <img
        src={src}
        alt={alt}
        {...props}
        className={`${className} ${!loaded ? "opacity-0" : "opacity-100"} transition-opacity duration-300 object-cover rounded-md`}
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}

export default function ProfilePage() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const { userId, getToken } = useAuth();
  const [currentPage, setCurrentPage] = useState(0);
  const [showApiKey, setShowApiKey] = useState(false);
  const itemsPerPage = 8;
  const queryClient = useQueryClient();

  const fetchToken = async () => {
    const token = await getToken();
    if (!token) throw new Error("No authentication token available");
    return token;
  };

  // Subscription Query
  const { data: subscription, isLoading: subLoading, error: subError } = useQuery({
    queryKey: ["subscription", userId],
    queryFn: async () => {
      if (!userId) throw new Error("User ID not available");
      const token = await fetchToken();
      return fetchSubscriptionDetails(userId, token);
    },
    enabled: !!userId,
  });

  // Images Query
  const { data: generatedImages = [], isLoading: isImagesLoading, error: imagesError } = useQuery({
    queryKey: ["userImages", userId],
    queryFn: async () => {
      if (!userId) throw new Error("User ID not available");
      const token = await fetchToken();
      const images = await fetchUserImages(userId, token);
      return images.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    },
    enabled: !!userId,
  });

  // API Key Query
  const { data: apiKeyData, isLoading: apiKeyLoading, error: apiKeyError } = useQuery({
    queryKey: ["apiKey", userId],
    queryFn: async () => {
      if (!userId) throw new Error("User ID not available");
      const token = await fetchToken();
      return fetchSubscriptionDetails(userId, token);
    },
    enabled: !!userId,
  });

  // Reset API Key Mutation
  const resetApiKeyMutation = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error("User ID not available");
      const token = await fetchToken();
      return resetApiKey(userId, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["apiKey", userId] });
      toast({ title: "API Key reset successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to reset API Key", description: error.message, variant: "destructive" });
    },
  });

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "API Key copied to clipboard" });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white p-4 sm:p-6 md:p-8">
        <Skeleton className="h-10 w-48 mb-10 mx-auto bg-gray-200 dark:bg-gray-700" />
        <div className="flex flex-col items-center mb-10">
          <Skeleton className="rounded-full h-24 w-24 mb-4 bg-gray-200 dark:bg-gray-700" />
          <Skeleton className="h-6 w-32 mb-2 bg-gray-200 dark:bg-gray-700" />
          <Skeleton className="h-4 w-48 mb-3 bg-gray-200 dark:bg-gray-700" />
          <Skeleton className="h-8 w-24 bg-gray-200 dark:bg-gray-700" />
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

  // const deleteUser = async = () =>{
  //   //need delete user functionality over here 
  // }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white px-4 py-6 sm:px-6 md:px-8 lg:px-12">
      {/* Header */}
      <header className="mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Your Dashboard</h1>
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="sm"
            asChild
            className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Home
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => signOut()}
            className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto space-y-8">
        {/* Profile Summary */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center text-center"
        >
          <Avatar className="w-24 h-24 sm:w-28 sm:h-28 mb-4 border-2 border-gray-200 dark:border-gray-600 shadow-md">
            <AvatarImage src={avatarUrl} alt="Profile" />
            <AvatarFallback className="text-xl bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100">
              {user.firstName?.charAt(0)}
              {user.lastName?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-gray-100">{fullName}</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">{email}</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">@{username}</p>
        </motion.section>

        {/* Subscription */}
        <section>
          <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Subscription</h2>
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg text-gray-900 dark:text-gray-100">
                {subscription?.plan_name || "Free Plan"}
              </CardTitle>
              <CardDescription className="text-sm text-gray-500 dark:text-gray-400">
                {subscription?.plan_expiry_date
                  ? `Renews on ${new Date(subscription.plan_expiry_date).toLocaleDateString()}`
                  : "No active subscription"}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              {subLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700" />
                  <Skeleton className="h-4 w-2/3 bg-gray-200 dark:bg-gray-700" />
                  <Skeleton className="h-4 w-4/5 bg-gray-200 dark:bg-gray-700" />
                </div>
              ) : subError ? (
                <p className="text-red-500 dark:text-red-400 text-sm">Error loading subscription</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Tokens Remaining</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {subscription?.tokens_remaining || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Model Trainings</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {subscription?.model_trainings_remaining || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Private Models</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {subscription?.private_model_loads_remaining || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Status</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {subscription?.plan ? "Active" : "Inactive"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Expiry</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {subscription?.plan_expiry_date || "N/A"}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* API Key */}
        <section>
          <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">API Key</h2>
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 shadow-sm">
            <CardContent className="p-4 sm:p-6 space-y-4">
              {apiKeyLoading ? (
                <Skeleton className="h-12 w-full bg-gray-200 dark:bg-gray-700" />
              ) : apiKeyError ? (
                <p className="text-red-500 dark:text-red-400 text-sm">Error loading API key</p>
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <div className="flex-1 flex items-center gap-2 bg-gray-100 dark:bg-gray-700 p-3 rounded-md border border-gray-200 dark:border-gray-600 w-full">
                      <p className="text-sm font-mono truncate flex-1 text-gray-900 dark:text-gray-100">
                        {showApiKey ? apiKeyData?.api_key : "••••••••••••••••••••••••••••••••"}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowApiKey(!showApiKey)}
                        aria-label={showApiKey ? "Hide API Key" : "Show API Key"}
                        className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                      >
                        {showApiKey ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyToClipboard(apiKeyData?.api_key)}
                        aria-label="Copy API Key"
                        className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                      >
                        <Copy className="h-5 w-5" />
                      </Button>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => resetApiKeyMutation.mutate()}
                      disabled={resetApiKeyMutation.isPending}
                      className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${resetApiKeyMutation.isPending ? "animate-spin" : ""}`} />
                      Reset
                    </Button>
                  </div>
                  <p className="text-xs text-yellow-600 dark:text-yellow-400">
                    Warning: Keep your API key private. Sharing it publicly or with AI services may compromise your
                    account.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Generated Images */}
        <section>
          <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Generated Images</h2>
          {isImagesLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {Array.from({ length: itemsPerPage }).map((_, i) => (
                <Skeleton key={i} className="h-40 w-full rounded-md bg-gray-200 dark:bg-gray-700" />
              ))}
            </div>
          ) : imagesError ? (
            <p className="text-red-500 dark:text-red-400 text-sm">Error loading images</p>
          ) : generatedImages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center py-10 text-gray-500 dark:text-gray-400"
            >
              <ImageOff className="w-12 h-12 mb-2" />
              <p className="text-sm">No images generated yet.</p>
            </motion.div>
          ) : (
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Total: {generatedImages.length} images (latest first)
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {currentImages.map((img, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                  >
                    <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                      <CardContent className="p-2">
                        <ImageWithSkeleton
                          src={img.download_url}
                          alt={`Generated image ${i + 1}`}
                          className="w-full h-40 object-cover rounded-md"
                        />
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 0}
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
                    className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {currentPage + 1} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === totalPages - 1}
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))}
                    className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Account Details */}
        <section>
          <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Account Details</h2>
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 shadow-sm">
            <CardContent className="p-4 sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Username</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{username}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Edit
                </Button>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{email}</p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Promotion Banner */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="relative overflow-hidden rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md transition-shadow">
            <div className="relative h-40 sm:h-48">
              <img
                src="https://images.unsplash.com/photo-1739286955038-a4e5ce4f9462?q=80&w=3330&auto=format&fit=crop"
                alt="Promotion"
                className="object-cover w-full h-full"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent flex items-center justify-between p-4 sm:p-6">
                <div>
                  <p className="text-xs sm:text-sm text-white">Limited Time Offer</p>
                  <h3 className="text-lg sm:text-xl font-semibold text-white">Upgrade to Premium</h3>
                </div>
                <Link href="https://www.imagepipeline.io/pricing">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-white border-white hover:bg-white/20 dark:hover:bg-gray-700/20"
                  >
                    Learn More
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </motion.section>

        {/* Delete Account */}

        {/* <section>
          <h2 className="text-lg sm:text-xl font-semibold mb-4 text-red-600 dark:text-red-400">Delete Account</h2>
          <Card className="bg-white dark:bg-gray-800 border border-red-200 dark:border-red-700 shadow-sm">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                 
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Permanently remove your account and all associated data.
                  </p>
                </div>
                <Button
                // onClick={deleteUser}
                  variant="destructive"
                  size="sm"
                  className="bg-red-600 dark:bg-red-700 text-white hover:bg-red-700 dark:hover:bg-red-800"
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        </section> */}
        
      </main>
    </div>
  );
}

