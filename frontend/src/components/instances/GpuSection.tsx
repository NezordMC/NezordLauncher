import { Cpu } from "lucide-react";
import { InstanceSettings } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface GpuSectionProps {
  settings: InstanceSettings;
  onChange: (key: keyof InstanceSettings, value: any) => void;
}

export function GpuSection({ settings, onChange }: GpuSectionProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-sm font-bold flex items-center gap-2 text-zinc-200">
        <Cpu size={16} className="text-zinc-500" /> GPU Preference
      </h2>
      <div className="space-y-2">
        <label className="text-[10px] text-zinc-500 uppercase">GPU Mode</label>
        <Select
          value={settings.gpuPreference}
          onValueChange={(val: string) => onChange("gpuPreference", val)}
        >
          <SelectTrigger className="w-full bg-zinc-900 border-zinc-800">
            <SelectValue placeholder="Select GPU preference" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="auto">Auto (Default)</SelectItem>
            <SelectItem value="discrete">Discrete GPU (NVIDIA)</SelectItem>
            <SelectItem value="integrated">Integrated GPU (Intel)</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-[10px] text-zinc-500">
          Choose which GPU to use for this instance. "Auto" follows global
          settings.
        </p>
      </div>
    </section>
  );
}
