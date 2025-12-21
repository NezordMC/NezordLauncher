import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Play, User, Cpu, Box, Loader2, Check, X } from "lucide-react";
import { Account, Version } from "@/hooks/useLauncher";
import { ModloaderSelector, ModloaderType } from "./ModloaderSelector";
import { LoginModal } from "./LoginModal"; 

export interface LaunchConfig {
  version: string;
  ram: number;
  modloaderType: ModloaderType;
  loaderVersion: string;
}

interface LauncherFormProps {
  onLaunch: (config: LaunchConfig) => void;
  isLaunching: boolean;
  accounts: Account[];
  activeAccount: Account | null;
  onAddAccount: (username: string) => void;
  onLoginElyBy: (u: string, p: string) => Promise<void>; 
  onSwitchAccount: (uuid: string) => void;
  minecraftVersions: Version[];
  fetchModloaders: (
    mcVersion: string,
    type: ModloaderType,
  ) => Promise<string[]>;
}

export function LauncherForm({
  onLaunch,
  isLaunching,
  accounts,
  activeAccount,
  onAddAccount,
  onLoginElyBy,
  onSwitchAccount,
  minecraftVersions,
  fetchModloaders,
}: LauncherFormProps) {
  const [config, setConfig] = useState<LaunchConfig>({
    version: "1.20.1",
    ram: 4096,
    modloaderType: "vanilla",
    loaderVersion: "",
  });

  const [isAddingOffline, setIsAddingOffline] = useState(false);
  const [newOfflineName, setNewOfflineName] = useState("");

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false); 

  const [availableLoaders, setAvailableLoaders] = useState<string[]>([]);
  const [isLoadingLoaders, setIsLoadingLoaders] = useState(false);

  useEffect(() => {
    if (
      minecraftVersions.length > 0 &&
      !minecraftVersions.find((v) => v.id === config.version)
    ) {
      setConfig((p) => ({ ...p, version: minecraftVersions[0].id }));
    }
  }, [minecraftVersions]);

  useEffect(() => {
    if (config.modloaderType === "vanilla") {
      setAvailableLoaders([]);
      setConfig((p) => ({ ...p, loaderVersion: "" }));
      return;
    }

    const load = async () => {
      setIsLoadingLoaders(true);
      setAvailableLoaders([]);
      const loaders = await fetchModloaders(
        config.version,
        config.modloaderType,
      );
      setAvailableLoaders(loaders);
      if (loaders.length > 0) {
        setConfig((p) => ({ ...p, loaderVersion: loaders[0] }));
      } else {
        setConfig((p) => ({ ...p, loaderVersion: "" }));
      }
      setIsLoadingLoaders(false);
    };

    load();
  }, [config.modloaderType, config.version]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLaunch(config);
  };

  const handleAddOffline = () => {
    if (newOfflineName.trim().length > 0) {
      onAddAccount(newOfflineName);
      setNewOfflineName("");
      setIsAddingOffline(false);
    }
  };

  return (
    <>
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLogin={onLoginElyBy}
      />

      <Card className="w-full p-6 bg-zinc-900/50 border-zinc-800 backdrop-blur-sm space-y-6 no-drag shadow-2xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-2">
              <User size={10} /> Account
            </label>

            {isAddingOffline ? (
              <div className="flex gap-2 animate-in fade-in slide-in-from-left-2 duration-300">
                <Input
                  autoFocus
                  value={newOfflineName}
                  onChange={(e) => setNewOfflineName(e.target.value)}
                  className="bg-black/50 border-zinc-700 font-mono text-xs h-9 text-zinc-300 focus-visible:ring-zinc-600"
                  placeholder="Offline Username"
                />
                <Button
                  type="button"
                  size="icon"
                  className="h-9 w-9 bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={handleAddOffline}
                >
                  <Check size={14} />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  className="h-9 w-9 bg-zinc-700 hover:bg-zinc-600 text-white"
                  onClick={() => setIsAddingOffline(false)}
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
                      const val = e.target.value;
                      if (val === "ADD_OFFLINE") setIsAddingOffline(true);
                      else if (val === "ADD_ELYBY") setIsLoginModalOpen(true);
                      else onSwitchAccount(val);
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
                    <option disabled>──────────</option>
                    <option
                      value="ADD_OFFLINE"
                      className="font-bold text-zinc-400"
                    >
                      + Add Offline Account
                    </option>
                    <option
                      value="ADD_ELYBY"
                      className="font-bold text-emerald-400"
                    >
                      + Add Ely.by Account
                    </option>
                  </select>
                </div>
              </div>
            )}
          </div>

          <ModloaderSelector
            selectedType={config.modloaderType}
            onTypeChange={(t) => setConfig((p) => ({ ...p, modloaderType: t }))}
            loaderVersion={config.loaderVersion}
            onLoaderVersionChange={(v) =>
              setConfig((p) => ({ ...p, loaderVersion: v }))
            }
            availableLoaders={availableLoaders}
            isLoadingLoaders={isLoadingLoaders}
          />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                <Box size={10} /> Game Version
              </label>
              <div className="relative">
                <select
                  className="w-full bg-black/50 border border-zinc-800 text-zinc-300 text-xs font-mono h-9 px-3 rounded-md appearance-none focus:outline-none focus:ring-1 focus:ring-zinc-600 cursor-pointer disabled:opacity-50"
                  value={config.version}
                  onChange={(e) =>
                    setConfig({ ...config, version: e.target.value })
                  }
                  disabled={isLaunching}
                >
                  {minecraftVersions.length === 0 ? (
                    <option value="1.20.1">1.20.1 (Offline)</option>
                  ) : (
                    minecraftVersions.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.id}
                      </option>
                    ))
                  )}
                </select>
                <div className="absolute right-3 top-2.5 pointer-events-none text-zinc-500">
                  <Box size={12} />
                </div>
              </div>
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
            disabled={
              isLaunching ||
              !activeAccount ||
              (config.modloaderType !== "vanilla" && !config.loaderVersion)
            }
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
    </>
  );
}
