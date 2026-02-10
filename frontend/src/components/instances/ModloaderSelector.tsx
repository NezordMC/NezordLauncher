import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
      "flex-1 h-9 text-xs font-medium uppercase tracking-wide border transition-all cursor-pointer rounded-md";
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
          className={getButtonClass("vanilla")}
        >
          Vanilla
        </button>
        <button
          type="button"
          onClick={() => onTypeChange("fabric")}
          className={getButtonClass("fabric")}
        >
          Fabric
        </button>
        <button
          type="button"
          onClick={() => onTypeChange("quilt")}
          className={getButtonClass("quilt")}
        >
          Quilt
        </button>
      </div>

      {selectedType !== "vanilla" && (
        <Select
          value={
            sanitizedLoaders.includes(loaderVersion) ? loaderVersion : undefined
          }
          onValueChange={onLoaderVersionChange}
          disabled={isLoadingLoaders || sanitizedLoaders.length === 0}
        >
          <SelectTrigger className="w-full bg-zinc-800 border-zinc-700 text-white text-sm h-9">
            <SelectValue
              placeholder={
                isLoadingLoaders
                  ? "Loading..."
                  : sanitizedLoaders.length === 0
                    ? "No versions available"
                    : "Select version"
              }
            />
          </SelectTrigger>
          <SelectContent className="max-h-48 bg-zinc-900 border-zinc-700">
            {sanitizedLoaders.map((v) => (
              <SelectItem
                key={v}
                value={v}
                className="text-zinc-300 focus:bg-zinc-800 focus:text-white"
              >
                {v}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
