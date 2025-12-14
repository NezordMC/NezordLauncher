import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Play, User, Cpu, Box, Loader2, Plus, Check, X } from "lucide-react";
import { Account } from "@/hooks/useLauncher";

export interface LaunchConfig {
  version: string;
  ram: number;
}

interface LauncherFormProps {
  onLaunch: (config: LaunchConfig) => void;
  isLaunching: boolean;
  accounts: Account[];
  activeAccount: Account | null;
  onAddAccount: (username: string) => void;
  onSwitchAccount: (uuid: string) => void;
}

export function LauncherForm({
  onLaunch,
  isLaunching,
  accounts,
  activeAccount,
  onAddAccount,
  onSwitchAccount,
}: LauncherFormProps) {
  const [config, setConfig] = useState<LaunchConfig>({
    version: "1.20.1",
    ram: 4096,
  });

  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newUsername, setNewUsername] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLaunch(config);
  };

  const handleAddUser = () => {
    if (newUsername.trim().length > 0) {
      onAddAccount(newUsername);
      setNewUsername("");
      setIsAddingUser(false);
    }
  };

  return (
    <Card className="w-full p-6 bg-zinc-900/50 border-zinc-800 backdrop-blur-sm space-y-6 no-drag shadow-2xl">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* ACCOUNT SELECTOR */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-2">
            <User size={10} /> Account
          </label>

          {isAddingUser ? (
            <div className="flex gap-2 animate-in fade-in slide-in-from-left-2 duration-300">
              <Input
                autoFocus
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="bg-black/50 border-zinc-700 font-mono text-xs h-9 text-zinc-300 focus-visible:ring-zinc-600"
                placeholder="Enter Username"
              />
              <Button
                type="button"
                size="icon"
                className="h-9 w-9 bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={handleAddUser}
              >
                <Check size={14} />
              </Button>
              <Button
                type="button"
                size="icon"
                className="h-9 w-9 bg-zinc-700 hover:bg-zinc-600 text-white"
                onClick={() => setIsAddingUser(false)}
              >
                <X size={14} />
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <div className="relative flex-1">
                <select
                  className="w-full bg-black/50 border border-zinc-800 text-zinc-300 text-xs font-mono h-9 px-3 rounded-md appearance-none focus:outline-none focus:ring-1 focus:ring-zinc-600 cursor-pointer"
                  value={activeAccount?.uuid || ""}
                  onChange={(e) => {
                    if (e.target.value === "ADD_NEW") {
                      setIsAddingUser(true);
                    } else {
                      onSwitchAccount(e.target.value);
                    }
                  }}
                >
                  {accounts.length === 0 && (
                    <option value="" disabled>
                      No accounts found
                    </option>
                  )}
                  {accounts.map((acc) => (
                    <option key={acc.uuid} value={acc.uuid}>
                      {acc.username} ({acc.type})
                    </option>
                  ))}
                  <option
                    value="ADD_NEW"
                    className="font-bold text-emerald-400"
                  >
                    + Add Offline Account
                  </option>
                </select>
                <div className="absolute right-3 top-2.5 pointer-events-none text-zinc-500">
                  <User size={12} />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-2">
              <Box size={10} /> Version ID
            </label>
            <Input
              value={config.version}
              onChange={(e) =>
                setConfig({ ...config, version: e.target.value })
              }
              className="bg-black/50 border-zinc-800 font-mono text-xs h-9 text-zinc-300 focus-visible:ring-zinc-600 transition-all"
              placeholder="e.g. 1.20.1"
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

        <Button
          type="submit"
          disabled={isLaunching || !activeAccount}
          className="w-full bg-zinc-50 hover:bg-zinc-300 text-black font-extrabold tracking-[0.2em] uppercase text-xs h-11 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
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
