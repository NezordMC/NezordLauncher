import { Outlet } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Console } from "@/components/Console";
import { useLauncherContext } from "@/context/LauncherContext";

export function MainLayout() {
  const { logs } = useLauncherContext();

  return (
    <div className="flex flex-col h-screen w-screen bg-zinc-950 text-white overflow-hidden">
      <Navbar />

      <main className="flex-1 overflow-hidden relative p-6">
        <Outlet />
      </main>

      <div className="h-48 border-t border-zinc-800 bg-black/20 backdrop-blur-sm relative z-10">
        <Console logs={logs} />
      </div>
    </div>
  );
}
