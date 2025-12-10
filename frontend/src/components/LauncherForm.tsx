import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

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
    <Card className="w-full p-4 bg-zinc-900 border-zinc-800 space-y-4 no-drag shadow-xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
              Version ID
            </label>
            <Input
              value={config.version}
              onChange={(e) =>
                setConfig({ ...config, version: e.target.value })
              }
              className="bg-black border-zinc-800 font-mono text-xs h-8 text-zinc-300 focus-visible:ring-zinc-700"
              placeholder="e.g. 1.20.1"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
              RAM (MB)
            </label>
            <Input
              type="number"
              value={config.ram}
              onChange={(e) =>
                setConfig({ ...config, ram: parseInt(e.target.value) || 0 })
              }
              className="bg-black border-zinc-800 font-mono text-xs h-8 text-zinc-300 focus-visible:ring-zinc-700"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
            Username
          </label>
          <Input
            value={config.username}
            onChange={(e) => setConfig({ ...config, username: e.target.value })}
            className="bg-black border-zinc-800 font-mono text-xs h-8 text-zinc-300 focus-visible:ring-zinc-700"
            placeholder="Offline Username"
          />
        </div>

        <Button
          type="submit"
          disabled={isLaunching}
          className="w-full bg-white text-black hover:bg-zinc-200 font-bold tracking-[0.2em] uppercase text-xs h-10 transition-all active:scale-95"
        >
          {isLaunching ? "Launching..." : "Play Minecraft"}
        </Button>
      </form>
    </Card>
  );
}
