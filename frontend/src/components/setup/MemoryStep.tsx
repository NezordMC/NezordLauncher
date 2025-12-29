import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";

interface MemoryStepProps {
  ramValue: number;
  setRamValue: (val: number) => void;
  onNext: () => void;
}

export function MemoryStep({ ramValue, setRamValue, onNext }: MemoryStepProps) {
  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="text-center space-y-1 mb-6">
        <Zap className="mx-auto text-zinc-400 mb-2" size={24} />
        <h2 className="text-lg font-bold">Memory</h2>
      </div>

      <div className="p-6 border border-zinc-800 rounded-md bg-zinc-900/50 space-y-6">
        <div className="text-center">
          <span className="text-3xl font-bold">{ramValue}</span>
          <span className="text-zinc-500 text-xs ml-1">MB</span>
        </div>

        <input
          type="range"
          min="1024"
          max="16384"
          step="512"
          value={ramValue}
          onChange={(e) => setRamValue(parseInt(e.target.value))}
          className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white"
        />
      </div>

      <Button
        onClick={onNext}
        className="w-full bg-white text-black hover:bg-zinc-200 font-bold"
      >
        Finish
      </Button>
    </div>
  );
}
