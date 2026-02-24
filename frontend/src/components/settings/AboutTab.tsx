import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RefreshCw, Github, Globe, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { CheckForUpdates, GetAppVersion } from "../../wailsjs/go/main/App";
import { useSettingStore } from "@/stores/settingStore";

interface UpdateInfo {
  available: boolean;
  version: string;
  url: string;
  description: string;
}

export function AboutTab() {
  const { launcherSettings, updateLauncherSettings, loadLauncherSettings } =
    useSettingStore();
  const [autoUpdate, setAutoUpdate] = useState(true);
  const [checking, setChecking] = useState(false);
  const [lastCheck, setLastCheck] = useState<UpdateInfo | null>(null);
  const [error, setError] = useState("");
  const [currentVersion, setCurrentVersion] = useState("0.0.0");

  useEffect(() => {
    if (launcherSettings) {
      setAutoUpdate(launcherSettings.autoUpdateEnabled);
    }
  }, [launcherSettings]);

  useEffect(() => {
    const loadVersion = async () => {
      try {
        const version = await GetAppVersion();
        if (version) setCurrentVersion(version);
      } catch {
        // keep fallback
      }
    };
    loadVersion();
  }, []);

  const handleCheckUpdate = async () => {
    setChecking(true);
    setError("");
    try {
      const res = await CheckForUpdates(currentVersion);
      setLastCheck({
        available: res.available,
        version: res.version,
        url: res.url,
        description: res.description,
      });
    } catch (e: any) {
      setError(typeof e === "string" ? e : "Update check failed");
    } finally {
      setChecking(false);
    }
  };

  const handleToggleAutoUpdate = async () => {
    const nextValue = !autoUpdate;
    setAutoUpdate(nextValue);
    const current = launcherSettings || (await loadLauncherSettings());
    if (!current) return;
    await updateLauncherSettings({
      ...current,
      autoUpdateEnabled: nextValue,
      gpuPreference: current.gpuPreference,
      wrapperCommand: current.wrapperCommand,
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-6">
            <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-muted p-2">
              <img
                src="/appicon.png"
                alt="Icon"
                className="h-full w-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl font-bold tracking-tight">
                Nezord Launcher
              </h3>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="font-mono">
                  v{currentVersion}
                </Badge>
              </div>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <a
              href="https://github.com/NezordMC/NezordLauncher"
              target="_blank"
              rel="noreferrer"
            >
              <Button variant="outline" className="gap-2">
                <Github size={16} />
                GitHub
              </Button>
            </a>
            <Button variant="outline" className="gap-2" disabled>
              <Globe size={16} />
              Website
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Updates</CardTitle>
          <CardDescription>Manage application updates.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Automatic Updates</Label>
              <p className="text-sm text-muted-foreground">
                Automatically download and install updates when available.
              </p>
            </div>
            <Switch
              checked={autoUpdate}
              onCheckedChange={handleToggleAutoUpdate}
            />
          </div>

          <div className="bg-muted/30 rounded-lg border p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Update Status</span>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleCheckUpdate}
                disabled={checking}
                className="h-8 text-xs"
              >
                <RefreshCw
                  size={12}
                  className={cn("mr-2", checking && "animate-spin")}
                />
                Check Now
              </Button>
            </div>

            <div className="text-sm text-muted-foreground">
              {error ? (
                <span className="text-red-500">{error}</span>
              ) : lastCheck ? (
                lastCheck.available ? (
                  <div className="flex flex-col gap-1">
                    <span className="text-green-500 font-medium">
                      New version available: {lastCheck.version}
                    </span>
                    <a
                      href={lastCheck.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary underline"
                    >
                      Download Update
                    </a>
                  </div>
                ) : (
                  <span className="text-green-500">
                    Your launcher is up to date.
                  </span>
                )
              ) : (
                "Last checked: Never"
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
