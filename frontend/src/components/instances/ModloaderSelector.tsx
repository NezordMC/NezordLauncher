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
  const getButtonClass = (type: ModloaderType) => {
    const base =
      "flex-1 h-9 text-xs font-medium uppercase tracking-wide border transition-all cursor-pointer";
    if (selectedType === type) {
      return `${base} bg-primary text-white border-primary`;
    }
    return `${base} bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-800 hover:text-white`;
  };

  return (
    <div className="space-y-3">
      <label className="text-xs text-zinc-500">Modloader</label>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onTypeChange("vanilla")}
          className={`${getButtonClass("vanilla")} rounded-md`}
        >
          Vanilla
        </button>
        <button
          type="button"
          onClick={() => onTypeChange("fabric")}
          className={`${getButtonClass("fabric")} rounded-md`}
        >
          Fabric
        </button>
        <button
          type="button"
          onClick={() => onTypeChange("quilt")}
          className={`${getButtonClass("quilt")} rounded-md`}
        >
          Quilt
        </button>
      </div>

      {selectedType !== "vanilla" && (
        <select
          className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs h-9 px-3 rounded-md focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
          value={loaderVersion}
          onChange={(e) => onLoaderVersionChange(e.target.value)}
          disabled={isLoadingLoaders}
        >
          {isLoadingLoaders ? (
            <option>Loading...</option>
          ) : availableLoaders.length > 0 ? (
            availableLoaders.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))
          ) : (
            <option value="" disabled>
              Select version
            </option>
          )}
        </select>
      )}
    </div>
  );
}
