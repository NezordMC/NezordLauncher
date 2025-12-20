import { Box, Layers, Zap } from "lucide-react";

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
  const getTabClass = (type: ModloaderType) => {
    const base =
      "flex items-center justify-center gap-2 flex-1 h-9 text-[10px] font-mono uppercase tracking-wider border transition-all cursor-pointer select-none";
    if (selectedType === type) {
      return `${base} bg-zinc-100 text-black border-zinc-100 font-bold`;
    }
    return `${base} bg-black/20 text-zinc-500 border-zinc-800 hover:bg-zinc-800 hover:text-zinc-300`;
  };

  return (
    <div className="space-y-2">
      <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-2">
        <Layers size={10} /> Modloader
      </label>

      <div className="flex w-full">
        <button
          type="button"
          onClick={() => onTypeChange("vanilla")}
          className={`${getTabClass("vanilla")} rounded-l-md border-r-0`}
        >
          <Box size={12} /> Vanilla
        </button>
        <button
          type="button"
          onClick={() => onTypeChange("fabric")}
          className={`${getTabClass("fabric")} border-r-0 border-l-0`}
        >
          <Zap size={12} /> Fabric
        </button>
        <button
          type="button"
          onClick={() => onTypeChange("quilt")}
          className={`${getTabClass("quilt")} rounded-r-md border-l-0`}
        >
          <Zap size={12} /> Quilt
        </button>
      </div>

      {selectedType !== "vanilla" && (
        <div className="relative animate-in fade-in slide-in-from-top-1 duration-200">
          <select
            className="w-full bg-black/50 border border-zinc-800 text-zinc-300 text-xs font-mono h-9 px-3 rounded-md appearance-none focus:outline-none focus:ring-1 focus:ring-zinc-600 cursor-pointer disabled:opacity-50"
            value={loaderVersion}
            onChange={(e) => onLoaderVersionChange(e.target.value)}
            disabled={isLoadingLoaders}
          >
            {isLoadingLoaders ? (
              <option>Fetching versions...</option>
            ) : availableLoaders.length > 0 ? (
              availableLoaders.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))
            ) : (
              <option value="" disabled>
                Select Loader Version
              </option>
            )}
          </select>
          <div className="absolute right-3 top-2.5 pointer-events-none text-zinc-500">
            <Layers size={12} />
          </div>
        </div>
      )}
    </div>
  );
}
