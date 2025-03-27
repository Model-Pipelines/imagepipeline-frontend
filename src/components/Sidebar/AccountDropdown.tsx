"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AnimatePresence, motion } from "framer-motion";
import { LogOut, Menu } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { ProfileFooter } from "./ProfileFooter";
import { ProfileSection } from "./ProfileSection";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { useAuth } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import { fetchUserPlan } from "@/AxiosApi/GenerativeApi";

export default function AccountDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { userId, getToken } = useAuth();

  // Fetch user plan
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

  // Close the dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Dropdown Trigger */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="h-8 w-8 flex items-center justify-center bg-transparent text-gray-700 dark:text-gray-300 hover:text-creative dark:hover:text-chart-4 transition-colors"
      >
        <Menu className="h-5 w-5 text-gray-700 dark:text-gray-300 hover:text-text dark:hover:text-text transition-colors" />
      </button>
      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-4 left-24 z-[100] lg:bottom-80 lg:left-[43rem] xl:bottom-4 xl:left-24 cursor-default"
          >
            <Card className="w-80 rounded-lg shadow-lg overflow-hidden bg-white/10 dark:bg-[#1B1B1D]/10 backdrop-blur-lg border border-white/20 dark:border-gray-800/20">
              <div className="bg-white/40 dark:bg-[#1B1B1D]/40 backdrop-blur-md">
                {/* Profile Section */}
                <ProfileSection
                  planName={userPlanData?.plan || "Free Plan"}
                  creditsLeft={userPlanData?.tokens_remaining || 0}
                />
                <Separator className="bg-white/20 dark:bg-gray-700/20" />
                {/* Theme Selector */}
                <ThemeSwitcher />
                {/* Footer Links */}
                <ProfileFooter />
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}