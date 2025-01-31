import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "../ui/separator";
import { Zap } from "lucide-react";

export function ProfileSection() {
  return (
    <Card className="w-full max-w-sm border-none  dark:bg-gray-800">
      {/* Profile Section */}
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src="https://github.com/shadcn.png" alt="Profile Picture" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-sm font-medium text-gray-800 dark:text-gray-200">
              Test Dummy
            </CardTitle>
            <CardDescription className="text-xs text-gray-500 dark:text-gray-400">
              test.dummy@gmail.com
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <Separator className="dark:bg-gray-700" />

      {/* Plan Info */}
      <CardContent className="pt-4 pb-2">
        <div className="flex justify-between text-sm">
          <span className="font-medium text-gray-800 dark:text-gray-200">Free</span>
          <span className="text-gray-500 dark:text-gray-400">10 credits left</span>
        </div>
        <button
          className="mt-3 w-full rounded-md border border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 py-2 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors duration-200 flex items-center justify-center gap-2"
        >
          <Zap className="h-4 w-4" />
          Upgrade plan
        </button>
      </CardContent>
      <Separator className="dark:bg-gray-700" />
    </Card>
  );
}
