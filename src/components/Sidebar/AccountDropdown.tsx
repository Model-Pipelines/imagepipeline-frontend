"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import {
  Menu,
  Moon,
  Sun,
  Monitor,
  Zap,
  HelpCircle,
  Users,
  Trash2,
  LogOut,
} from "lucide-react";
import { FaDiscord } from "react-icons/fa";
import { IoMdMail } from "react-icons/io";


export default function AccountDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  return (
    <div className="relative">
      {/* Dropdown Trigger */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="h-8 w-8 flex items-center justify-center rounded-full bg-transparent dark:text-white"
      >
        <Menu />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="fixed bottom-4 left-24 z-50 mt-2 w-80 rounded-lg border border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-700 shadow-lg"
        >
          {/* Profile Section */}
          <div className="flex items-center gap-2 p-4">
            <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <img
                src="/placeholder.svg"
                alt="Profile"
                className="h-10 w-10 rounded-full"
              />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">test dummy</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">test.dummy@gmail.com</p>
            </div>
          </div>
          <hr className="border-gray-300 dark:border-gray-700" />

          {/* Plan Info */}
          <div className="p-4">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-gray-800 dark:text-gray-200">Free</span>
              <span className="text-gray-500 dark:text-gray-400">10 credits left</span>
            </div>
            <button className="mt-2 w-full rounded-md border border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 py-2 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 flex items-center justify-center gap-2">
              <Zap className="h-4 w-4" />
              Upgrade plan
            </button>
          </div>
          <hr className="border-gray-300 dark:border-gray-700" />

          {/* Menu Items */}
          <div className="p-4">
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
          </div>
          <hr className="border-gray-300 dark:border-gray-700" />

          {/* API & Logout */}
          <div className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-800 dark:text-gray-200">API</span>
              <span className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-full px-2">Beta</span>
            </div>
            <button className="flex items-center gap-2 text-sm text-gray-800 dark:text-gray-200 hover:text-yellow-600 dark:hover:text-yellow-400 mt-2">
              <LogOut className="h-4 w-4" />
              Log out
            </button>
          </div>
          <hr className="border-gray-300 dark:border-gray-700" />

          {/* Theme Selector */}
          <div className="p-4">
            <div className="flex justify-between gap-2 border dark:border-gray-700 rounded-md p-1">
              <button 
                onClick={() => setTheme('light')}
                className={`flex-1 text-center text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded py-1 ${theme === 'light' ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
              >
                <Sun className="inline h-4 w-4 mr-1" />
                Light
              </button>
              <button 
                onClick={() => setTheme('dark')}
                className={`flex-1 text-center text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded py-1 ${theme === 'dark' ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
              >
                <Moon className="inline h-4 w-4 mr-1" />
                Dark
              </button>
              <button 
                onClick={() => setTheme('system')}
                className={`flex-1 text-center text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded py-1 ${theme === 'system' ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
              >
                <Monitor className="inline h-4 w-4 mr-1" />
                Auto
              </button>
            </div>
          </div>
          <hr className="border-gray-300 dark:border-gray-700" />

          {/* Footer Links */}
          <div className="flex items-center justify-between p-4 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex gap-4">
              <a href="#" className="hover:text-yellow-600 dark:hover:text-yellow-400">Terms</a>
              <a href="#" className="hover:text-yellow-600 dark:hover:text-yellow-400">Privacy</a>
            </div>
            <div className="flex gap-2">
              <a href="#" className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-300">
                
                <IoMdMail size={20} />
              </a>
              <a href="#" className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-300">
                <FaDiscord size={20} />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}