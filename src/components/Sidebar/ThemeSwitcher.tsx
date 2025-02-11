import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AnimatedBackground } from "../ui/animated-background";

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  // Define the themes as an array of objects
  const THEMES = [
    { id: "light", label: "Light", icon: <Sun className="inline h-4 w-4 mr-1" /> },
    { id: "dark", label: "Dark", icon: <Moon className="inline h-4 w-4 mr-1" /> },
    { id: "system", label: "Auto", icon: <Monitor className="inline h-4 w-4 mr-1" /> },
  ];

  return (
    <Card className="border-none shadow-none">
      <CardContent className="py-2">
        {/* Wrap the buttons with AnimatedBackground */}
        <AnimatedBackground
          defaultValue={THEMES.find((t) => t.id === theme)?.id || "light"}
          className="rounded-lg "
          transition={{
            type: "spring",
            bounce: 0.2,
            duration: 0.3,
          }}
          enableHover
        >
          <div className="flex justify-between gap-4 p-1">
            {THEMES.map(({ id, label, icon }) => (
              <button
                key={id}
                data-id={id}
                onClick={() => setTheme(id)}
                className={`flex-1 text-center text-sm font-medium px-3 py-2 rounded transition-all duration-300 ${theme === id
                  ? "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  : "text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
              >
                {icon} {label}
              </button>
            ))}
          </div>
        </AnimatedBackground>
      </CardContent>
      <Separator className="dark:bg-gray-700 mb-2" />
    </Card>
  );
}