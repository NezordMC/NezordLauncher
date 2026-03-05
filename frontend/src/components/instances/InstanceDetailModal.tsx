import { useState, useEffect } from "react";
import {
  X,
  FolderOpen,
  Save,
  Loader2,
  Trash2,
  HardDrive,
  Monitor,
  Cpu,
  Wrench,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Instance, InstanceSettings } from "@/types";
import { useInstanceStore } from "@/stores/instanceStore";
import { useSettingStore } from "@/stores/settingStore";
import {
  OpenInstanceFolder,
  VerifyInstance,
  RepairInstance,
} from "../../wailsjs/go/main/App";
import { MemorySection } from "./MemorySection";
import { JavaSection } from "./JavaSection";
import { ResolutionSection } from "./ResolutionSection";
import { JvmArgsSection } from "./JvmArgsSection";
import { WrapperCommandSection } from "./WrapperCommandSection";
import { GpuSection } from "./GpuSection";
import { toast } from "sonner";

import vanillaLogo from "@/assets/images/vanilla.png";
import fabricLogo from "@/assets/images/fabric.png";
import quiltLogo from "@/assets/images/quilt.png";

const modloaderLogos: Record<string, string> = {
  vanilla: vanillaLogo,
  fabric: fabricLogo,
  quilt: quiltLogo,
};

interface InstanceDetailModalProps {
  instance: Instance | null;
  onClose: () => void;
}

export function InstanceDetailModal({
  instance,
  onClose,
}: InstanceDetailModalProps) {
  const { updateInstance, deleteInstance } = useInstanceStore();
  const { defaults } = useSettingStore();
  const [settings, setSettings] = useState<InstanceSettings | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (instance) {
      setSettings({
        ramMB: instance.settings.ramMB || defaults.ram,
        javaPath: instance.settings.javaPath || "",
        resolutionW: instance.settings.resolutionW || defaults.width,
        resolutionH: instance.settings.resolutionH || defaults.height,
        jvmArgs: instance.settings.jvmArgs || "",
        overrideJava: instance.settings.overrideJava || false,
        overrideRam: instance.settings.overrideRam || false,
        gpuPreference: instance.settings.gpuPreference || "auto",
        wrapperCommand: instance.settings.wrapperCommand || "",
      });
      setIsDirty(false);
    }
  }, [instance, defaults]);

  if (!instance || !settings) return null;

  const logo = modloaderLogos[instance.modloaderType] || modloaderLogos.vanilla;
  const javaModeText = settings.overrideJava ? "Custom Path" : "Recommended";
  const ramSourceText = settings.overrideRam ? "Instance Override" : "Global";

  const handleChange = (key: keyof InstanceSettings, value: any) => {
    setSettings((prev) => (prev ? { ...prev, [key]: value } : null));
    setIsDirty(true);
  };

  const handleOverrideToggle = (
    key: "overrideRam" | "overrideJava",
    checked: boolean,
  ) => {
    let newSettings = { ...settings, [key]: checked };
    if (key === "overrideRam" && !checked) {
      newSettings.ramMB = defaults.ram;
    }
    setSettings(newSettings);
    setIsDirty(true);
  };

  const handleSave = async () => {
    if (!settings) return;
    setIsSaving(true);
    try {
      await updateInstance(instance.id, settings);
      setIsDirty(false);
      toast.success("Settings saved successfully");
    } catch (e: any) {
      toast.error(`Failed to save: ${e}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenFolder = async () => {
    try {
      await OpenInstanceFolder(instance.id);
    } catch (e) {
      console.error(e);
    }
  };

  const handleVerify = async () => {
    try {
      toast.info("Verifying instance integrity...");
      const results = await VerifyInstance(instance.id);
      if (results && results.length > 0) {
        toast.error(
          `Verification failed: ${results.length} files missing or corrupt.`,
        );
      } else {
        toast.success("Verification passed: Instance is healthy.");
      }
    } catch (e: any) {
      toast.error(`Verification error: ${e}`);
    }
  };

  const handleRepair = async () => {
    try {
      toast.info("Starting repair...");
      await RepairInstance(instance.id);
      toast.success("Instance repaired successfully");
    } catch (e: any) {
      toast.error(`Repair failed: ${e}`);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteInstance(instance.id);
      toast.success("Instance deleted");
      onClose();
    } catch (e: any) {
      toast.error(`Failed to delete: ${e}`);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-6xl h-[85vh] max-h-[760px] min-h-[620px] bg-zinc-950 border border-zinc-800 rounded-3xl shadow-xl overflow-hidden isolate"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-full flex flex-col">
          <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/90">
            <div className="flex items-center gap-3">
              <img
                src={logo}
                alt={instance.modloaderType}
                className="w-10 h-10 rounded-lg border border-zinc-800"
              />
              <div>
                <h2 className="font-semibold text-white">{instance.name}</h2>
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <span>{instance.gameVersion}</span>
                  <span className="uppercase text-primary font-medium">
                    {instance.modloaderType}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-zinc-500 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 min-h-0">
            <aside className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-zinc-800 bg-zinc-900/30 min-h-0">
              <div className="h-full overflow-y-auto p-4 space-y-4 [contain:layout_paint]">
                <Card className="bg-zinc-900 border-zinc-800 gap-3 py-4">
                    <CardHeader className="px-4 pb-0">
                      <CardTitle className="text-sm text-zinc-100">
                        Command Center
                      </CardTitle>
                      <CardDescription className="text-xs text-zinc-500">
                        Quick status and actions
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="px-4 space-y-3 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-500">State</span>
                        <span
                          className={
                            isDirty
                              ? "text-amber-400 font-medium"
                              : "text-emerald-400 font-medium"
                          }
                        >
                          {isDirty ? "Unsaved Changes" : "Up to Date"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-500">RAM</span>
                        <span className="text-zinc-200">
                          {settings.ramMB} MB ({ramSourceText})
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-500">Java</span>
                        <span className="text-zinc-200">{javaModeText}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-500">Resolution</span>
                        <span className="text-zinc-200">
                          {settings.resolutionW}x{settings.resolutionH}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-500">GPU</span>
                        <span className="text-zinc-200 uppercase">
                          {settings.gpuPreference}
                        </span>
                      </div>
                    </CardContent>
                </Card>

                <Card className="bg-zinc-900 border-zinc-800 gap-3 py-4">
                    <CardHeader className="px-4 pb-0">
                      <CardTitle className="text-sm text-zinc-100">
                        Quick Actions
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 space-y-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleOpenFolder}
                        className="w-full justify-start gap-2 rounded-full border-zinc-800 bg-zinc-900 text-zinc-200 hover:bg-zinc-800"
                      >
                        <FolderOpen size={14} />
                        Open Folder
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleVerify}
                        className="w-full justify-start gap-2 rounded-full border-zinc-800 bg-zinc-900 text-zinc-200 hover:bg-zinc-800"
                      >
                        <ShieldCheck size={14} />
                        Verify Files
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRepair}
                        className="w-full justify-start gap-2 rounded-full border-zinc-800 bg-zinc-900 text-zinc-200 hover:bg-zinc-800"
                      >
                        <Wrench size={14} />
                        Repair Instance
                      </Button>
                      <Separator className="bg-zinc-800" />
                      {showDeleteConfirm ? (
                        <div className="space-y-2">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleDelete}
                            className="w-full gap-2 rounded-full"
                          >
                            <Trash2 size={14} />
                            Confirm Delete
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowDeleteConfirm(false)}
                            className="w-full rounded-full text-zinc-400 hover:text-white"
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowDeleteConfirm(true)}
                          className="w-full justify-start gap-2 rounded-full border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300"
                        >
                          <Trash2 size={14} />
                          Delete Instance
                        </Button>
                      )}
                  </CardContent>
                </Card>
              </div>
            </aside>

            <section className="lg:col-span-8 min-h-0 flex flex-col">
              <ScrollArea className="flex-1 min-h-0 overscroll-contain [contain:layout_paint]">
                <div className="p-4 space-y-4">
                  <Card className="bg-zinc-900 border-zinc-800 gap-3 py-4">
                    <CardHeader className="px-4 pb-0">
                      <CardTitle className="text-sm text-zinc-100 flex items-center gap-2">
                        Performance
                      </CardTitle>
                    </CardHeader>
                    <Separator className="bg-zinc-800" />
                    <CardContent className="px-4">
                      <MemorySection
                        settings={settings}
                        defaultRam={defaults.ram}
                        onOverrideToggle={handleOverrideToggle}
                        onChange={handleChange}
                      />
                    </CardContent>
                  </Card>

                  <Card className="bg-zinc-900 border-zinc-800 gap-3 py-4">
                    <CardHeader className="px-4 pb-0">
                      <CardTitle className="text-sm text-zinc-100 flex items-center gap-2">
                        Runtime
                      </CardTitle>
                    </CardHeader>
                    <Separator className="bg-zinc-800" />
                    <CardContent className="px-4">
                      <JavaSection
                        settings={settings}
                        onOverrideToggle={handleOverrideToggle}
                        onChange={handleChange}
                      />
                    </CardContent>
                  </Card>

                  <Card className="bg-zinc-900 border-zinc-800 gap-3 py-4">
                    <CardHeader className="px-4 pb-0">
                      <CardTitle className="text-sm text-zinc-100 flex items-center gap-2">
                        Display and GPU
                      </CardTitle>
                    </CardHeader>
                    <Separator className="bg-zinc-800" />
                    <CardContent className="px-4 space-y-6">
                      <ResolutionSection settings={settings} onChange={handleChange} />
                      <GpuSection settings={settings} onChange={handleChange} />
                    </CardContent>
                  </Card>

                  <Card className="bg-zinc-900 border-zinc-800 gap-3 py-4">
                    <CardHeader className="px-4 pb-0">
                      <CardTitle className="text-sm text-zinc-100">
                        Advanced
                      </CardTitle>
                    </CardHeader>
                    <Separator className="bg-zinc-800" />
                    <CardContent className="px-4 space-y-6">
                      <WrapperCommandSection
                        settings={settings}
                        onChange={handleChange}
                      />
                      <JvmArgsSection settings={settings} onChange={handleChange} />
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>

              <div className="p-4 border-t border-zinc-800 flex items-center justify-end gap-2 bg-zinc-950/90">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="rounded-full"
                >
                  Close
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={!isDirty || isSaving}
                  className="rounded-full bg-primary hover:bg-primary/90 gap-2"
                >
                  {isSaving ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Save size={14} />
                  )}
                  Save
                </Button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
