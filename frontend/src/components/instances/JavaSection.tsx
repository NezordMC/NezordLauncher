import { Input } from "@/components/ui/input";
import { HardDrive, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { InstanceSettings } from "@/types";
import { VerifyJavaPath } from "../../../wailsjs/go/main/App";
import { useState, useEffect } from "react";

interface JavaSectionProps {
  settings: InstanceSettings;
  onOverrideToggle: (key: "overrideJava", checked: boolean) => void;
  onChange: (key: keyof InstanceSettings, value: any) => void;
}

export function JavaSection({
  settings,
  onOverrideToggle,
  onChange,
}: JavaSectionProps) {
  const [verifying, setVerifying] = useState(false);
  const [javaInfo, setJavaInfo] = useState<{
    version: string;
    path: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (settings.overrideJava && settings.javaPath) {
      const timer = setTimeout(() => {
        verify(settings.javaPath);
      }, 500); // Debounce 500ms
      return () => clearTimeout(timer);
    } else {
      setJavaInfo(null);
      setError(null);
    }
  }, [settings.javaPath, settings.overrideJava]);

  const verify = async (path: string) => {
    setVerifying(true);
    setError(null);
    setJavaInfo(null);
    try {
      const info = await VerifyJavaPath(path);
      if (info) {
        setJavaInfo({ version: info.version, path: info.path });
      } else {
        setError("Invalid Java path or permission denied");
      }
    } catch (err: any) {
      setError("Failed to verify Java path");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold flex items-center gap-2 text-zinc-200">
          <HardDrive size={16} className="text-zinc-500" /> Java Runtime
        </h2>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="flex items-center gap-3 p-3 rounded-lg border border-zinc-800 bg-zinc-900/50 cursor-pointer hover:border-zinc-700 transition-colors transition-all active:scale-[0.99]">
            <input
              type="radio"
              name="java-mode"
              className="accent-primary w-4 h-4"
              checked={!settings.overrideJava}
              onChange={() => onOverrideToggle("overrideJava", false)}
            />
            <div className="flex-1">
              <div className="text-sm font-medium text-zinc-200">
                Recommended
              </div>
              <div className="text-xs text-zinc-500">
                Launcher will handle everything automatically
              </div>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 rounded-lg border border-zinc-800 bg-zinc-900/50 cursor-pointer hover:border-zinc-700 transition-colors transition-all active:scale-[0.99]">
            <input
              type="radio"
              name="java-mode"
              className="accent-primary w-4 h-4"
              checked={settings.overrideJava}
              onChange={() => onOverrideToggle("overrideJava", true)}
            />
            <div className="flex-1">
              <div className="text-sm font-medium text-zinc-200">Custom</div>
              <div className="text-xs text-zinc-500">
                If you need to install custom Java, this is for you
              </div>
            </div>
          </label>
        </div>

        {settings.overrideJava && (
          <div className="pl-1 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="grid gap-2">
              <label className="text-xs font-medium text-zinc-400 ml-1">
                Java Executable Path
              </label>
              <div className="flex gap-2">
                <Input
                  value={settings.javaPath}
                  onChange={(e) => onChange("javaPath", e.target.value)}
                  placeholder="/path/to/java/bin/java"
                  className="bg-zinc-900 border-zinc-800 font-mono text-xs"
                />
              </div>
            </div>

            <div className="min-h-[20px] ml-1">
              {verifying && (
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <Loader2 size={12} className="animate-spin" /> Verifying...
                </div>
              )}

              {!verifying && javaInfo && (
                <div className="flex items-center gap-2 text-xs text-green-400 bg-green-400/10 px-2 py-1.5 rounded border border-green-400/20 w-fit">
                  <CheckCircle2 size={12} />
                  <span>Detected: Java {javaInfo.version}</span>
                </div>
              )}

              {!verifying && error && (
                <div className="flex items-center gap-2 text-xs text-red-400 bg-red-400/10 px-2 py-1.5 rounded border border-red-400/20 w-fit">
                  <AlertCircle size={12} />
                  <span>{error}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
