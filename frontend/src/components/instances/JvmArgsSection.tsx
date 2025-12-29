import { Terminal } from "lucide-react";
import { InstanceSettings } from "@/types";

interface JvmArgsSectionProps {
  settings: InstanceSettings;
  onChange: (key: keyof InstanceSettings, value: any) => void;
}

export function JvmArgsSection({ settings, onChange }: JvmArgsSectionProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-sm font-bold flex items-center gap-2 text-zinc-200">
        <Terminal size={16} className="text-zinc-500" /> JVM Arguments
      </h2>
      <textarea
        value={settings.jvmArgs}
        onChange={(e) => onChange("jvmArgs", e.target.value)}
        className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-3 text-xs font-mono h-24 focus:outline-none focus:ring-1 focus:ring-emerald-600 text-zinc-300 resize-none"
        placeholder="-XX:+UseG1GC ..."
      />
    </section>
  );
}
