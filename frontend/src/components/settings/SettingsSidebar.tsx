import { Button } from "@/components/ui/button";
import { Monitor, HardDrive, Info } from "lucide-react";

export type Tab = "general" | "java" | "about";

interface SettingsSidebarProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

export function SettingsSidebar({
  activeTab,
  setActiveTab,
}: SettingsSidebarProps) {
  return (
    <div className="w-48 border-r border-zinc-800 pr-4 space-y-2 flex flex-col">
      <Button
        variant="ghost"
        className={`w-full justify-start gap-2 ${
          activeTab === "general"
            ? "bg-zinc-800 text-white"
            : "text-zinc-400 hover:text-white"
        }`}
        onClick={() => setActiveTab("general")}
      >
        <Monitor size={16} /> General
      </Button>
      <Button
        variant="ghost"
        className={`w-full justify-start gap-2 ${
          activeTab === "java"
            ? "bg-zinc-800 text-white"
            : "text-zinc-400 hover:text-white"
        }`}
        onClick={() => setActiveTab("java")}
      >
        <HardDrive size={16} /> Java Manager
      </Button>
      <Button
        variant="ghost"
        className={`w-full justify-start gap-2 ${
          activeTab === "about"
            ? "bg-zinc-800 text-white"
            : "text-zinc-400 hover:text-white"
        }`}
        onClick={() => setActiveTab("about")}
      >
        <Info size={16} /> About
      </Button>
    </div>
  );
}
