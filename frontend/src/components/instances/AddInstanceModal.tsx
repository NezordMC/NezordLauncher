import { useState, useEffect } from "react";
import { X, Loader2, Plus, Box } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ModloaderSelector, ModloaderType } from "./ModloaderSelector";
import { useInstanceStore } from "@/stores/instanceStore";

interface AddInstanceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddInstanceModal({ isOpen, onClose }: AddInstanceModalProps) {
  const {
    minecraftVersions,
    fetchModloaders,
    createInstance,
    refreshInstances,
  } = useInstanceStore();

  const [name, setName] = useState("");
  const [gameVersion, setGameVersion] = useState("1.20.1");
  const [modloader, setModloader] = useState<ModloaderType>("vanilla");
  const [loaderVersion, setLoaderVersion] = useState("");

  const [availableLoaders, setAvailableLoaders] = useState<string[]>([]);
  const [isLoadingLoaders, setIsLoadingLoaders] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName("");
      setGameVersion(minecraftVersions[0]?.id || "1.20.1");
      setModloader("vanilla");
      setLoaderVersion("");
    }
  }, [isOpen, minecraftVersions]);

  useEffect(() => {
    if (modloader === "vanilla") {
      setAvailableLoaders([]);
      setLoaderVersion("");
      return;
    }

    const load = async () => {
      setIsLoadingLoaders(true);
      const list = await fetchModloaders(gameVersion, modloader);
      setAvailableLoaders(list);
      if (list.length > 0) setLoaderVersion(list[0]);
      setIsLoadingLoaders(false);
    };
    load();
  }, [modloader, gameVersion]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    setIsCreating(true);
    try {
      await createInstance(name, gameVersion, modloader, loaderVersion);
      await refreshInstances();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-950/50">
          <h2 className="font-bold text-sm tracking-wide text-zinc-100 flex items-center gap-2">
            <Plus size={16} className="text-primary" /> CREATE INSTANCE
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
              Instance Name
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-black/50 border-zinc-800 text-zinc-300 font-mono text-xs focus-visible:ring-primary"
              placeholder="My Survival World"
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-2">
              <Box size={10} /> Game Version
            </label>
            <div className="relative">
              <select
                className="w-full bg-black/50 border border-zinc-800 text-zinc-300 text-xs font-mono h-9 px-3 rounded-md appearance-none focus:outline-none focus:ring-1 focus:ring-zinc-600 cursor-pointer"
                value={gameVersion}
                onChange={(e) => setGameVersion(e.target.value)}
              >
                {minecraftVersions.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.id}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <ModloaderSelector
            selectedType={modloader}
            onTypeChange={setModloader}
            loaderVersion={loaderVersion}
            onLoaderVersionChange={setLoaderVersion}
            availableLoaders={availableLoaders}
            isLoadingLoaders={isLoadingLoaders}
          />

          <div className="pt-2">
            <Button
              type="submit"
              disabled={
                !name ||
                isCreating ||
                (modloader !== "vanilla" && !loaderVersion)
              }
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold tracking-wider text-xs h-10"
            >
              {isCreating ? (
                <Loader2 className="animate-spin" size={14} />
              ) : (
                "CREATE"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
