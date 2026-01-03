import { Button } from "@/components/ui/button";
import { Coffee, Loader2, Check } from "lucide-react";
import { JavaInfo } from "@/types";

interface JavaStepProps {
  loading: boolean;
  detectedJava: JavaInfo[];
  onNext: () => void;
}

export function JavaStep({ loading, detectedJava, onNext }: JavaStepProps) {
  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="text-center space-y-1 mb-6">
        <Coffee className="mx-auto text-zinc-400 mb-2" size={24} />
        <h2 className="text-lg font-bold">Java Check</h2>
      </div>

      <div className="border border-zinc-800 rounded-md p-1 min-h-[100px] max-h-[200px] overflow-y-auto bg-zinc-900/50">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-24 text-zinc-500 gap-2">
            <Loader2 className="animate-spin" size={16} />
            <span className="text-xs">Scanning...</span>
          </div>
        ) : detectedJava.length === 0 ? (
          <div className="p-4 text-center text-red-400 text-xs">
            No Java detected. You can install it later.
          </div>
        ) : (
          detectedJava.map((j, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-3 border-b border-zinc-800/50 last:border-0"
            >
              <div className="font-mono text-xs font-bold text-zinc-400">
                v{j.major}
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="text-xs text-zinc-300 truncate font-mono">
                  {j.path}
                </div>
              </div>
              <Check size={14} className="text-primary" />
            </div>
          ))
        )}
      </div>

      <Button
        onClick={onNext}
        className="w-full bg-white text-black hover:bg-zinc-200 font-bold"
      >
        Continue
      </Button>
    </div>
  );
}
