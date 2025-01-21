"use client";

import { useState } from "react";
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

export default function AccountDropdown() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      {/* Dropdown Trigger */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="h-8 w-8 flex items-center justify-center rounded-full bg-transparent "
      >
        <Menu />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="fixed bottom-4 left-24 z-50 mt-2 w-80 rounded-lg border border-gray-300 bg-white shadow-lg"
        >
          {/* Profile Section */}
          <div className="flex items-center gap-2 p-4">
            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
              <img
                src="/placeholder.svg"
                alt="Profile"
                className="h-10 w-10 rounded-full"
              />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">test dummy</p>
              <p className="text-xs text-gray-500">test.dummy@gmail.com</p>
            </div>
          </div>
          <hr className="border-gray-300" />

          {/* Plan Info */}
          <div className="p-4">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-gray-800">Free</span>
              <span className="text-gray-500">10 credits left</span>
            </div>
            <button className="mt-2 w-full rounded-md border border-yellow-500 bg-yellow-50 py-2 text-yellow-600 hover:bg-yellow-100 flex items-center justify-center gap-2">
              <Zap className="h-4 w-4" />
              Upgrade plan
            </button>
          </div>
          <hr className="border-gray-300" />

          {/* Menu Items */}
          <div className="p-4">
            <div className="flex flex-col gap-2">
              <button className="flex items-center gap-2 text-sm text-gray-800 hover:text-yellow-600">
                <HelpCircle className="h-4 w-4" />
                Help & documentation
              </button>
              <button className="flex items-center gap-2 text-sm text-gray-800 hover:text-yellow-600">
                <Users className="h-4 w-4" />
                Manage muted users
              </button>
              <button className="flex items-center gap-2 text-sm text-gray-800 hover:text-yellow-600">
                <Trash2 className="h-4 w-4" />
                Delete account
              </button>
            </div>
          </div>
          <hr className="border-gray-300" />

          {/* API & Logout */}
          <div className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-800">API</span>
              <span className="text-xs bg-gray-200 text-gray-500 rounded-full px-2">Beta</span>
            </div>
            <button className="flex items-center gap-2 text-sm text-gray-800 hover:text-yellow-600 mt-2">
              <LogOut className="h-4 w-4" />
              Log out
            </button>
          </div>
          <hr className="border-gray-300" />

          {/* Theme Selector */}
          <div className="p-4">
            <div className="flex justify-between gap-2 border rounded-md p-1">
              <button className="flex-1 text-center text-sm text-gray-800 hover:bg-gray-100">
                <Sun className="inline h-4 w-4" />
                Light
              </button>
              <button className="flex-1 text-center text-sm text-gray-800 hover:bg-gray-100">
                <Moon className="inline h-4 w-4" />
                Dark
              </button>
              <button className="flex-1 text-center text-sm text-gray-800 hover:bg-gray-100">
                <Monitor className="inline h-4 w-4" />
                Auto
              </button>
            </div>
          </div>
          <hr className="border-gray-300" />

          {/* Footer Links */}
          <div className="flex items-center justify-between p-4 text-xs text-gray-500">
            <div className="flex gap-4">
              <a href="#" className="hover:text-yellow-600">Terms</a>
              <a href="#" className="hover:text-yellow-600">Privacy</a>
            </div>
            <div className="flex gap-2">
              <a href="#" className="text-yellow-600 hover:text-yellow-800">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                  <path d="M13.545 2.907a13.227 13.227 0 0 0-3.257-1.011..." />
                </svg>
              </a>
              <a href="#" className="text-yellow-600 hover:text-yellow-800">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26..." />
                </svg>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
