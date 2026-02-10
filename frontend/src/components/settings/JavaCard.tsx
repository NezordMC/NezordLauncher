import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Coffee,
  RotateCw,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Terminal,
  AlertCircle,
  Loader2,
  FolderOpen,
} from "lucide-react";
import { JavaInfo } from "@/types";
import { cn } from "@/lib/utils";
import {
  VerifyJavaPath,
  ScanJavaInstallations,
} from "../../../wailsjs/go/main/App";

// Even simpler: Just valid old school debounce function
const debounce = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

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
  const [verificationStatus, setVerificationStatus] = useState<
    "idle" | "verifying" | "valid" | "invalid"
  >("idle");
  const [detectedVersion, setDetectedVersion] = useState<string>("");

  const verifyPath = useCallback(async (path: string) => {
    if (!path) {
      setVerificationStatus("idle");
      setDetectedVersion("");
      return;
    }
    setVerificationStatus("verifying");
    try {
      const result = await VerifyJavaPath(path);
      setVerificationStatus("valid");
      setDetectedVersion(`Java ${result.version}`);
    } catch (e) {
      setVerificationStatus("invalid");
      setDetectedVersion("");
    }
  }, []);

  const debouncedVerify = useCallback(
    debounce((path: string) => verifyPath(path), 500),
    [verifyPath],
  );

  useEffect(() => {
    verifyPath(selectedPath);
  }, [selectedPath, verifyPath]);

  const handlePathChange = (val: string) => {
    onSelect(val);
    debouncedVerify(val);
  };

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
        <div className="space-y-3">
          <label className="text-sm font-medium text-zinc-300">
            Java Runtime Path
          </label>
          <div className="flex gap-2 relative">
            <Input
              value={selectedPath}
              onChange={(e) => handlePathChange(e.target.value)}
              placeholder="/path/to/java/bin/java"
              className={cn(
                "bg-black/20 font-mono text-xs pr-10 transition-colors",
                verificationStatus === "valid" &&
                  "border-green-500/50 focus-visible:ring-green-500/30",
                verificationStatus === "invalid" &&
                  "border-red-500/50 focus-visible:ring-red-500/30",
                verificationStatus === "idle" && "border-zinc-800",
              )}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              {verificationStatus === "verifying" && (
                <Loader2 className="animate-spin text-zinc-500" size={14} />
              )}
              {verificationStatus === "valid" && (
                <CheckCircle className="text-green-500" size={14} />
              )}
              {verificationStatus === "invalid" && (
                <AlertCircle className="text-red-500" size={14} />
              )}
            </div>
          </div>

          {verificationStatus === "valid" && detectedVersion && (
            <div className="text-[10px] text-green-400 flex items-center gap-1.5 animate-in slide-in-from-top-1">
              <CheckCircle size={10} />
              Detected: {detectedVersion}
            </div>
          )}

          {verificationStatus === "invalid" && (
            <div className="text-[10px] text-red-400 flex items-center gap-1.5 animate-in slide-in-from-top-1">
              <AlertCircle size={10} />
              Invalid Java path or permission denied
            </div>
          )}
        </div>

        <div className="space-y-3">
          <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
            Detected Installations
          </label>
          {javaList.length === 0 ? (
            <div className="p-4 text-center border-2 border-dashed border-zinc-800 rounded-xl text-zinc-500 bg-zinc-900/30">
              <p className="text-xs">No Java detected automatically.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1 custom-scrollbar">
              {javaList.map((java, idx) => {
                const isSelected = java.path === selectedPath;
                return (
                  <div
                    key={idx}
                    onClick={() => handlePathChange(java.path)}
                    className={cn(
                      "p-2 border rounded-md flex items-center justify-between group transition-all cursor-pointer relative overflow-hidden",
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-zinc-800 bg-zinc-950 hover:border-zinc-600 hover:bg-zinc-900",
                    )}
                  >
                    <div className="overflow-hidden mr-4 relative z-10">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-zinc-300">
                          Java {java.version}
                        </span>
                        <span
                          className={cn(
                            "text-[10px] px-1 py-0 rounded font-mono font-bold border",
                            java.major >= 17
                              ? "bg-green-500/10 text-green-400 border-green-500/20"
                              : "bg-orange-500/10 text-orange-400 border-orange-500/20",
                          )}
                        >
                          v{java.major}
                        </span>
                      </div>
                      <div className="text-[10px] text-zinc-500 truncate font-mono mt-0.5">
                        {java.path}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="border-t border-zinc-800 pt-4 space-y-3">
          <h3 className="flex items-center gap-2 text-sm font-medium text-zinc-300">
            <Terminal size={16} className="text-zinc-500" />
            Global Wrapper Command
          </h3>
          <Input
            value={wrapperCommand}
            onChange={(e) => setWrapperCommand(e.target.value)}
            className="bg-black/20 border-zinc-800 font-mono text-xs"
            placeholder="e.g. mangohud --dlsym"
          />
          <p className="text-[10px] text-zinc-500">
            Prefix commands to run before Java.
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
                placeholder="-XX:+UseG1GC..."
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
