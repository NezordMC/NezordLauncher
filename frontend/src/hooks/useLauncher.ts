import { useState, useEffect } from "react";
import {
  LaunchInstance,
  CreateInstance,
  GetInstances,
  GetAccounts,
  AddOfflineAccount,
  LoginElyBy,
  SetActiveAccount,
  GetActiveAccount,
  GetVanillaVersions,
  GetFabricLoaders,
  GetQuiltLoaders,
  ScanJavaInstallations,
  UpdateInstanceSettings,
  CancelDownload,
} from "../../wailsjs/go/main/App";
import { EventsOn } from "../../wailsjs/runtime/runtime";
import { ModloaderType } from "../components/ModloaderSelector";

export interface Account {
  uuid: string;
  username: string;
  type: string;
}

export interface Version {
  id: string;
  type: string;
}

export interface InstanceSettings {
  ramMB: number;
  javaPath: string;
  resolutionW: number;
  resolutionH: number;
  jvmArgs: string;
  overrideJava: boolean;
  overrideRam: boolean;
}

export interface Instance {
  id: string;
  name: string;
  gameVersion: string;
  modloaderType: string;
  modloaderVersion: string;
  created: string;
  lastPlayed: string;
  playTime: number;
  settings: InstanceSettings;
}

export interface JavaInfo {
  path: string;
  version: string;
  major: number;
}

export interface GlobalDefaults {
  ram: number;
  width: number;
  height: number;
  jvmArgs: string;
}

export function useLauncher() {
  const [isLaunching, setIsLaunching] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [activeAccount, setActiveAccountState] = useState<Account | null>(null);
  const [minecraftVersions, setMinecraftVersions] = useState<Version[]>([]);
  const [instances, setInstances] = useState<Instance[]>([]);

  const [defaults, setDefaults] = useState<GlobalDefaults>({
    ram: 4096,
    width: 854,
    height: 480,
    jvmArgs: "",
  });

  useEffect(() => {
    refreshAccounts();
    fetchVersions();
    refreshInstances();
    loadDefaults();

    const cleanups = [
      EventsOn("downloadStatus", (msg: string) =>
        setLogs((p) => [...p, `[DOWNLOAD] ${msg}`]),
      ),
      EventsOn("launchStatus", (msg: string) => {
        setLogs((p) => [...p, `[SYSTEM] ${msg}`]);
        if (msg.includes("Game closed")) setIsLaunching(false);
      }),
      EventsOn("gameLog", (msg: string) => setLogs((p) => [...p, msg])),
      EventsOn("launchError", (msg: string) => {
        setLogs((p) => [...p, `[ERROR] ${msg}`]);
        setIsLaunching(false);
      }),
    ];
    return () => cleanups.forEach((c) => c());
  }, []);

  const loadDefaults = () => {
    const ram = localStorage.getItem("nezord_default_ram");
    const w = localStorage.getItem("nezord_default_width");
    const h = localStorage.getItem("nezord_default_height");
    const args = localStorage.getItem("nezord_global_jvm_args");

    setDefaults({
      ram: ram ? parseInt(ram) : 4096,
      width: w ? parseInt(w) : 854,
      height: h ? parseInt(h) : 480,
      jvmArgs: args || "",
    });
  };

  const fetchVersions = async () => {
    try {
      const versions = await GetVanillaVersions();
      setMinecraftVersions(versions || []);
    } catch (e) {
      console.error("Failed to fetch versions", e);
    }
  };

  const refreshAccounts = async () => {
    try {
      const accs = await GetAccounts();
      setAccounts(accs || []);
      const active = await GetActiveAccount();
      setActiveAccountState(active);
    } catch (e) {
      console.error("Failed to load accounts", e);
    }
  };

  const refreshInstances = async () => {
    try {
      const list = await GetInstances();
      setInstances(list || []);
    } catch (e) {
      console.error("Failed to load instances", e);
    }
  };

  const createInstance = async (
    name: string,
    version: string,
    type: string,
    loaderVersion: string,
  ) => {
    try {
      await CreateInstance(name, version, type, loaderVersion);
      await refreshInstances();
    } catch (e) {
      throw e;
    }
  };

  const updateInstance = async (id: string, settings: InstanceSettings) => {
    try {
      await UpdateInstanceSettings(id, settings);
      await refreshInstances();
    } catch (e) {
      throw e;
    }
  };

  const fetchModloaders = async (
    mcVersion: string,
    type: ModloaderType,
  ): Promise<string[]> => {
    if (type === "vanilla") return [];
    try {
      if (type === "fabric") return await GetFabricLoaders(mcVersion);
      if (type === "quilt") return await GetQuiltLoaders(mcVersion);
    } catch (e) {
      console.error(`Failed to fetch ${type} loaders`, e);
    }
    return [];
  };

  const scanJava = async (): Promise<JavaInfo[]> => {
    try {
      return await ScanJavaInstallations();
    } catch (e) {
      console.error("Java scan failed", e);
      return [];
    }
  };

  const addOfflineAccount = async (username: string) => {
    try {
      await AddOfflineAccount(username);
      await refreshAccounts();
    } catch (e) {
      setLogs((p) => [...p, `[ERROR] Failed to add account: ${e}`]);
    }
  };

  const loginElyBy = async (u: string, p: string) => {
    try {
      await LoginElyBy(u, p);
      await refreshAccounts();
    } catch (e) {
      throw e;
    }
  };

  const switchAccount = async (uuid: string) => {
    try {
      await SetActiveAccount(uuid);
      await refreshAccounts();
    } catch (e) {
      console.error("Failed to switch account", e);
    }
  };

  const launchInstance = async (id: string) => {
    if (isLaunching) return;
    if (!activeAccount) {
      setLogs((p) => [...p, `[ERROR] No account selected!`]);
      return;
    }

    setIsLaunching(true);
    setLogs([]);

    try {
      setLogs((p) => [...p, `[COMMAND] Launching Instance ${id}...`]);
      await LaunchInstance(id);
    } catch (e: any) {
      if (e && e.includes && e.includes("cancelled")) {
        setLogs((p) => [...p, `[SYSTEM] Launch cancelled.`]);
      } else {
        setLogs((p) => [...p, `[FATAL] Sequence aborted: ${e}`]);
      }
      setIsLaunching(false);
    }
  };

  const stopLaunch = async () => {
    try {
      await CancelDownload();
    } catch (e) {
      console.error(e);
    }
  };

  return {
    isLaunching,
    logs,
    accounts,
    activeAccount,
    addOfflineAccount,
    loginElyBy,
    switchAccount,
    minecraftVersions,
    fetchModloaders,
    instances,
    defaults,
    scanJava,
    createInstance,
    updateInstance,
    refreshInstances,
    launchInstance,
    stopLaunch,
  };
}
