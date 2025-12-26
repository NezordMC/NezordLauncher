import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useLauncherContext } from "@/context/LauncherContext";
import { InstanceSettings } from "@/hooks/useLauncher";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Save,
  Play,
  Monitor,
  Cpu,
  Terminal,
  Trash2,
  Loader2,
  HardDrive,
} from "lucide-react";

export function InstanceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { instances, updateInstance, launchInstance, isLaunching } =
    useLauncherContext();

  const instance = instances.find((i) => i.id === id);

  const [settings, setSettings] = useState<InstanceSettings | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (instance) {
      setSettings({
        ramMB: instance.settings.ramMB || 4096,
        javaPath: instance.settings.javaPath || "",
        resolutionW: instance.settings.resolutionW || 854,
        resolutionH: instance.settings.resolutionH || 480,
        jvmArgs: instance.settings.jvmArgs || "",
        overrideJava: instance.settings.overrideJava || false,
        overrideRam: instance.settings.overrideRam || false,
      });
      setIsDirty(false);
    }
  }, [instance]);

  const handleSave = async () => {
    if (!instance || !settings) return;
    setIsSaving(true);
    try {
      await updateInstance(instance.id, settings);
      setIsDirty(false);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (key: keyof InstanceSettings, value: any) => {
    if (!settings) return;
    setSettings((prev) => (prev ? { ...prev, [key]: value } : null));
    setIsDirty(true);
  };

  if (!instance || !settings) {
    return (
      <div className="p-8 text-center text-zinc-500">
        Instance not found or loading...
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col overflow-hidden animate-in fade-in slide-in-from-right-4">
      <div className="flex items-center gap-4 border-b border-zinc-800 pb-4 mb-4 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/")}
          className="hover:bg-zinc-800 text-zinc-400 hover:text-white"
        >
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h1 className="text-xl font-bold tracking-tight">{instance.name}</h1>
          <p className="text-xs text-zinc-500 font-mono flex gap-2">
            {instance.gameVersion} • {instance.modloaderType}
            <span className="text-zinc-700">|</span>
            Played: {Math.floor(instance.playTime / 60)}m
          </p>
        </div>
        <div className="ml-auto flex gap-2">
          <Button
            onClick={handleSave}
            disabled={!isDirty || isSaving}
            className={`font-bold text-xs gap-2 transition-all ${isDirty ? "bg-emerald-600 hover:bg-emerald-500" : "bg-zinc-800 text-zinc-500"}`}
          >
            {isSaving ? (
              <Loader2 className="animate-spin" size={14} />
            ) : (
              <Save size={14} />
            )}
            {isDirty ? "SAVE CHANGES" : "SAVED"}
          </Button>
          <Button
            onClick={() => launchInstance(instance.id)}
            disabled={isLaunching}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs gap-2 min-w-[120px]"
          >
            <Play size={14} fill="currentColor" />{" "}
            {isLaunching ? "LAUNCHING..." : "PLAY"}
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-8 pb-20">
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold flex items-center gap-2 text-zinc-200">
              <Cpu size={16} className="text-zinc-500" /> Memory Allocation
            </h2>
            <label className="text-xs flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={settings.overrideRam}
                onChange={(e) => handleChange("overrideRam", e.target.checked)}
                className="accent-emerald-500"
              />
              <span
                className={
                  settings.overrideRam ? "text-white" : "text-zinc-500"
                }
              >
                Override Global
              </span>
            </label>
          </div>

          <div
            className={`p-4 border border-zinc-800 rounded-lg bg-zinc-900/50 transition-opacity ${settings.overrideRam ? "opacity-100" : "opacity-50 pointer-events-none"}`}
          >
            <div className="flex justify-between mb-4">
              <span className="text-xs font-mono text-zinc-400">Total RAM</span>
              <span className="text-sm font-bold text-emerald-400">
                {settings.ramMB} MB
              </span>
            </div>
            <input
              type="range"
              min="1024"
              max="16384"
              step="512"
              value={settings.ramMB}
              onChange={(e) => handleChange("ramMB", parseInt(e.target.value))}
              className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-[10px] text-zinc-600 font-mono mt-2">
              <span>1 GB</span>
              <span>8 GB</span>
              <span>16 GB</span>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold flex items-center gap-2 text-zinc-200">
              <HardDrive size={16} className="text-zinc-500" /> Java Runtime
            </h2>
            <label className="text-xs flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={settings.overrideJava}
                onChange={(e) => handleChange("overrideJava", e.target.checked)}
                className="accent-emerald-500"
              />
              <span
                className={
                  settings.overrideJava ? "text-white" : "text-zinc-500"
                }
              >
                Override Global
              </span>
            </label>
          </div>

          <div
            className={`space-y-2 transition-opacity ${settings.overrideJava ? "opacity-100" : "opacity-50 pointer-events-none"}`}
          >
            <Input
              value={settings.javaPath}
              onChange={(e) => handleChange("javaPath", e.target.value)}
              placeholder="/path/to/java/bin/java"
              className="bg-zinc-900 border-zinc-800 font-mono text-xs"
            />
            <p className="text-[10px] text-zinc-500">
              Leave empty to use auto-detected Java.
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-bold flex items-center gap-2 text-zinc-200">
            <Monitor size={16} className="text-zinc-500" /> Resolution
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] text-zinc-500 uppercase">
                Width
              </label>
              <Input
                type="number"
                value={settings.resolutionW}
                onChange={(e) =>
                  handleChange("resolutionW", parseInt(e.target.value))
                }
                className="bg-zinc-900 border-zinc-800 font-mono text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-zinc-500 uppercase">
                Height
              </label>
              <Input
                type="number"
                value={settings.resolutionH}
                onChange={(e) =>
                  handleChange("resolutionH", parseInt(e.target.value))
                }
                className="bg-zinc-900 border-zinc-800 font-mono text-xs"
              />
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-bold flex items-center gap-2 text-zinc-200">
            <Terminal size={16} className="text-zinc-500" /> JVM Arguments
          </h2>
          <textarea
            value={settings.jvmArgs}
            onChange={(e) => handleChange("jvmArgs", e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-3 text-xs font-mono h-24 focus:outline-none focus:ring-1 focus:ring-emerald-600 text-zinc-300 resize-none"
            placeholder="-XX:+UseG1GC -Xmx4G ..."
          />
        </section>

        <section className="pt-8 border-t border-zinc-800">
          <Button
            variant="destructive"
            className="w-full bg-red-900/20 hover:bg-red-900/40 text-red-500 border border-red-900/50 font-bold text-xs"
          >
            <Trash2 size={14} className="mr-2" /> DELETE INSTANCE
          </Button>
        </section>
      </div>
    </div>
  );
}
