import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { InstanceSettings } from "@/types";
import { MemorySection } from "./MemorySection";
import { JavaSection } from "./JavaSection";
import { ResolutionSection } from "./ResolutionSection";
import { JvmArgsSection } from "./JvmArgsSection";

interface InstanceSettingsFormProps {
  settings: InstanceSettings;
  defaultRam: number;
  onOverrideToggle: (
    key: "overrideRam" | "overrideJava",
    checked: boolean,
  ) => void;
  onChange: (key: keyof InstanceSettings, value: any) => void;
  onDelete: () => void;
}

export function InstanceSettingsForm({
  settings,
  defaultRam,
  onOverrideToggle,
  onChange,
  onDelete,
}: InstanceSettingsFormProps) {
  return (
    <div className="flex-1 overflow-y-auto pr-2 space-y-8 pb-20">
      <MemorySection
        settings={settings}
        defaultRam={defaultRam}
        onOverrideToggle={onOverrideToggle}
        onChange={onChange}
      />
      <JavaSection
        settings={settings}
        onOverrideToggle={onOverrideToggle}
        onChange={onChange}
      />
      <ResolutionSection settings={settings} onChange={onChange} />
      <JvmArgsSection settings={settings} onChange={onChange} />

      <section className="pt-8 border-t border-zinc-800">
        <Button
          variant="destructive"
          onClick={onDelete}
          className="w-full bg-red-900/20 hover:bg-red-900/40 text-red-500 border border-red-900/50 font-bold text-xs"
        >
          <Trash2 size={14} className="mr-2" /> DELETE INSTANCE
        </Button>
      </section>
    </div>
  );
}
