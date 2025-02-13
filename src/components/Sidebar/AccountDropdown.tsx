"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { AnimatePresence, motion } from "framer-motion";
import {
  LogOut,
  Menu,
} from "lucide-react";
import { useState } from "react";
import { ProfileFooter } from "./ProfileFooter";
import { ProfileSection } from "./ProfileSection";
import { ThemeSwitcher } from "./ThemeSwitcher";

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
            <Card className="w-80 rounded-lg shadow-lg overflow-hidden bg-white/10 dark:bg-gray-800/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20">
              <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-md">
                {/* Profile Section */}
                <ProfileSection />



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
