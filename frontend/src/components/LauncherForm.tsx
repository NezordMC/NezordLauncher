import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Play, User, Cpu, Box, Loader2 } from "lucide-react";

export interface LaunchConfig {
  version: string;
  username: string;
  ram: number;
}

interface LauncherFormProps {
  onLaunch: (config: LaunchConfig) => void;
  isLaunching: boolean;
}

export function LauncherForm({ onLaunch, isLaunching }: LauncherFormProps) {
  const [config, setConfig] = useState<LaunchConfig>({
    version: "1.20.1",
    username: "NezordPlayer",
    ram: 4096,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLaunch(config);
  };

  return (
    <Card className="w-full p-6 bg-zinc-900/50 border-zinc-800 backdrop-blur-sm space-y-6 no-drag shadow-2xl">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-2">
              <Box size={10} /> Version ID
            </label>
            <div className="relative">
              <Input
                value={config.version}
                onChange={(e) =>
                  setConfig({ ...config, version: e.target.value })
                }
                className="bg-black/50 border-zinc-800 font-mono text-xs h-9 pl-3 text-zinc-300 focus-visible:ring-zinc-600 transition-all"
                placeholder="e.g. 1.20.1"
                disabled={isLaunching}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                <User size={10} /> Username
              </label>
              <Input
                value={config.username}
                onChange={(e) =>
                  setConfig({ ...config, username: e.target.value })
                }
                className="bg-black/50 border-zinc-800 font-mono text-xs h-9 text-zinc-300 focus-visible:ring-zinc-600"
                placeholder="Offline Name"
                disabled={isLaunching}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                <Cpu size={10} /> RAM (MB)
              </label>
              <Input
                type="number"
                value={config.ram}
                onChange={(e) =>
                  setConfig({ ...config, ram: parseInt(e.target.value) || 0 })
                }
                className="bg-black/50 border-zinc-800 font-mono text-xs h-9 text-zinc-300 focus-visible:ring-zinc-600"
                disabled={isLaunching}
              />
            </div>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isLaunching}
          className="w-full bg-zinc-50 hover:bg-zinc-300 text-black font-extrabold tracking-[0.2em] uppercase text-xs h-11 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
        >
          {isLaunching ? (
            <>
              <Loader2 className="animate-spin" size={14} />
              PROCESSING
            </>
          ) : (
            <>
              <Play size={14} className="fill-current" />
              LAUNCH GAME
            </>
          )}
        </Button>
      </form>
    </Card>
  );
}
    