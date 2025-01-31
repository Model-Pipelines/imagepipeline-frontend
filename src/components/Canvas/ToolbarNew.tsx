import { Download, Move, Grip } from "lucide-react";

import { Dock, DockIcon, DockItem, DockLabel } from "@/components/ui/dock";

const data = [
  {
    title: "Download",
    icon: (
      <Download className="h-full w-full text-neutral-600 dark:text-neutral-300" />
    ),
    href: "#",
  },
  {
    title: "Move",
    icon: (
      <Move className="h-full w-full text-neutral-600 dark:text-neutral-300" />
    ),
    href: "#",
  },
  {
    title: "Grid",
    icon: (
      <Grip className="h-full w-full text-neutral-600 dark:text-neutral-300" />
    ),
    href: "#",
  },
];

export function AppleStyleDock() {
  return (
    <div className="absolute top-2 left-1/2 max-w-full -translate-x-1/2">
      <Dock className="items-end pb-3 flex gap-4">
        {data.map((item, idx) => (
          <DockItem
            key={idx}
            className="flex flex-col items-center aspect-square rounded-full bg-gray-200 dark:bg-neutral-800 p-2"
          >
            <DockIcon className="mb-1">{item.icon}</DockIcon>
            <DockLabel className="text-sm">{item.title}</DockLabel>
          </DockItem>
        ))}
      </Dock>
    </div>
  );
}
