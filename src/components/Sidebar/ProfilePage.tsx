"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight } from "lucide-react"
import Image from "next/image"
import { useUser, useClerk, useAuth } from "@clerk/nextjs"
import { useQuery } from "@tanstack/react-query"
import { fetchUserPlan } from "@/AxiosApi/GenerativeApi"
import Link from "next/link"

export default function ProfilePage() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const { userId, getToken } = useAuth();

  // Add user plan query
  const { data: userPlanData } = useQuery({
    queryKey: ["userPlan", userId],
    queryFn: async () => {
      if (!userId) throw new Error("User ID not available");
      const token = await getToken();
      if (!token) throw new Error("No authentication token available");
      return fetchUserPlan(userId, token);
    },
    enabled: !!userId,
  });

  if (!user) {
    return <div>Loading...</div>;
  }

  // Extract the user's avatar URL, email, and full name
  const avatarUrl = user.imageUrl; // Clerk provides the user's avatar URL
  const email = user.primaryEmailAddress?.emailAddress; // Clerk provides the primary email address
  const fullName = `${user.firstName} ${user.lastName}`; // Combine first and last name

  return (
    <div className="min-h-screen bg-textPrimary text-text p-6 md:p-8 lg:p-12 overflow-y-auto">
      <h1 className="text-2xl font-bold mb-8">ACCOUNT</h1>

      {/* Profile Section */}
      <div className="flex flex-col items-center mb-12">
        <Avatar className="w-24 h-24 mb-4">
          <AvatarImage
            src={avatarUrl}
            alt="Profile"
          />
          <AvatarFallback>{user.firstName?.charAt(0)}{user.lastName?.charAt(0)}</AvatarFallback>
        </Avatar>
        <h2 className="text-xl font-semibold mb-1">{fullName}</h2>
        <p className="text-borderGray mb-3">{email}</p>
        <Button variant="secondary" size="sm" onClick={() => signOut()}>
          Sign Out
        </Button>
      </div>

      {/* Subscription Section */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-6">Subscription</h2>
        <Card className="bg-zinc-900 border-zinc-800 mb-6">
          <CardHeader>
            <CardTitle className="text-lg">{userPlanData?.plan || "Free Plan"}</CardTitle>
            <CardDescription className="text-zinc-400">
              {userPlanData?.tokens_remaining 
                ? `${userPlanData.tokens_remaining} tokens remaining` 
                : "No tokens available"}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-between items-center">
            <div>
              <p className="text-sm text-zinc-400">Status</p>
              <p>{userPlanData?.plan ? "Active" : "Inactive"}</p>
            </div>
            <Button variant="secondary" size="sm" asChild>
            <Link href="https://www.imagepipeline.io/pricing">
                Upgrade Plan
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Promotional Card */}
        <Card className="bg-zinc-900 border-zinc-800 relative overflow-hidden">
          <CardContent className="p-0">
            <div className="relative h-48">
              <Image src="/placeholder.svg" alt="Flowers" fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center p-6">
                <div className="flex justify-between items-center w-full">
                  <div>
                    <p className="text-sm mb-2 text-text">Limited Time Offer</p>
                    <h3 className="text-xl font-semibold text-text">Upgrade to Premium</h3>
                  </div>
                  <Link href="https://www.imagepipeline.io/pricing">
                    <Button variant="outline" size="sm" className="text-text border-text hover:bg-white/20">
                      Learn More
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Account Section */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-6">Account</h2>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-6 space-y-4">
            <div>
              <p className="text-sm text-zinc-400 mb-1">Username</p>
              <div className="flex justify-between items-center">
                <p>{user.username}</p>
                <Button variant="ghost" size="sm">
                  Change
                </Button>
              </div>
            </div>
            <div>
              <p className="text-sm text-zinc-400 mb-1">Email</p>
              <p>{email}</p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Delete Account Section */}
      <section>
        <h2 className="text-xl font-semibold mb-6">Delete Account</h2>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <p className="text-sm text-zinc-400">
                Permanently delete your account, all generations and cancel your subscription
              </p>
              <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-400 hover:bg-red-500/10">
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}