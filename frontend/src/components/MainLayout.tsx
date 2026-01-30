import { Outlet } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { FloatingConsole } from "@/components/layout/FloatingConsole";
import { Toaster } from "@/components/ui/sonner";

import { useUpdater } from "@/hooks/useUpdater";

export function MainLayout() {
  useUpdater();
  return (
    <div className="flex flex-col h-screen w-screen bg-zinc-950 text-white overflow-hidden relative">
      <Navbar />

      <main className="flex-1 overflow-hidden relative">
        <Outlet />
      </main>

      <FloatingConsole />
      <Toaster theme="dark" position="bottom-right" />
    </div>
  );
}
