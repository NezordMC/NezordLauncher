import { useEffect, useState } from "react";
import { CheckForUpdates, GetAppVersion } from "../../wailsjs/go/main/App";
import { toast } from "sonner";
import { BrowserOpenURL } from "../../wailsjs/runtime/runtime";
import { useSettingStore } from "@/stores/settingStore";

export function useUpdater() {
  const [checked, setChecked] = useState(false);
  const { launcherSettings } = useSettingStore();

  useEffect(() => {
    if (checked) return;
    if (launcherSettings && launcherSettings.autoUpdateEnabled === false) {
      setChecked(true);
      return;
    }

    const check = async () => {
      try {
        const currentVersion = await GetAppVersion();
        const info = await CheckForUpdates(currentVersion);
        if (info && info.available) {
          toast.info(`Update Available: ${info.version}`, {
            description: "A new version is available for download.",
            action: {
              label: "Download",
              onClick: () => {
                BrowserOpenURL(info.url);
              },
            },
            duration: Infinity, // Keep it open until user dismisses or clicks
          });
        }
      } catch (err) {
        console.error("Failed to check for updates:", err);
      } finally {
        setChecked(true);
      }
    };

    check();
  }, [checked, launcherSettings]);
}
