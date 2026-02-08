import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Coffee,
  RotateCw,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Terminal,
} from "lucide-react";
import { JavaInfo } from "@/types";
import { cn } from "@/lib/utils";

interface JavaCardProps {
  javaList: JavaInfo[];
  isScanning: boolean;
  onScan: () => void;
  jvmArgs: string;
  setJvmArgs: (val: string) => void;
  selectedPath: string;
  onSelect: (path: string) => void;
  wrapperCommand: string;
  setWrapperCommand: (val: string) => void;
}

export function JavaCard({
  javaList,
  isScanning,
  onScan,
  jvmArgs,
  setJvmArgs,
  selectedPath,
  onSelect,
  wrapperCommand,
  setWrapperCommand,
}: JavaCardProps) {
  const [showArgs, setShowArgs] = useState(false);

  return (
    <Card className="border-zinc-800 bg-zinc-900 h-fit">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Coffee className="text-primary" /> Java
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={onScan}
          disabled={isScanning}
          className="gap-2 border-zinc-700 hover:bg-zinc-800 h-8"
        >
          <RotateCw size={14} className={isScanning ? "animate-spin" : ""} />
          {isScanning ? "Scanning..." : "Rescan"}
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Java List */}
        <div className="space-y-3">
          {javaList.length === 0 ? (
            <div className="p-8 text-center border-2 border-dashed border-zinc-800 rounded-xl text-zinc-500 bg-zinc-900/30">
              <Coffee className="mx-auto mb-2 opacity-20" size={32} />
              <p className="text-sm">No Java installations found.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1 custom-scrollbar">
              {javaList.map((java, idx) => {
                const isSelected = java.path === selectedPath;
                return (
                  <div
                    key={idx}
                    onClick={() => onSelect(java.path)}
                    className={cn(
                      "p-3 border rounded-lg flex items-center justify-between group transition-all cursor-pointer relative overflow-hidden",
                      isSelected
                        ? "border-primary bg-primary/5 shadow-[0_0_15px_-5px_var(--color-primary)]"
                        : "border-zinc-800 bg-zinc-950 hover:border-zinc-600 hover:bg-zinc-900",
                    )}
                  >
                    {isSelected && (
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent pointer-events-none" />
                    )}
                    <div className="overflow-hidden mr-4 relative z-10">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "font-bold text-sm",
                            isSelected ? "text-white" : "text-zinc-200",
                          )}
                        >
                          Java {java.version}
                        </span>
                        <span
                          className={cn(
                            "text-[10px] px-1.5 py-0.5 rounded font-mono font-bold border",
                            java.major >= 17
                              ? "bg-green-500/10 text-green-400 border-green-500/20"
                              : java.major >= 11
                                ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                : "bg-orange-500/10 text-orange-400 border-orange-500/20",
                          )}
                        >
                          v{java.major}
                        </span>
                      </div>
                      <div
                        className={cn(
                          "text-[10px] truncate font-mono mt-1 transition-colors",
                          isSelected
                            ? "text-primary-foreground/70"
                            : "text-zinc-500 group-hover:text-zinc-400",
                        )}
                        title={java.path}
                      >
                        {java.path}
                      </div>
                    </div>
                    <CheckCircle
                      size={18}
                      className={cn(
                        "transition-all duration-300 relative z-10",
                        isSelected
                          ? "text-primary opacity-100 scale-100"
                          : "text-zinc-600 opacity-0 scale-75 group-hover:opacity-100",
                      )}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Wrapper Command */}
        <div className="border-t border-zinc-800 pt-4 space-y-3">
          <h3 className="flex items-center gap-2 text-sm font-medium text-zinc-300">
            <Terminal size={16} className="text-zinc-500" />
            Global Wrapper Command
          </h3>
          <input
            value={wrapperCommand}
            onChange={(e) => setWrapperCommand(e.target.value)}
            className="w-full bg-black/20 border border-zinc-800 rounded-md p-3 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary text-zinc-300 placeholder:text-zinc-700"
            placeholder="e.g. mangohud --dlsym"
          />
          <p className="text-[10px] text-zinc-500">
            Prefix commands to run before Java. This is a global setting and
            will apply to all instances unless overridden.
          </p>
        </div>

        {/* Collapsible JVM Args */}
        <div className="border-t border-zinc-800 pt-4">
          <button
            onClick={() => setShowArgs(!showArgs)}
            className="flex items-center justify-between w-full text-sm font-medium text-zinc-300 hover:text-white transition-colors p-1 rounded-md mb-2"
          >
            <span className="flex items-center gap-2">
              <Terminal size={16} className="text-zinc-500" />
              JVM Arguments
            </span>
            {showArgs ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {showArgs && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-200">
              <textarea
                value={jvmArgs}
                onChange={(e) => setJvmArgs(e.target.value)}
                className="w-full bg-black/20 border border-zinc-800 rounded-md p-3 text-xs font-mono h-24 focus:outline-none focus:ring-1 focus:ring-primary text-zinc-300 resize-none placeholder:text-zinc-700"
                placeholder="-XX:+UseG1GC -Dsun.rmi.dgc.server.gcInterval=2147483646 ..."
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
