import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export function SettingsPage() {
  const navigate = useNavigate();

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in slide-in-from-right-4 duration-300">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} />
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Launcher Settings</h1>
      </div>

      <div className="p-6 border border-zinc-800 rounded-lg bg-zinc-900/30">
        <p className="text-zinc-500 text-sm font-mono">
          GLOBAL SETTINGS COMING SOON
        </p>
      </div>
    </div>
  );
}
