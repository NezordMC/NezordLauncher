import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Github, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

// Make a simple Discord icon component since lucide might not have it or it's named differently
function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>Discord</title>
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037 2.012 2.012 0 0 0-.365.758 19.418 19.418 0 0 0-5.976 0 2.029 2.029 0 0 0-.362-.758.071.071 0 0 0-.079-.037A19.528 19.528 0 0 0 3.679 4.37a.076.076 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.1 14.1 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.076.076 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.118.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.418 2.157-2.418 1.21 0 2.176 1.085 2.176 2.419 0 1.334-.966 2.419-2.176 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.418 2.157-2.418 1.21 0 2.175 1.085 2.175 2.419 0 1.334-.966 2.419-2.175 2.419z" />
    </svg>
  );
}

export function UpdaterAboutCard() {
  const [autoUpdate, setAutoUpdate] = useState(true);
  const [checking, setChecking] = useState(false);

  const handleCheckUpdate = () => {
    setChecking(true);
    setTimeout(() => setChecking(false), 2000); // Simulate check
  };

  const handleReset = () => {
    if (confirm("Reset all settings to defaults?")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <Card className="border-zinc-800 bg-zinc-900">
      <CardContent className="p-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* Left Side: Updater */}
          <div className="flex-1 space-y-6 w-full lg:w-auto">
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  "p-3 rounded-full bg-zinc-800 text-zinc-400",
                  checking && "animate-spin text-primary bg-primary/10",
                )}
              >
                <RefreshCw size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg">Updater</h3>
                <p className="text-xs text-zinc-500 font-mono">
                  Current Version: 1.3.0-beta
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border border-zinc-800 rounded-lg bg-zinc-900/30">
              <span className="text-sm font-medium text-zinc-300">
                Auto-update
              </span>
              <button
                onClick={() => setAutoUpdate(!autoUpdate)}
                className={cn(
                  "w-11 h-6 rounded-full transition-colors relative",
                  autoUpdate ? "bg-primary" : "bg-zinc-700",
                )}
              >
                <div
                  className={cn(
                    "w-4 h-4 rounded-full bg-white absolute top-1 transition-all",
                    autoUpdate ? "left-6" : "left-1",
                  )}
                />
              </button>
            </div>

            <Button
              variant="outline"
              className="w-full border-zinc-700 hover:bg-zinc-800"
              onClick={handleCheckUpdate}
              disabled={checking}
            >
              {checking ? "Checking for updates..." : "Check for Updates"}
            </Button>
          </div>

          {/* Right Side: Branding & Reset */}
          <div className="flex-1 flex flex-col items-center justify-center space-y-6 w-full lg:w-auto text-center lg:border-l lg:border-zinc-800 lg:pl-8">
            <div className="space-y-2">
              <h1 className="text-5xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-primary to-fuchsia-500 select-none">
                NEZORD
              </h1>
              <p className="text-zinc-600 text-sm">
                Designed for performance and simplicity
              </p>
            </div>

            <div className="flex items-center gap-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-all"
              >
                <Github size={20} />
              </a>
              <a
                href="https://discord.com"
                target="_blank"
                rel="noreferrer"
                className="p-2 text-zinc-500 hover:text-[#5865F2] hover:bg-zinc-800 rounded-lg transition-all"
              >
                <DiscordIcon className="w-5 h-5" />
              </a>
            </div>

            <Button
              variant="destructive"
              size="sm"
              onClick={handleReset}
              className="mt-4 bg-red-900/20 text-red-400 hover:bg-red-900/40 border border-red-900/50"
            >
              <RotateCcw size={14} className="mr-2" />
              Reset to Defaults
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
