import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  const [gameVersion, setGameVersion] = useState("");
  const [modloader, setModloader] = useState<ModloaderType>("vanilla");
  const [loaderVersion, setLoaderVersion] = useState("");

  const [availableLoaders, setAvailableLoaders] = useState<string[]>([]);
  const [isLoadingLoaders, setIsLoadingLoaders] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName("");
      setGameVersion(minecraftVersions[0]?.id || "");
      setModloader("vanilla");
      setLoaderVersion("");
    }
  }, [isOpen, minecraftVersions]);

  useEffect(() => {
    if (modloader === "vanilla" || !gameVersion) {
      setAvailableLoaders([]);
      setLoaderVersion("");
      setIsLoadingLoaders(false);
      return;
    }

    const load = async () => {
      setIsLoadingLoaders(true);
      const list = await fetchModloaders(gameVersion, modloader);
      const sanitized = list.map((v) => v.trim()).filter((v) => v.length > 0);
      setAvailableLoaders(sanitized);
      if (sanitized.length > 0) {
        setLoaderVersion(sanitized[0]);
      } else {
        setLoaderVersion("");
      }
      setIsLoadingLoaders(false);
    };
    load();
  }, [modloader, gameVersion]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !gameVersion) return;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800/50">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Create New Instance
            </h2>
            <p className="text-sm text-zinc-500 mt-0.5">
              Configure your Minecraft installation
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 -mr-2 rounded-full text-zinc-500 hover:text-white hover:bg-zinc-800/50 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  Instance Name
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-primary/50 focus-visible:border-primary/50 h-10"
                  placeholder="e.g. My Survival World"
                  autoFocus
                />
              </div>

              <div className="space-y-3">
                <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  Game Version
                </label>
                <Select
                  value={
                    minecraftVersions.some((v) => v.id === gameVersion)
                      ? gameVersion
                      : undefined
                  }
                  onValueChange={setGameVersion}
                  disabled={minecraftVersions.length === 0}
                >
                  <SelectTrigger className="w-full bg-zinc-900 border-zinc-800 text-white text-sm h-10 focus:ring-1 focus:ring-primary/50">
                    <SelectValue placeholder="Select version" />
                  </SelectTrigger>
                  <SelectContent
                    className="max-h-60 bg-zinc-900 border-zinc-800 text-zinc-300 w-[var(--radix-select-trigger-width)]"
                    position="popper"
                  >
                    {minecraftVersions.map((v) => (
                      <SelectItem
                        key={v.id}
                        value={v.id}
                        className="focus:bg-zinc-800 focus:text-white cursor-pointer"
                      >
                        {v.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
          </div>

          <div className="flex items-center justify-end gap-3 px-6 py-5 border-t border-zinc-800/50 bg-zinc-900/20 rounded-b-2xl">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="text-zinc-400 hover:text-white hover:bg-zinc-800"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                !name ||
                !gameVersion ||
                isCreating ||
                (modloader !== "vanilla" && !loaderVersion)
              }
              className="bg-primary hover:bg-primary/90 text-white font-medium px-8 min-w-[140px]"
            >
              {isCreating ? (
                <Loader2 className="animate-spin mr-2" size={16} />
              ) : null}
              {isCreating ? "Creating..." : "Create Instance"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
