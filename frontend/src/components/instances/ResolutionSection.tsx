import { Input } from "@/components/ui/input";
import { Monitor } from "lucide-react";
import { InstanceSettings } from "@/types";

interface ResolutionSectionProps {
  settings: InstanceSettings;
  onChange: (key: keyof InstanceSettings, value: any) => void;
}

export function ResolutionSection({
  settings,
  onChange,
}: ResolutionSectionProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-sm font-bold flex items-center gap-2 text-zinc-200">
        <Monitor size={16} className="text-zinc-500" /> Resolution
      </h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] text-zinc-500 uppercase">Width</label>
          <Input
            type="number"
            value={settings.resolutionW}
            onChange={(e) => onChange("resolutionW", parseInt(e.target.value))}
            className="bg-zinc-900 border-zinc-800 font-mono text-xs"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] text-zinc-500 uppercase">Height</label>
          <Input
            type="number"
            value={settings.resolutionH}
            onChange={(e) => onChange("resolutionH", parseInt(e.target.value))}
            className="bg-zinc-900 border-zinc-800 font-mono text-xs"
          />
        </div>
      </div>
    </section>
  );
}
