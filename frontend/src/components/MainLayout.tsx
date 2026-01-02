import { Outlet } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Console } from "@/components/ui/Console";
import { Toaster } from "@/components/ui/sonner";

export function MainLayout() {
  return (
    <div className="flex flex-col h-screen w-screen bg-zinc-950 text-white overflow-hidden relative">
      <Navbar />

      <main className="flex-1 overflow-hidden relative p-6 bg-[url('/bg-pattern.png')]">
        <Outlet />
      </main>

      <Console />
      <Toaster theme="dark" position="bottom-right" />
    </div>
  );
}
