// page.tsx
"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  ArrowRight,
  LogOut,
  ImageOff,
  Home,
  Eye,
  EyeOff,
  Copy,
  RefreshCw,
  Download,
} from "lucide-react";
import { useUser, useClerk, useAuth } from "@clerk/nextjs";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchSubscriptionDetails,
  fetchUserImages,
  resetApiKey,
  fetchImageDetails,
  UserImage,
  fetchDedicatedServer,
  fetchUserModel,
} from "@/services/AccountServices";
import Link from "next/link";
import { toast } from "@/hooks/use-toast";
import { fetchUserPlan } from "@/AxiosApi/GenerativeApi";
import {
  MorphingDialog,
  MorphingDialogTrigger,
  MorphingDialogContent,
  MorphingDialogTitle,
  MorphingDialogImage,
  MorphingDialogSubtitle,
  MorphingDialogClose,
  MorphingDialogDescription,
  MorphingDialogContainer,
} from "@/components/ui/morphing-dialog";

// Add types for the API response
interface UserPlanData {
  user_id: string;
  api_key: string;
  email: string;
  plan: string;
  tokens_remaining: number;
  model_trainings_remaining: number;
  private_model_loads_remaining: number;
  plan_expiry_date: string | null;
}

// Update the ImageData interface to match the API response
interface ImageData extends UserImage {
  prompt?: string;
  model?: string;
}

// Add this interface to better type the image details
interface DetailedImageData extends ImageData {
  height?: number;
  width?: number;
  model_id?: string;
  controlnet?: string;
  json?: string;
  isLoading?: boolean;
  creation_timestamp?: string;
}

// Add interface for dedicated server data
interface DedicatedServerData {
  user_id: string;
  subscription_id: string;
  plan: string;
  pod_id: string;
  pod_status: string;
  period_start: string;
  period_end: string;
  subscription_status: string;
}

// Add interface for user model data
interface UserModelData {
  model_id: string;
  model_name: string;
  base_model: string;
  model_type: string;
  tags: string;
  sample_images: string[];
  verified: boolean;
  visibility: string;
}

function ImageWithSkeleton({
  src,
  alt,
  className = "",
  ...props
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="relative h-full w-full">
      {!loaded && (
        <Skeleton className="absolute inset-0 bg-gray-200 dark:bg-gray-700" />
      )}
      <img
        src={src || "/placeholder.svg"}
        alt={alt}
        {...props}
        className={`${className} ${
          !loaded ? "opacity-0" : "opacity-100"
        } transition-opacity duration-300 object-cover rounded-md`}
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
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null
  );
  const itemsPerPage = 8;
  const queryClient = useQueryClient();
  const [userPlanData, setUserPlanData] = useState<UserPlanData | null>(null);
  const [dedicatedServerData, setDedicatedServerData] = useState<
    DedicatedServerData[] | null
  >(null);
  const [userModelData, setUserModelData] = useState<UserModelData[] | null>(
    null
  );

  // Add state for detailed image data
  const [selectedImageDetails, setSelectedImageDetails] =
    useState<DetailedImageData | null>(null);

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

  // Update the image grid section with fixed dimensions and proper date sorting
  const sortImagesByDate = (images: UserImage[]) => {
    return [...images].sort(
      (a, b) =>
        new Date(b.creation_timestamp).getTime() -
        new Date(a.creation_timestamp).getTime()
    );
  };

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
      const images = await fetchUserImages(userId, token);
      return sortImagesByDate(images);
    },
    enabled: !!userId,
  });

  // API Key Query
  const {
    data: apiKeyData,
    isLoading: apiKeyLoading,
    error: apiKeyError,
  } = useQuery({
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
      toast({
        title: "Failed to reset API Key",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Dedicated Server Query
  const {
    data: dedicatedServer,
    isLoading: dedicatedServerLoading,
    error: dedicatedServerError,
  } = useQuery({
    queryKey: ["dedicatedServer", userId],
    queryFn: async () => {
      if (!userId) throw new Error("User ID not available");
      const token = await fetchToken();
      return fetchDedicatedServer(userId, token);
    },
    enabled: !!userId,
  });

  // User Model Query
  const {
    data: userModels,
    isLoading: userModelsLoading,
    error: userModelsError,
  } = useQuery({
    queryKey: ["userModels", userId],
    queryFn: async () => {
      if (!userId) throw new Error("User ID not available");
      const token = await fetchToken();
      return fetchUserModel(userId, token);
    },
    enabled: !!userId,
  });

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "API Key copied to clipboard" });
  };

  // Add the plan data fetch effect
  useEffect(() => {
    const fetchPlanData = async () => {
      try {
        const token = await getToken();
        if (token && userId) {
          const planData = await fetchUserPlan(userId, token);
          setUserPlanData(planData);
        }
      } catch (error) {
        console.error("Error fetching user plan:", error);
        toast({
          title: "Error",
          description: "Failed to fetch user plan",
          variant: "destructive",
        });
      }
    };
    fetchPlanData();
  }, [userId, getToken]);

  // Update the fetchImageDetails function in the component
  const fetchImageDetailsWithParsing = async (imageId: string) => {
    try {
      const token = await getToken();
      const data = await fetchImageDetails(imageId, token);

      // Parse the JSON string if it exists
      let parsedJson = {};
      try {
        parsedJson = data.json ? JSON.parse(data.json) : {};
      } catch (e) {
        console.error("Error parsing image JSON:", e);
      }

      return {
        ...data,
        prompt: parsedJson.prompt,
        height: parsedJson.height,
        width: parsedJson.width,
        controlnet: parsedJson.controlnet,
        isLoading: false,
      };
    } catch (error) {
      console.error("Error fetching image details:", error);
      return null;
    }
  };

  // Update the handleImageSelect function
  const handleImageSelect = async (globalIndex: number) => {
    setSelectedImageIndex(globalIndex);
    const selectedImage = generatedImages[globalIndex];

    // Set loading state
    setSelectedImageDetails({ ...selectedImage, isLoading: true });

    // Fetch detailed data using the image_id
    const details = await fetchImageDetailsWithParsing(selectedImage.image_id);
    if (details) {
      setSelectedImageDetails({ ...details, isLoading: false });
    }
  };

  // Image navigation in dialog
  const navigateImage = (direction: "next" | "prev") => {
    if (selectedImageIndex === null) return;

    const totalImages = generatedImages.length;
    let newIndex;

    if (direction === "next") {
      newIndex = (selectedImageIndex + 1) % totalImages;
    } else {
      newIndex = (selectedImageIndex - 1 + totalImages) % totalImages;
    }

    setSelectedImageIndex(newIndex);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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
  const currentImages = generatedImages.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white px-4 py-6 sm:px-6 md:px-8 lg:px-12">
      {/* Header */}
      <header className="mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
          Your Dashboard
        </h1>
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
          <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-gray-100">
            {fullName}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">{email}</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
            @{username}
          </p>
        </motion.section>

        {/* Subscription */}
        {/* Subscription */}
        <section>
          <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
            Subscription
          </h2>
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg text-gray-900 dark:text-gray-100">
                {userPlanData?.plan || "Loading..."}
              </CardTitle>
              <CardDescription className="text-sm text-gray-500 dark:text-gray-400">
                {userPlanData?.plan_expiry_date
                  ? `Renews on ${new Date(
                      userPlanData.plan_expiry_date
                    ).toLocaleDateString()}`
                  : "No expiry date"}
              </CardDescription>
              <div className="pt-2">
                <CardDescription className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  Manage subscription
                </CardDescription>
                <Link
                  href="https://billing.stripe.com/p/login/5kA6si7fjanqeli144"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Click Here
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              {!userPlanData ? (
                <div className="space-y-3">
                  <Skeleton className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700" />
                  <Skeleton className="h-4 w-2/3 bg-gray-200 dark:bg-gray-700" />
                  <Skeleton className="h-4 w-4/5 bg-gray-200 dark:bg-gray-700" />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">
                      Tokens Remaining
                    </p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {userPlanData.tokens_remaining}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">
                      Model Trainings
                    </p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {userPlanData.model_trainings_remaining}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">
                      Private Models
                    </p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {userPlanData.private_model_loads_remaining}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Status</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {userPlanData.plan ? "Active" : "Inactive"}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* API Key */}
        <section>
          <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
            API Key
          </h2>
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 shadow-sm">
            <CardContent className="p-4 sm:p-6 space-y-4">
              {apiKeyLoading ? (
                <Skeleton className="h-12 w-full bg-gray-200 dark:bg-gray-700" />
              ) : apiKeyError ? (
                <p className="text-red-500 dark:text-red-400 text-sm">
                  Error loading API key
                </p>
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <div className="flex-1 flex items-center gap-2 bg-gray-100 dark:bg-gray-700 p-3 rounded-md border border-gray-200 dark:border-gray-600 w-full">
                      <p className="text-sm font-mono truncate flex-1 text-gray-900 dark:text-gray-100">
                        {showApiKey
                          ? apiKeyData?.api_key
                          : "••••••••••••••••••••••••••••••••"}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowApiKey(!showApiKey)}
                        aria-label={
                          showApiKey ? "Hide API Key" : "Show API Key"
                        }
                        className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                      >
                        {showApiKey ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleCopyToClipboard(apiKeyData?.api_key)
                        }
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
                      <RefreshCw
                        className={`h-4 w-4 mr-2 ${
                          resetApiKeyMutation.isPending ? "animate-spin" : ""
                        }`}
                      />
                      Reset
                    </Button>
                  </div>
                  <p className="text-xs text-yellow-600 dark:text-yellow-400">
                    Warning: Keep your API key private. Sharing it publicly or
                    with AI services may compromise your account.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Promotion Banner */}
          <motion.section
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="relative mt-8 overflow-hidden rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md transition-shadow">
              <div className="relative h-40 sm:h-48">
                <img
                  src="https://images.unsplash.com/photo-1739286955038-a4e5ce4f9462?q=80&w=3330&auto=format&fit=crop"
                  alt="Promotion"
                  className="object-cover w-full h-full"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent flex items-center justify-between p-4 sm:p-6">
                  <div>
                    <p className="text-xl sm:text-2xl font-bold text-white">
                      {!userPlanData
                        ? "Loading Plan..."
                        : userPlanData.plan.toLowerCase() === "free"
                        ? "Upgrade to Premium"
                        : "Upgrade to Enterprise"}
                    </p>
                    <p className="text-sm sm:text-base text-white mt-2">
                      {!userPlanData
                        ? "Checking your plan benefits..."
                        : userPlanData.plan.toLowerCase() === "free"
                        ? "Unlock premium features and faster speeds"
                        : "Free image consulting, 10x faster speeds, and custom image models"}
                    </p>
                  </div>
                  <Link
                    href={
                      !userPlanData ||
                      userPlanData.plan.toLowerCase() === "free"
                        ? "https://www.imagepipeline.io/pricing"
                        : "https://www.imagepipeline.io/pricing" // You might want different URLs for enterprise
                    }
                    target="_blank"
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-white border-white bg-bg-white/10 hover:bg-white/20 dark:hover:bg-gray-700/20"
                    >
                      Learn More
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          </motion.section>
        </section>

        {/* Account Details */}
        <section>
          <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
            Account Details
          </h2>
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 shadow-sm">
            <CardContent className="p-4 sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Username
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {username}
                  </p>
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
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Email
                </p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {email}
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* server details  */}
        <section>
          <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
            Dedicated Servers
          </h2>
          <div className="space-y-4">
            {dedicatedServer?.length > 0 ? (
              dedicatedServer.map((server) => (
                <Card
                  key={server.subscription_id}
                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 shadow-sm"
                >
                  <CardContent className="p-4 sm:p-6 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Plan: {server.plan}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Pod Id: {server.pod_id}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Pod Status:{" "}
                          <span
                            className={
                              server.pod_status === "unknown"
                                ? "text-gray-500"
                                : "text-success"
                            }
                          >
                            {server.pod_status}
                          </span>
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Status: {server.subscription_status}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Period:{" "}
                          {new Date(server.period_start).toLocaleDateString()} -{" "}
                          {new Date(server.period_end).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400">
                You have zero dedicated GPU servers
              </p>
            )}
          </div>
        </section>

        {/* Generated Images */}
        <section>
          <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
            Generated Images
          </h2>
          {isImagesLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {Array.from({ length: itemsPerPage }).map((_, i) => (
                <Skeleton
                  key={i}
                  className="h-40 w-full rounded-md bg-gray-200 dark:bg-gray-700"
                />
              ))}
            </div>
          ) : imagesError ? (
            <p className="text-red-500 dark:text-red-400 text-sm">
              Error loading images
            </p>
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
                {currentImages.map((img, i) => {
                  const globalIndex = currentPage * itemsPerPage + i;
                  return (
                    <motion.div
                      key={img.image_id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: i * 0.05 }}
                    >
                      <MorphingDialog
                        transition={{
                          type: "spring",
                          bounce: 0.05,
                          duration: 0.25,
                        }}
                      >
                        <MorphingDialogTrigger
                          style={{
                            borderRadius: "12px",
                          }}
                          className="w-full overflow-hidden border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow"
                          asChild
                        >
                          <button
                            onClick={() => handleImageSelect(globalIndex)}
                          >
                            <div className="w-52 h-56 ml-11 relative">
                              <MorphingDialogImage
                                src={img.download_url}
                                alt={`Generated image ${globalIndex + 1}`}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="p-2">
                              <MorphingDialogTitle className="text-gray-900 dark:text-gray-100">
                                Image {generatedImages.length - globalIndex}
                              </MorphingDialogTitle>
                              <MorphingDialogSubtitle className="text-gray-500 dark:text-gray-400">
                                {formatDate(img.creation_timestamp)}
                              </MorphingDialogSubtitle>
                            </div>
                          </button>
                        </MorphingDialogTrigger>

                        <MorphingDialogContainer>
                          <MorphingDialogContent
                            style={{
                              borderRadius: "24px",
                            }}
                            className="pointer-events-auto relative flex h-[80vh] w-full flex-col overflow-hidden border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 sm:w-[90vw] md:w-[80vw] lg:w-[70vw] max-w-5xl"
                          >
                            {/* Image section - fixed height */}
                            <div className="relative flex-shrink-0">
                              {selectedImageDetails?.isLoading && (
                                <motion.div
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  className="absolute inset-0 flex items-center justify-center bg-black/50 z-10"
                                >
                                  <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{
                                      duration: 1,
                                      repeat: Number.POSITIVE_INFINITY,
                                      ease: "linear",
                                    }}
                                    className="w-12 h-12 border-4 border-white border-t-transparent rounded-full"
                                  />
                                </motion.div>
                              )}
                              <MorphingDialogImage
                                src={
                                  selectedImageDetails?.download_url ||
                                  img.download_url
                                }
                                alt={`Generated image ${globalIndex + 1}`}
                                className="w-full max-h-[40vh] object-contain"
                              />
                            </div>

                            {/* Content section - scrollable */}
                            <div className="flex-1 overflow-y-auto">
                              <div className="p-6">
                                <div className="flex justify-between items-center mb-4">
                                  <div>
                                    <MorphingDialogTitle className="text-2xl text-gray-900 dark:text-gray-100">
                                      Image{" "}
                                      {generatedImages.length - globalIndex} of{" "}
                                      {generatedImages.length}
                                    </MorphingDialogTitle>
                                    <MorphingDialogSubtitle className="text-gray-600 dark:text-gray-400">
                                      Created on{" "}
                                      {formatDate(
                                        selectedImageDetails?.creation_timestamp ||
                                          img.creation_timestamp
                                      )}
                                    </MorphingDialogSubtitle>
                                  </div>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      window.open(
                                        selectedImageDetails?.download_url ||
                                          img.download_url,
                                        "_blank"
                                      )
                                    }
                                    className="flex items-center gap-2"
                                  >
                                    <Download className="h-4 w-4" />
                                    Open Image
                                  </Button>
                                </div>
                                <MorphingDialogDescription
                                  disableLayoutAnimation
                                  variants={{
                                    initial: { opacity: 0, scale: 0.8, y: 20 },
                                    animate: { opacity: 1, scale: 1, y: 0 },
                                    exit: { opacity: 0, scale: 0.8, y: 20 },
                                  }}
                                >
                                  <div className="space-y-4 text-gray-600 dark:text-gray-400">
                                    {selectedImageDetails?.prompt && (
                                      <div>
                                        <p className="font-medium text-gray-700 dark:text-gray-300">
                                          Prompt:
                                        </p>
                                        <p className="mt-1">
                                          {selectedImageDetails.prompt}
                                        </p>
                                      </div>
                                    )}
                                    {selectedImageDetails?.height &&
                                      selectedImageDetails?.width && (
                                        <div>
                                          <p className="font-medium text-gray-700 dark:text-gray-300">
                                            Dimensions:
                                          </p>
                                          <p className="mt-1">
                                            {selectedImageDetails.width} x{" "}
                                            {selectedImageDetails.height
                                              ? selectedImageDetails.height
                                              : "None"}
                                          </p>
                                        </div>
                                      )}
                                    {selectedImageDetails?.model_id && (
                                      <div>
                                        <p className="font-medium text-gray-700 dark:text-gray-300">
                                          Model:
                                        </p>
                                        <p className="mt-1">
                                          {selectedImageDetails.model_id}
                                        </p>
                                      </div>
                                    )}
                                    {selectedImageDetails?.controlnet && (
                                      <div>
                                        <p className="font-medium text-gray-700 dark:text-gray-300">
                                          Control Net:
                                        </p>
                                        <p className="mt-1">
                                          {selectedImageDetails.controlnet}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </MorphingDialogDescription>
                              </div>
                            </div>
                            <MorphingDialogClose className="text-gray-500 dark:text-gray-400 absolute top-4 right-4" />
                          </MorphingDialogContent>
                        </MorphingDialogContainer>
                      </MorphingDialog>
                    </motion.div>
                  );
                })}
              </div>
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 0}
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 0))
                    }
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
                    onClick={() =>
                      setCurrentPage((prev) =>
                        Math.min(prev + 1, totalPages - 1)
                      )
                    }
                    className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Your Models  */}
        <section>
          <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
            Your Models
          </h2>
          <div className="space-y-4">
            {userModels?.length > 0 ? (
              userModels.map((model) => (
                <Card
                  key={model.model_id}
                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 shadow-sm"
                >
                  <CardContent className="p-4 sm:p-6 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Model Name: {model.model_name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Base Model: {model.base_model || "None"}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Model Type: {model.model_type || "None"}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Tags: {model.tags || "None"}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Visibility: {model.visibility || "None"}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {model.sample_images.length > 0 &&
                          model.sample_images[0] !== "" ? (
                            model.sample_images.map((image, index) => (
                              <img
                                key={index}
                                src={image}
                                alt={`Sample ${index + 1}`}
                                className="w-24 h-24 object-cover rounded-md"
                              />
                            ))
                          ) : (
                            <p className="text-gray-500 dark:text-gray-400">
                              None
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400">
                You have added 0 models so far
              </p>
            )}
          </div>
        </section>

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
