"use client";
import { useState } from "react";
import {
  Menu,

  HelpCircle,
  Users,
  Trash2,
  LogOut,
} from "lucide-react";

import {
  Card,
  CardContent,

} from "@/components/ui/card";
import { Separator } from "../ui/separator";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { ProfileSection } from "./ProfileSection";
import { ProfileFooter } from "./ProfileFooter";

export default function AccountDropdown() {
  const [isOpen, setIsOpen] = useState(false);


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
            <Card className="w-80 rounded-lg shadow-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800">
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
                    <Users className="h-4 w-4" />
                    Manage muted users
                  </button>
                  <button className="flex items-center gap-2 text-sm text-gray-800 dark:text-gray-200 hover:text-yellow-600 dark:hover:text-yellow-400">
                    <Trash2 className="h-4 w-4" />
                    Delete account
                  </button>
                </div>
              </CardContent>
              <Separator className="dark:bg-gray-700" />
              {/* API & Logout */}
              <CardContent className="py-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-800 dark:text-gray-200">
                    API
                  </span>
                  <span className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-full px-2">
                    Beta
                  </span>
                </div>
                <button className="flex items-center gap-2 text-sm text-gray-800 dark:text-gray-200 hover:text-yellow-600 dark:hover:text-yellow-400 mt-2">
                  <LogOut className="h-4 w-4" />
                  Log out
                </button>
              </CardContent>
              <Separator className="dark:bg-gray-700" />
              {/* Theme Selector */}
              <ThemeSwitcher />

              {/* Footer Links */}
              <ProfileFooter />

            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
