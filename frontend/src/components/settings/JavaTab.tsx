import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  RotateCw,
  CheckCircle,
  AlertCircle,
  Loader2,
  Terminal,
} from "lucide-react";
import { JavaInfo } from "@/types";
import { cn } from "@/lib/utils";
import { VerifyJavaPath } from "../../wailsjs/go/main/App";

const debounce = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

interface JavaTabProps {
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

export function JavaTab({
  javaList,
  isScanning,
  onScan,
  jvmArgs,
  setJvmArgs,
  selectedPath,
  onSelect,
  wrapperCommand,
  setWrapperCommand,
}: JavaTabProps) {
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
    } catch {
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Java Runtime</CardTitle>
          <CardDescription>
            Select the Java executable to use for launching Minecraft.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Java Path</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={onScan}
                disabled={isScanning}
                className="h-7 text-xs"
              >
                <RotateCw
                  size={12}
                  className={cn("mr-1", isScanning && "animate-spin")}
                />
                {isScanning ? "Scanning..." : "Auto-Detect"}
              </Button>
            </div>
            <div className="relative">
              <Input
                value={selectedPath}
                onChange={(e) => handlePathChange(e.target.value)}
                placeholder="/path/to/java/bin/java"
                className={cn(
                  "font-mono pr-10",
                  verificationStatus === "valid" &&
                    "border-green-500/50 focus-visible:ring-green-500/20",
                  verificationStatus === "invalid" &&
                    "border-red-500/50 focus-visible:ring-red-500/20",
                )}
              />
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                {verificationStatus === "verifying" && (
                  <Loader2
                    className="animate-spin text-muted-foreground"
                    size={16}
                  />
                )}
                {verificationStatus === "valid" && (
                  <CheckCircle className="text-green-500" size={16} />
                )}
                {verificationStatus === "invalid" && (
                  <AlertCircle className="text-red-500" size={16} />
                )}
              </div>
            </div>

            {verificationStatus === "valid" && detectedVersion && (
              <p className="tex-sm text-green-500 flex items-center gap-2">
                <CheckCircle size={14} />
                Verified: {detectedVersion}
              </p>
            )}
            {verificationStatus === "invalid" && (
              <p className="text-sm text-red-500 flex items-center gap-2">
                <AlertCircle size={14} />
                Invalid Java path or permission denied
              </p>
            )}
          </div>

          {javaList.length > 0 && (
            <div className="space-y-3">
              <Label className="text-muted-foreground text-xs uppercase tracking-wider">
                Detected Installations
              </Label>
              <div className="grid gap-2">
                {javaList.map((java, idx) => {
                  const isSelected = java.path === selectedPath;
                  return (
                    <button
                      key={idx}
                      onClick={() => handlePathChange(java.path)}
                      className={cn(
                        "flex w-full items-center justify-between rounded-md border p-3 text-left transition-all hover:bg-muted/50",
                        isSelected
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "border-border",
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                          <span className="text-xs font-bold">
                            {java.major}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-sm">
                            Java {java.version}
                          </div>
                          <div className="text-xs text-muted-foreground font-mono truncate max-w-[250px] sm:max-w-md">
                            {java.path}
                          </div>
                        </div>
                      </div>
                      {isSelected && (
                        <CheckCircle size={16} className="text-primary" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Terminal size={16} />
              JVM Arguments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={jvmArgs}
              onChange={(e) => setJvmArgs(e.target.value)}
              className="h-32 font-mono text-xs"
              placeholder="-XX:+UseG1GC -Xmx4G"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Terminal size={16} />
              Wrapper Command
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Input
              value={wrapperCommand}
              onChange={(e) => setWrapperCommand(e.target.value)}
              className="font-mono text-sm"
              placeholder="e.g. mangohud --dlsym"
            />
            <p className="text-xs text-muted-foreground">
              Command specific prefix (e.g. gamemode, mangohud).
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
