import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from "react";
import { ScanJavaInstallations } from "../../wailsjs/go/main/App";
import { GlobalDefaults, JavaInfo } from "../types";

function useSettingsLogic() {
  const [defaults, setDefaults] = useState<GlobalDefaults>({
    ram: 4096,
    width: 854,
    height: 480,
    jvmArgs: "",
  });

  useEffect(() => {
    loadDefaults();
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

  const scanJava = async (): Promise<JavaInfo[]> => {
    try {
      return await ScanJavaInstallations();
    } catch (e) {
      console.error("Java scan failed", e);
      return [];
    }
  };

  return {
    defaults,
    scanJava,
    loadDefaults,
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
