import { Cpu, Lock } from "lucide-react";
import { InstanceSettings } from "@/types";

interface MemorySectionProps {
  settings: InstanceSettings;
  defaultRam: number;
  onOverrideToggle: (key: "overrideRam", checked: boolean) => void;
  onChange: (key: keyof InstanceSettings, value: any) => void;
}

export function MemorySection({
  settings,
  defaultRam,
  onOverrideToggle,
  onChange,
}: MemorySectionProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold flex items-center gap-2 text-zinc-200">
          <Cpu size={16} className="text-zinc-500" /> Memory Allocation
        </h2>
        <label className="text-xs flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={settings.overrideRam}
            onChange={(e) => onOverrideToggle("overrideRam", e.target.checked)}
            className="accent-emerald-500"
          />
          <span
            className={settings.overrideRam ? "text-white" : "text-zinc-500"}
          >
            Override Global
          </span>
        </label>
      </div>

      <div
        className={`p-4 border border-zinc-800 rounded-lg bg-zinc-900/50 relative transition-all ${
          settings.overrideRam ? "" : "opacity-75"
        }`}
      >
        {!settings.overrideRam && (
          <div className="absolute inset-0 bg-black/40 z-10 flex items-center justify-center backdrop-blur-[1px] rounded-lg">
            <div className="bg-zinc-900 border border-zinc-700 px-3 py-1.5 rounded text-xs flex items-center gap-2 text-zinc-300 shadow-xl">
              <Lock size={12} /> Using Global Setting ({defaultRam} MB)
            </div>
          </div>
        )}

        <div className="flex justify-between mb-4">
          <span className="text-xs font-mono text-zinc-400">Total RAM</span>
          <span
            className={`text-sm font-bold ${
              settings.overrideRam ? "text-emerald-400" : "text-zinc-500"
            }`}
          >
            {settings.ramMB} MB
          </span>
        </div>
        <input
          type="range"
          min="1024"
          max="16384"
          step="512"
          value={settings.ramMB}
          onChange={(e) => onChange("ramMB", parseInt(e.target.value))}
          disabled={!settings.overrideRam}
          className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-emerald-500 disabled:cursor-not-allowed"
        />
        <div className="flex justify-between text-[10px] text-zinc-600 font-mono mt-2">
          <span>1 GB</span>
          <span>8 GB</span>
          <span>16 GB</span>
        </div>
      </div>
    </section>
  );
}
