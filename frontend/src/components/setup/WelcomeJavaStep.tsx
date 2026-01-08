import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Coffee, Loader2, ChevronRight, RotateCw } from "lucide-react";
import { JavaInfo } from "@/types";
import { cn } from "@/lib/utils";

interface WelcomeJavaStepProps {
  loading: boolean;
  detectedJava: JavaInfo[];
  selectedJava: string;
  onSelectJava: (path: string) => void;
  onScan: () => void;
  onNext: () => void;
}

export function WelcomeJavaStep({
  loading,
  detectedJava,
  selectedJava,
  onSelectJava,
  onScan,
  onNext,
}: WelcomeJavaStepProps) {
  const [showJava, setShowJava] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowJava(true), 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (detectedJava.length > 0 && !selectedJava) {
      const best = detectedJava.find((j) => j.major >= 17) || detectedJava[0];
      if (best) onSelectJava(best.path);
    }
  }, [detectedJava, selectedJava, onSelectJava]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Logo Placeholder */}
      <div className="flex flex-col items-center gap-4 pb-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-fuchsia-600 flex items-center justify-center shadow-lg shadow-primary/20">
          <div className="w-8 h-8 bg-white/20 rounded-lg" />
        </div>
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Welcome to Nezord Launcher
          </h1>
          <p className="text-zinc-500 text-sm">Let's get you ready to play</p>
        </div>
      </div>

      {/* Java Section */}
      {showJava && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium text-zinc-400">
              <Coffee size={16} />
              <span>Java Runtime</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onScan}
              disabled={loading}
              className="h-7 text-xs text-zinc-500 hover:text-white"
            >
              <RotateCw size={12} className={loading ? "animate-spin" : ""} />
              <span className="ml-1">Rescan</span>
            </Button>
          </div>

          <div className="border border-zinc-800 rounded-lg overflow-hidden bg-zinc-900/50">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-24 text-zinc-500 gap-2">
                <Loader2 className="animate-spin" size={16} />
                <span className="text-xs">Scanning...</span>
              </div>
            ) : detectedJava.length === 0 ? (
              <div className="p-4 text-center text-amber-400 text-xs">
                No Java detected. Install Java 17+ for best experience.
              </div>
            ) : (
              <div className="max-h-[160px] overflow-y-auto custom-scrollbar">
                {detectedJava.map((j, i) => {
                  const isSelected = j.path === selectedJava;
                  return (
                    <div
                      key={i}
                      onClick={() => onSelectJava(j.path)}
                      className={cn(
                        "flex items-center gap-3 p-3 cursor-pointer transition-all border-b border-zinc-800/50 last:border-0",
                        isSelected ? "bg-primary/10" : "hover:bg-zinc-800/50",
                      )}
                    >
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full transition-colors",
                          isSelected ? "bg-primary" : "bg-zinc-700",
                        )}
                      />
                      <div className="flex-1 overflow-hidden">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "text-xs font-bold",
                              isSelected ? "text-white" : "text-zinc-300",
                            )}
                          >
                            Java {j.version}
                          </span>
                          <span
                            className={cn(
                              "text-[9px] px-1.5 py-0.5 rounded font-mono font-bold",
                              j.major >= 17
                                ? "bg-green-500/10 text-green-400"
                                : j.major >= 11
                                  ? "bg-blue-500/10 text-blue-400"
                                  : "bg-orange-500/10 text-orange-400",
                            )}
                          >
                            v{j.major}
                          </span>
                        </div>
                        <div className="text-[10px] text-zinc-500 truncate font-mono">
                          {j.path}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      <Button
        onClick={onNext}
        disabled={loading}
        className="w-full bg-white text-black hover:bg-zinc-200 font-bold h-11 gap-2"
      >
        <span>Continue</span>
        <ChevronRight size={16} />
      </Button>
    </div>
  );
}
