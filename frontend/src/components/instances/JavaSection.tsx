import { Input } from "@/components/ui/input";
import { HardDrive } from "lucide-react";
import { InstanceSettings } from "@/types";

interface JavaSectionProps {
  settings: InstanceSettings;
  onOverrideToggle: (key: "overrideJava", checked: boolean) => void;
  onChange: (key: keyof InstanceSettings, value: any) => void;
}

export function JavaSection({
  settings,
  onOverrideToggle,
  onChange,
}: JavaSectionProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold flex items-center gap-2 text-zinc-200">
          <HardDrive size={16} className="text-zinc-500" /> Java Runtime
        </h2>
        <label className="text-xs flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={settings.overrideJava}
            onChange={(e) => onOverrideToggle("overrideJava", e.target.checked)}
            className="accent-primary"
          />
          <span
            className={settings.overrideJava ? "text-white" : "text-zinc-500"}
          >
            Override Global
          </span>
        </label>
      </div>

      <div
        className={`space-y-2 transition-opacity ${
          settings.overrideJava
            ? "opacity-100"
            : "opacity-50 pointer-events-none"
        }`}
      >
        <Input
          value={settings.javaPath}
          onChange={(e) => onChange("javaPath", e.target.value)}
          placeholder="/path/to/java/bin/java"
          className="bg-zinc-900 border-zinc-800 font-mono text-xs"
        />
        <p className="text-[10px] text-zinc-500">
          Leave empty to use auto-detected Java.
        </p>
      </div>
    </section>
  );
}
