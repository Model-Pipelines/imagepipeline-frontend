"use client"
import { useState } from "react"
import { Menu, HelpCircle, Users, Trash2, LogOut, KeyRound } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { motion, AnimatePresence } from "framer-motion"
import { ThemeSwitcher } from "./ThemeSwitcher"
import { ProfileSection } from "./ProfileSection"
import { useAuth } from "@clerk/nextjs"
import { useQuery } from "@tanstack/react-query"
import { fetchUserPlan } from "@/AxiosApi/GenerativeApi"

export default function MobileAccountDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const { userId, getToken } = useAuth()

  // Fetch user plan details
  const { data: userPlanData } = useQuery({
    queryKey: ["userPlan", userId],
    queryFn: async () => {
      if (!userId) throw new Error("User ID not available")
      const token = await getToken()
      if (!token) throw new Error("No authentication token available")
      return fetchUserPlan(userId, token)
    },
    enabled: !!userId,
  })

  return (
    <div className="relative">
      {/* Dropdown Trigger */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="h-8 w-8 flex items-center justify-center bg-transparent dark:text-text"
      >
        <Menu />
      </button>
      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="fixed top-14 right-4 -z-[100] md:top-14 md:right-4"
          >
            <Card className="w-80 rounded-lg shadow-lg overflow-hidden bg-white/10 dark:bg-gray-800/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20">
              <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-md">
                {/* Profile Section */}
                <ProfileSection 
                  planName={userPlanData?.plan || "Free Plan"}
                  creditsLeft={userPlanData?.tokens_remaining || 0}
                />
                <Separator className="bg-white/20 dark:bg-gray-700/20" />
                {/* Theme Selector */}
                <ThemeSwitcher />
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}