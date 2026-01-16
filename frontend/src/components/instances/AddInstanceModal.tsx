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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
          <h2 className="font-semibold text-white">Create Instance</h2>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs text-zinc-500">Instance Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-white text-sm"
              placeholder="My Survival World"
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-zinc-500">Game Version</label>
            <Select value={gameVersion} onValueChange={setGameVersion}>
              <SelectTrigger className="w-full bg-zinc-800 border-zinc-700 text-white text-sm h-9">
                <SelectValue placeholder="Select version" />
              </SelectTrigger>
              <SelectContent className="max-h-48 bg-zinc-900 border-zinc-700">
                {minecraftVersions.map((v) => (
                  <SelectItem
                    key={v.id}
                    value={v.id}
                    className="text-zinc-300 focus:bg-zinc-800 focus:text-white"
                  >
                    {v.id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <ModloaderSelector
            selectedType={modloader}
            onTypeChange={setModloader}
            loaderVersion={loaderVersion}
            onLoaderVersionChange={setLoaderVersion}
            availableLoaders={availableLoaders}
            isLoadingLoaders={isLoadingLoaders}
          />

          <Button
            type="submit"
            disabled={
              !name || isCreating || (modloader !== "vanilla" && !loaderVersion)
            }
            className="w-full bg-primary hover:bg-primary/90 text-white font-medium text-sm h-10"
          >
            {isCreating ? (
              <Loader2 className="animate-spin" size={14} />
            ) : (
              "Create"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
