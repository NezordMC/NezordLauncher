import { useEffect, useState } from "react";
import { CheckForUpdates } from "../../wailsjs/go/main/App";
import { toast } from "sonner";
import { BrowserOpenURL } from "../../wailsjs/runtime/runtime";

export function useUpdater() {
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (checked) return;

    const check = async () => {
      try {
        // @ts-ignore - binding might not be generated yet
        const info = await CheckForUpdates("0.1.0"); // TODO: Pass real current version or let backend handle it
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
  }, [checked]);
}
