import { Input } from "@/components/ui/input";
import { Cpu, Monitor, Terminal } from "lucide-react";

interface GeneralSettingsProps {
  defaultRam: number;
  setDefaultRam: (val: number) => void;
  resW: number;
  setResW: (val: number) => void;
  resH: number;
  setResH: (val: number) => void;
  jvmArgs: string;
  setJvmArgs: (val: string) => void;
}

export function GeneralSettings({
  defaultRam,
  setDefaultRam,
  resW,
  setResW,
  resH,
  setResH,
  jvmArgs,
  setJvmArgs,
}: GeneralSettingsProps) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
      {/* RAM */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Cpu className="text-zinc-500" size={20} /> Default Memory
        </h2>
        <div className="p-4 border border-zinc-800 rounded-lg bg-zinc-900/50">
          <div className="flex justify-between mb-4">
            <span className="text-xs font-mono text-zinc-400">
              Allocated RAM
            </span>
            <span className="text-sm font-bold text-emerald-400">
              {defaultRam} MB
            </span>
          </div>
          <input
            type="range"
            min="1024"
            max="16384"
            step="512"
            value={defaultRam}
            onChange={(e) => setDefaultRam(parseInt(e.target.value))}
            className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
          <p className="text-[10px] text-zinc-500 mt-2">
            This value will be applied to all new instances by default.
          </p>
        </div>
      </section>

      {/* Resolution */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Monitor className="text-zinc-500" size={20} /> Default Resolution
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] text-zinc-500 uppercase">Width</label>
            <Input
              type="number"
              value={resW}
              onChange={(e) => setResW(parseInt(e.target.value))}
              className="bg-zinc-900 border-zinc-800 font-mono text-xs"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-zinc-500 uppercase">
              Height
            </label>
            <Input
              type="number"
              value={resH}
              onChange={(e) => setResH(parseInt(e.target.value))}
              className="bg-zinc-900 border-zinc-800 font-mono text-xs"
            />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Terminal className="text-zinc-500" size={20} /> Global JVM Arguments
        </h2>
        <textarea
          value={jvmArgs}
          onChange={(e) => setJvmArgs(e.target.value)}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-3 text-xs font-mono h-24 focus:outline-none focus:ring-1 focus:ring-emerald-600 text-zinc-300 resize-none"
          placeholder="-XX:+UseG1GC -Dsun.rmi.dgc.server.gcInterval=2147483646 ..."
        />
      </section>
    </div>
  );
}
