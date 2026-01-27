import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Zap, ChevronLeft, CheckCircle, Rocket } from "lucide-react";
import { cn } from "@/lib/utils";

interface MemoryFinishStepProps {
  ramValue: number;
  setRamValue: (val: number) => void;
  onBack: () => void;
  onFinish: () => void;
}

const presets = [
  { label: "Low", value: 2048, desc: "2 GB", color: "text-green-400" },
  { label: "Medium", value: 4096, desc: "4 GB", color: "text-blue-400" },
  { label: "High", value: 8192, desc: "8 GB", color: "text-orange-400" },
];

export function MemoryFinishStep({
  ramValue,
  setRamValue,
  onBack,
  onFinish,
}: MemoryFinishStepProps) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!ramValue || Number.isNaN(ramValue)) {
      setRamValue(4096);
    }
  }, [ramValue, setRamValue]);

  const handlePreset = (value: number) => {
    setRamValue(value);
  };

  const handleFinish = () => {
    setIsReady(true);
    setTimeout(onFinish, 1500);
  };

  if (isReady) {
    return (
      <div className="space-y-6 text-center animate-in zoom-in-95 fade-in duration-500">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary animate-in zoom-in duration-300">
          <CheckCircle size={40} />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-white">All Set!</h1>
          <p className="text-zinc-500 text-sm">Launching dashboard...</p>
        </div>
        <div className="flex items-center justify-center gap-1">
          <div
            className="w-2 h-2 rounded-full bg-primary animate-bounce"
            style={{ animationDelay: "0ms" }}
          />
          <div
            className="w-2 h-2 rounded-full bg-primary animate-bounce"
            style={{ animationDelay: "150ms" }}
          />
          <div
            className="w-2 h-2 rounded-full bg-primary animate-bounce"
            style={{ animationDelay: "300ms" }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="text-center space-y-1">
        <Zap className="mx-auto text-primary mb-2" size={28} />
        <h2 className="text-xl font-bold text-white">Memory Allocation</h2>
        <p className="text-zinc-500 text-xs">How much RAM for Minecraft?</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {presets.map((preset) => {
          const isActive = ramValue === preset.value;
          return (
            <button
              key={preset.label}
              onClick={() => handlePreset(preset.value)}
              className={cn(
                "py-4 px-2 rounded-xl border transition-all flex flex-col items-center gap-1",
                isActive
                  ? "border-primary bg-primary/10 scale-105"
                  : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700",
              )}
            >
              <span
                className={cn(
                  "text-lg font-bold",
                  isActive ? "text-white" : "text-zinc-400",
                )}
              >
                {preset.desc}
              </span>
              <span
                className={cn(
                  "text-[10px] uppercase font-bold",
                  isActive ? preset.color : "text-zinc-600",
                )}
              >
                {preset.label}
              </span>
            </button>
          );
        })}
      </div>

      <div className="p-4 border border-zinc-800 rounded-xl bg-zinc-900/50 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs text-zinc-500">Fine-tune</span>
          <span className="text-sm font-mono font-bold text-white">
            {ramValue} MB
          </span>
        </div>
        <input
          type="range"
          min="1024"
          max="16384"
          step="512"
          value={ramValue}
          onChange={(e) => setRamValue(parseInt(e.target.value))}
          className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-primary"
        />
        <div className="flex justify-between text-[10px] text-zinc-600">
          <span>1 GB</span>
          <span>16 GB</span>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          onClick={onBack}
          variant="outline"
          className="flex-1 border-zinc-800 hover:bg-zinc-900 font-medium"
        >
          <ChevronLeft size={16} />
          <span>Back</span>
        </Button>
        <Button
          onClick={handleFinish}
          className="flex-1 bg-primary hover:bg-primary/90 font-bold gap-2"
        >
          <Rocket size={16} />
          <span>Start Playing</span>
        </Button>
      </div>
    </div>
  );
}
