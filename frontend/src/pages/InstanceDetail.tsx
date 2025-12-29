import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useInstanceStore } from "@/stores/instanceStore";
import { useLaunchStore } from "@/stores/launchStore";
import { useSettingStore } from "@/stores/settingStore";
import { useAccountStore } from "@/stores/accountStore";
import { InstanceSettings } from "@/types";
import { InstanceHeader } from "@/components/instances/InstanceHeader";
import { InstanceSettingsForm } from "@/components/instances/InstanceSettingsForm";

export function InstanceDetailPage() {
  const { id } = useParams();
  const { instances, updateInstance } = useInstanceStore();
  const { launchInstance, isLaunching } = useLaunchStore();
  const { defaults } = useSettingStore();
  const { activeAccount } = useAccountStore();

  const instance = instances.find((i) => i.id === id);

  const [settings, setSettings] = useState<InstanceSettings | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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
      });
      setIsDirty(false);
    }
  }, [instance, defaults]);

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

  const handleOverrideToggle = (
    key: "overrideRam" | "overrideJava",
    checked: boolean,
  ) => {
    if (!settings) return;

    let newSettings = { ...settings, [key]: checked };

    if (key === "overrideRam" && !checked) {
      newSettings.ramMB = defaults.ram;
    }

    setSettings(newSettings);
    setIsDirty(true);
  };

  if (!instance || !settings) {
    return (
      <div className="p-8 text-center text-zinc-500">
        Loading instance data...
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col overflow-hidden animate-in fade-in slide-in-from-right-4">
      <InstanceHeader
        instance={instance}
        isDirty={isDirty}
        isSaving={isSaving}
        onSave={handleSave}
        isLaunching={isLaunching}
        onLaunch={launchInstance}
        activeAccount={activeAccount}
      />

      <InstanceSettingsForm
        settings={settings}
        defaultRam={defaults.ram}
        onOverrideToggle={handleOverrideToggle}
        onChange={handleChange}
        onDelete={() => {
        }}
      />
    </div>
  );
}
