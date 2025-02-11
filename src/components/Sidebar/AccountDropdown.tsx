"use client";
import { useState } from "react";
import {
  Menu,
  HelpCircle,
  Users,
  Trash2,
  LogOut,
  KeyRound,
} from "lucide-react";
import { useClerk } from "@clerk/nextjs"; // Import useClerk for sign-out
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { ProfileSection } from "./ProfileSection";
import { ProfileFooter } from "./ProfileFooter";

export default function AccountDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { signOut } = useClerk(); // Use the signOut method from Clerk

  return (
    <div className="relative">
      {/* Dropdown Trigger */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="h-8 w-8 flex items-center justify-center bg-transparent dark:text-white"
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
            className="fixed bottom-4 left-24 z-[100]"
          >
            <Card className="w-80 rounded-lg shadow-lg overflow-hidden bg-white/10 dark:bg-gray-800/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20">
              <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-md">
                {/* Profile Section */}
                <ProfileSection />

                {/* Menu Items */}
                <CardContent className="py-2">
                  <div className="flex flex-col gap-2">
                    <button className="flex items-center gap-2 text-sm text-gray-800 dark:text-gray-200 hover:text-yellow-600 dark:hover:text-yellow-400">
                      <HelpCircle className="h-4 w-4" />
                      Help & documentation
                    </button>
                    <button className="flex items-center gap-2 text-sm text-gray-800 dark:text-gray-200 hover:text-yellow-600 dark:hover:text-yellow-400">
                      <KeyRound className="h-4 w-4" />
                      API Key
                    </button>
                    <button className="flex items-center gap-2 text-sm text-gray-800 dark:text-gray-200 hover:text-yellow-600 dark:hover:text-yellow-400">
                      <Trash2 className="h-4 w-4" />
                      Delete account
                    </button>

                    {/* Sign Out Button */}
                    <button
                      onClick={() => signOut()} // Trigger sign-out
                      className="flex items-center gap-2 text-sm text-gray-800 dark:text-gray-200 hover:text-yellow-600 dark:hover:text-yellow-400"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </button>
                  </div>
                </CardContent>

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