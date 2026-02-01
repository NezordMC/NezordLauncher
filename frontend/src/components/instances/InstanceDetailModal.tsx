import { useState, useEffect } from "react";
import { X, FolderOpen, Save, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Instance, InstanceSettings } from "@/types";
import { useInstanceStore } from "@/stores/instanceStore";
import { useSettingStore } from "@/stores/settingStore";
import { OpenInstanceFolder } from "../../../wailsjs/go/main/App";
import { MemorySection } from "./MemorySection";
import { JavaSection } from "./JavaSection";
import { ResolutionSection } from "./ResolutionSection";
import { JvmArgsSection } from "./JvmArgsSection";
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
      });
      setIsDirty(false);
    }
  }, [instance, defaults]);

  if (!instance || !settings) return null;

  const logo = modloaderLogos[instance.modloaderType] || modloaderLogos.vanilla;

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={logo}
              alt={instance.modloaderType}
              className="w-10 h-10 rounded-lg"
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

        <div className="p-4 max-h-[60vh] overflow-y-auto space-y-6">
          <MemorySection
            settings={settings}
            defaultRam={defaults.ram}
            onOverrideToggle={handleOverrideToggle}
            onChange={handleChange}
          />
          <JavaSection
            settings={settings}
            onOverrideToggle={handleOverrideToggle}
            onChange={handleChange}
          />
          <ResolutionSection settings={settings} onChange={handleChange} />
          <JvmArgsSection settings={settings} onChange={handleChange} />
        </div>

        <div className="p-4 border-t border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleOpenFolder}
              className="gap-2 text-zinc-400 hover:text-white"
            >
              <FolderOpen size={16} />
              Open Folder
            </Button>

            {showDeleteConfirm ? (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                className="gap-2 bg-red-600 hover:bg-red-700 text-white animate-in zoom-in-95 duration-200"
              >
                <Trash2 size={16} />
                Confirm?
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
                className="gap-2 text-zinc-400 hover:text-red-400 hover:bg-red-500/10"
              >
                <Trash2 size={16} />
              </Button>
            )}
            {showDeleteConfirm && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteConfirm(false)}
                className="text-zinc-500 hover:text-white"
              >
                Cancel
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Close
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={!isDirty || isSaving}
              className="bg-primary hover:bg-primary/90 gap-2"
            >
              {isSaving ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Save size={14} />
              )}
              Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
