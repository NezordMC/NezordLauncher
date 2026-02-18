import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from "react";
import {
  GetSettings,
  ScanJavaInstallations,
  UpdateGlobalSettings,
} from "../../wailsjs/go/main/App";
import { GlobalDefaults, JavaInfo, LauncherSettings } from "../types";

function useSettingsLogic() {
  const [defaults, setDefaults] = useState<GlobalDefaults>({
    ram: 4096,
    width: 854,
    height: 480,
    jvmArgs: "",
    javaPath: "",
  });
  const [launcherSettings, setLauncherSettings] =
    useState<LauncherSettings | null>(null);

  useEffect(() => {
    loadLauncherSettings();
  }, []);

  const normalizeSettings = (settings: LauncherSettings | null) => {
    const defaultRamMB =
      settings?.defaultRamMB && settings.defaultRamMB > 0
        ? settings.defaultRamMB
        : 4096;
    const defaultResolutionW =
      settings?.defaultResolutionW && settings.defaultResolutionW > 0
        ? settings.defaultResolutionW
        : 854;
    const defaultResolutionH =
      settings?.defaultResolutionH && settings.defaultResolutionH > 0
        ? settings.defaultResolutionH
        : 480;
    const defaultJvmArgs = settings?.defaultJvmArgs || "";
    const defaultJavaPath = settings?.defaultJavaPath || "";

    return {
      language: settings?.language || "en",
      theme: settings?.theme || "dark",
      closeAction: settings?.closeAction || "keep_open",
      dataPath: settings?.dataPath || "",
      windowMode: settings?.windowMode || "Windowed",
      defaultRamMB,
      defaultResolutionW,
      defaultResolutionH,
      defaultJvmArgs,
      defaultJavaPath,
      autoUpdateEnabled: settings?.autoUpdateEnabled === false ? false : true,
      gpuPreference: settings?.gpuPreference || "auto",
      wrapperCommand: settings?.wrapperCommand || "",
    };
  };

  const scanJava = async (): Promise<JavaInfo[]> => {
    try {
      const res = await ScanJavaInstallations();
      return res || [];
    } catch (e) {
      console.error("Java scan failed", e);
      return [];
    }
  };

  const loadLauncherSettings = async () => {
    try {
      const settings = (await GetSettings()) as LauncherSettings;
      const normalized = normalizeSettings(settings); // settings is safe to be null/undefined in normalizeSettings
      setLauncherSettings(normalized);
      setDefaults({
        ram: normalized.defaultRamMB,
        width: normalized.defaultResolutionW,
        height: normalized.defaultResolutionH,
        jvmArgs: normalized.defaultJvmArgs,
        javaPath: normalized.defaultJavaPath,
      });
      if (JSON.stringify(settings) !== JSON.stringify(normalized)) {
        await UpdateGlobalSettings(normalized);
      }
      return normalized;
    } catch (e) {
      console.error("Settings load failed", e);
      return null;
    }
  };

  const updateLauncherSettings = async (settings: LauncherSettings) => {
    try {
      const normalized = normalizeSettings(settings);
      await UpdateGlobalSettings(normalized);
      setLauncherSettings(normalized);
      setDefaults({
        ram: normalized.defaultRamMB,
        width: normalized.defaultResolutionW,
        height: normalized.defaultResolutionH,
        jvmArgs: normalized.defaultJvmArgs,
        javaPath: normalized.defaultJavaPath,
      });
      return true;
    } catch (e) {
      console.error("Settings update failed", e);
      return false;
    }
  };

  return {
    defaults,
    scanJava,
    launcherSettings,
    loadLauncherSettings,
    updateLauncherSettings,
  };
}

const SettingsContext = createContext<ReturnType<
  typeof useSettingsLogic
> | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const store = useSettingsLogic();
  return (
    <SettingsContext.Provider value={store}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettingStore() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettingStore must be used within a SettingsProvider");
  }
  return context;
}
