import { Button } from "@/components/ui/button";
import { RotateCw, CheckCircle, Info } from "lucide-react";
import { JavaInfo } from "@/types";

interface JavaManagerProps {
  javaList: JavaInfo[];
  isScanning: boolean;
  onScan: () => void;
}

export function JavaManager({
  javaList,
  isScanning,
  onScan,
}: JavaManagerProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">Java Runtimes</h2>
          <p className="text-xs text-zinc-500">
            Detected JDK installations on your system.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onScan}
          disabled={isScanning}
          className="gap-2 border-zinc-700 hover:bg-zinc-800"
        >
          <RotateCw size={14} className={isScanning ? "animate-spin" : ""} />{" "}
          Rescan
        </Button>
      </div>

      <div className="space-y-2">
        {javaList.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-zinc-800 rounded-lg text-zinc-500">
            {isScanning ? "Scanning..." : "No Java installations found."}
          </div>
        ) : (
          javaList.map((java, idx) => (
            <div
              key={idx}
              className="p-3 border border-zinc-800 bg-zinc-900/30 rounded-lg flex items-center justify-between group hover:border-zinc-700 transition-colors"
            >
              <div className="overflow-hidden mr-4">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-zinc-200">
                    Java {java.version}
                  </span>
                  <span className="text-[10px] bg-zinc-800 px-1.5 rounded text-zinc-400 font-mono">
                    v{java.major}
                  </span>
                </div>
                <div
                  className="text-[10px] text-zinc-500 truncate font-mono mt-0.5"
                  title={java.path}
                >
                  {java.path}
                </div>
              </div>
              <CheckCircle
                size={16}
                className="text-emerald-500 opacity-50 group-hover:opacity-100"
              />
            </div>
          ))
        )}
      </div>

      <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <p className="text-xs text-blue-300 flex gap-2">
          <Info size={14} className="shrink-0 mt-0.5" />
          Nezord Launcher automatically selects the best Java version for each
          Minecraft version. You can override this per-instance.
        </p>
      </div>
    </div>
  );
}
