import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

import vanillaImg from "@/assets/images/vanilla.png";
import fabricImg from "@/assets/images/fabric.png";
import quiltImg from "@/assets/images/quilt.png";

export type ModloaderType = "vanilla" | "fabric" | "quilt";

interface ModloaderSelectorProps {
  selectedType: ModloaderType;
  onTypeChange: (type: ModloaderType) => void;
  loaderVersion: string;
  onLoaderVersionChange: (version: string) => void;
  availableLoaders: string[];
  isLoadingLoaders?: boolean;
}

export function ModloaderSelector({
  selectedType,
  onTypeChange,
  loaderVersion,
  onLoaderVersionChange,
  availableLoaders,
  isLoadingLoaders = false,
}: ModloaderSelectorProps) {
  const sanitizedLoaders = availableLoaders
    .map((v) => v.trim())
    .filter((v) => v.length > 0);

  const getButtonClass = (type: ModloaderType) => {
    const base =
      "flex flex-row items-center justify-start gap-4 p-3 rounded-xl border transition-all cursor-pointer w-full group";
    const selected =
      "bg-zinc-800/80 border-primary/50 ring-1 ring-primary/50 shadow-lg shadow-black/20";
    const unselected =
      "bg-zinc-900 border-zinc-800 hover:bg-zinc-800/50 hover:border-zinc-700";

    return cn(base, selectedType === type ? selected : unselected);
  };

  return (
    <div className="space-y-4">
      <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
        Select Modloader
      </label>

      <div className="grid grid-cols-3 gap-4">
        <button
          type="button"
          onClick={() => onTypeChange("vanilla")}
          className={getButtonClass("vanilla")}
        >
          <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center">
            <img
              src={vanillaImg}
              alt="Vanilla"
              className="w-6 h-6 object-contain opacity-80 group-hover:opacity-100 transition-opacity"
            />
          </div>
          <span
            className={cn(
              "font-medium text-sm",
              selectedType === "vanilla"
                ? "text-white"
                : "text-zinc-400 group-hover:text-zinc-200",
            )}
          >
            Vanilla
          </span>
        </button>

        <button
          type="button"
          onClick={() => onTypeChange("fabric")}
          className={getButtonClass("fabric")}
        >
          <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center">
            <img
              src={fabricImg}
              alt="Fabric"
              className="w-6 h-6 object-contain opacity-80 group-hover:opacity-100 transition-opacity"
            />
          </div>
          <span
            className={cn(
              "font-medium text-sm",
              selectedType === "fabric"
                ? "text-white"
                : "text-zinc-400 group-hover:text-zinc-200",
            )}
          >
            Fabric
          </span>
        </button>

        <button
          type="button"
          onClick={() => onTypeChange("quilt")}
          className={getButtonClass("quilt")}
        >
          <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center">
            <img
              src={quiltImg}
              alt="Quilt"
              className="w-6 h-6 object-contain opacity-80 group-hover:opacity-100 transition-opacity"
            />
          </div>
          <span
            className={cn(
              "font-medium text-sm",
              selectedType === "quilt"
                ? "text-white"
                : "text-zinc-400 group-hover:text-zinc-200",
            )}
          >
            Quilt
          </span>
        </button>
      </div>

      {selectedType !== "vanilla" && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-200 pt-2">
          <Select
            value={
              sanitizedLoaders.includes(loaderVersion)
                ? loaderVersion
                : undefined
            }
            onValueChange={onLoaderVersionChange}
            disabled={isLoadingLoaders || sanitizedLoaders.length === 0}
          >
            <SelectTrigger className="w-full bg-zinc-900 border-zinc-800 text-white text-sm h-10 focus:ring-1 focus:ring-primary/50 transition-all">
              <SelectValue
                placeholder={
                  isLoadingLoaders
                    ? "Loading versions..."
                    : sanitizedLoaders.length === 0
                      ? "No versions available"
                      : "Select loader version"
                }
              />
            </SelectTrigger>
            <SelectContent
              className="max-h-60 bg-zinc-900 border-zinc-800 text-zinc-300 w-[var(--radix-select-trigger-width)]"
              position="popper"
            >
              {sanitizedLoaders.map((v) => (
                <SelectItem
                  key={v}
                  value={v}
                  className="focus:bg-zinc-800 focus:text-white cursor-pointer"
                >
                  {v}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
