import { CardFooter } from "@/components/ui/card";
import { IoMdMail } from "react-icons/io";
import { FaDiscord } from "react-icons/fa";

export function ProfileFooter() {
  return (
    <CardFooter className="flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 dark:text-gray-400">
      {/* Left Section: Terms and Privacy */}
      <div className="flex gap-4 mb-2 sm:mb-0">
        <a
          href="#"
          className="hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors duration-200"
        >
          Terms
        </a>
        <a
          href="#"
          className="hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors duration-200"
        >
          Privacy
        </a>
      </div>

      {/* Right Section: Icons */}
      <div className="flex gap-2">
        <a
          href="#"
          aria-label="Contact via Email"
          className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-300 transition-colors duration-200"
        >
          <IoMdMail size={20} />
        </a>
        <a
          href="#"
          aria-label="Join Discord"
          className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-300 transition-colors duration-200"
        >
          <FaDiscord size={20} />
        </a>
      </div>
    </CardFooter>
  );
}
