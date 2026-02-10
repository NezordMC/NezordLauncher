import { Input } from "@/components/ui/input";
import { Terminal } from "lucide-react";
import { InstanceSettings } from "@/types";

interface WrapperCommandSectionProps {
  settings: InstanceSettings;
  onChange: (key: keyof InstanceSettings, value: any) => void;
}

export function WrapperCommandSection({
  settings,
  onChange,
}: WrapperCommandSectionProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold flex items-center gap-2 text-zinc-200">
          <Terminal size={16} className="text-zinc-500" /> Wrapper Command
        </h2>
      </div>

      <div className="space-y-2">
        <Input
          value={settings.wrapperCommand || ""}
          onChange={(e) => onChange("wrapperCommand", e.target.value)}
          placeholder="e.g. mangohud --dlsym"
          className="bg-zinc-900 border-zinc-800 font-mono text-xs"
        />
        <p className="text-[10px] text-zinc-500">
          Prefix commands to run before Java (e.g., gamemode, gamescope,
          mangohud). The Java command will be appended to this.
        </p>
      </div>
    </section>
  );
}
