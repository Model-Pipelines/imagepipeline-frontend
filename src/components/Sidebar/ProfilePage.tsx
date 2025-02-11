"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight } from "lucide-react"
import Image from "next/image"
import { useUser, useClerk } from "@clerk/nextjs" // Import both useUser and useClerk hooks

export default function ProfilePage() {
  // Fetch the user data using Clerk's useUser hook
  const { user } = useUser();
  // Get the signOut method from Clerk
  const { signOut } = useClerk();

  // If the user is not loaded yet, show a loading state
  if (!user) {
    return <div>Loading...</div>;
  }

  // Extract the user's avatar URL, email, and full name
  const avatarUrl = user.imageUrl; // Clerk provides the user's avatar URL
  const email = user.primaryEmailAddress?.emailAddress; // Clerk provides the primary email address
  const fullName = `${user.firstName} ${user.lastName}`; // Combine first and last name

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-8 lg:p-12 overflow-y-auto">
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
        <p className="text-gray-400 mb-3">{email}</p>
        <Button variant="secondary" size="sm" onClick={() => signOut()}>
          Sign Out
        </Button>
      </div>

      {/* Subscription Section */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-6">Subscription</h2>
        <Card className="bg-zinc-900 border-zinc-800 mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Try Image Pipeline for free</CardTitle>
            <CardDescription className="text-zinc-400">Usage reset on Feb 13, 2025</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-between items-center">
            <span>Free Plan</span>
            <Button variant="secondary" size="sm">
              Upgrade Plan
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
                    <p className="text-sm mb-2 text-white">Image Pipeline</p>
                    <h3 className="text-xl font-semibold text-white">Upgrade to skip the waitlist</h3>
                  </div>
                  <ArrowRight className="w-6 h-6" />
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