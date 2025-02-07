import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Provider from "./provider";
import { Toaster } from "@/components/ui/toaster";
import {
  ClerkProvider,
} from '@clerk/nextjs'

import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import ReactQueryProvider from "@/store/TanstackQuery";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
          
        <ReactQueryProvider>
        <Provider>{children}</Provider>
        {/* <ReactQueryDevtools /> */}
        </ReactQueryProvider>
        <Toaster />
      </body>
    </html>
        </ClerkProvider>
  );
}
