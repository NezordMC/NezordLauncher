import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from "react";
import {
  CreateInstance,
  GetInstances,
  GetVanillaVersions,
  GetFabricLoaders,
  GetQuiltLoaders,
  UpdateInstanceSettings,
  DeleteInstance,
} from "../../wailsjs/go/main/App";
import { EventsOn } from "../../wailsjs/runtime/runtime";
import { Instance, Version, InstanceSettings, EventPayload } from "../types";
import { ModloaderType } from "../components/instances/ModloaderSelector";

function useInstanceLogic() {
  const [minecraftVersions, setMinecraftVersions] = useState<Version[]>([]);
  const [instances, setInstances] = useState<Instance[]>([]);

  useEffect(() => {
    fetchVersions();
    refreshInstances();

    const cleanup = EventsOn("instance.updated", (payload: EventPayload) => {
      const meta = payload?.meta as Instance | undefined;
      if (!meta) return;
      setInstances((prev) =>
        prev.map((inst) => (inst.id === meta.id ? meta : inst)),
      );
    });

    return () => cleanup();
  }, []);

  const fetchVersions = async () => {
    try {
      const versions = await GetVanillaVersions();
      setMinecraftVersions(versions || []);
    } catch (e) {
      console.error("Failed to fetch versions", e);
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

  const deleteInstance = async (id: string) => {
    try {
      await DeleteInstance(id);
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
      if (type === "fabric") {
        const res = await GetFabricLoaders(mcVersion);
        return res || [];
      }
      if (type === "quilt") {
        const res = await GetQuiltLoaders(mcVersion);
        return res || [];
      }
    } catch (e) {
      console.error(`Failed to fetch ${type} loaders`, e);
    }
    return [];
  };

  return {
    minecraftVersions,
    instances,
    createInstance,
    updateInstance,
    deleteInstance,
    refreshInstances,
    fetchModloaders,
  };
}

const InstanceContext = createContext<ReturnType<
  typeof useInstanceLogic
> | null>(null);

export function InstanceProvider({ children }: { children: ReactNode }) {
  const store = useInstanceLogic();
  return (
    <InstanceContext.Provider value={store}>
      {children}
    </InstanceContext.Provider>
  );
}

export function useInstanceStore() {
  const context = useContext(InstanceContext);
  if (!context) {
    throw new Error("useInstanceStore must be used within an InstanceProvider");
  }
  return context;
}
