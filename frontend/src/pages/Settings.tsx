import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useSettingStore } from "@/stores/settingStore";
import { JavaInfo } from "@/types";
import { ArrowLeft, Gamepad2, Coffee, FolderOpen, Info } from "lucide-react";
import { GeneralTab } from "@/components/settings/GeneralTab";
import { JavaTab } from "@/components/settings/JavaTab";
import { DataTab } from "@/components/settings/DataTab";
import { AboutTab } from "@/components/settings/AboutTab";
import { cn } from "@/lib/utils";

const settingTabs = [
  {
    value: "general",
    label: "General",
    icon: Gamepad2,
  },
  {
    value: "java",
    label: "Java",
    icon: Coffee,
  },
  {
    value: "data",
    label: "Data",
    icon: FolderOpen,
  },
  {
    value: "about",
    label: "About",
    icon: Info,
  },
] as const;

export function SettingsPage() {
  const navigate = useNavigate();
  const {
    scanJava,
    loadLauncherSettings,
    updateLauncherSettings,
    launcherSettings,
  } = useSettingStore();

  const [javaList, setJavaList] = useState<JavaInfo[]>([]);
  const [isScanning, setIsScanning] = useState(false);

  const [minRam, setMinRam] = useState(2048);
  const [maxRam, setMaxRam] = useState(4096);
  const [resW, setResW] = useState(854);
  const [resH, setResH] = useState(480);
  const [windowMode, setWindowMode] = useState("Windowed");
  const [gpuPreference, setGpuPreference] = useState("auto");
  const [jvmArgs, setJvmArgs] = useState("");
  const [selectedJavaPath, setSelectedJavaPath] = useState("");
  const [wrapperCommand, setWrapperCommand] = useState("");
  const [dataPath, setDataPath] = useState("");
  const [isSavingPath, setIsSavingPath] = useState(false);
  const [isDefaultsLoaded, setIsDefaultsLoaded] = useState(false);

  useEffect(() => {
    handleScanJava();
    loadLauncherSettings().then((settings) => {
      if (settings?.dataPath !== undefined) {
        setDataPath(settings.dataPath || "");
      }
      const allowedModes = ["Windowed", "Fullscreen", "Borderless"];
      if (settings?.windowMode && allowedModes.includes(settings.windowMode)) {
        setWindowMode(settings.windowMode);
      }
      if (settings?.gpuPreference) {
        setGpuPreference(settings.gpuPreference);
      }
      const ramValue = settings?.defaultRamMB || 4096;
      setMaxRam(ramValue);
      const storedMin = localStorage.getItem("nezord_min_ram");
      if (storedMin) {
        const parsed = parseInt(storedMin);
        setMinRam(Number.isNaN(parsed) ? Math.max(1024, ramValue / 2) : parsed);
      } else {
        setMinRam(Math.max(1024, Math.floor(ramValue / 2)));
      }
      setResW(settings?.defaultResolutionW || 854);
      setResH(settings?.defaultResolutionH || 480);
      setJvmArgs(settings?.defaultJvmArgs || "");
      setWrapperCommand(settings?.wrapperCommand || "");
      setSelectedJavaPath(settings?.defaultJavaPath || "");
    });
    setIsDefaultsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isDefaultsLoaded) return;
    localStorage.setItem("nezord_min_ram", minRam.toString());
  }, [minRam, maxRam, isDefaultsLoaded]);

  useEffect(() => {
    if (!isDefaultsLoaded || !launcherSettings) return;
    const next = {
      language: launcherSettings.language || "en",
      theme: launcherSettings.theme || "dark",
      closeAction: launcherSettings.closeAction || "keep_open",
      dataPath: launcherSettings.dataPath || "",
      windowMode,
      defaultRamMB: maxRam,
      defaultResolutionW: resW,
      defaultResolutionH: resH,
      defaultJvmArgs: jvmArgs,
      defaultJavaPath: selectedJavaPath,
      autoUpdateEnabled: launcherSettings.autoUpdateEnabled,
      gpuPreference,
      wrapperCommand,
    };
    updateLauncherSettings(next);
  }, [
    isDefaultsLoaded,
    launcherSettings,
    updateLauncherSettings,
    windowMode,
    maxRam,
    resW,
    resH,
    jvmArgs,
    selectedJavaPath,
    gpuPreference,
    wrapperCommand,
  ]);

  const handleScanJava = async () => {
    setIsScanning(true);
    const list = await scanJava();
    setJavaList(list);

    if (!selectedJavaPath || !list.some((j) => j.path === selectedJavaPath)) {
      const best = list.find((j) => j.major >= 17) || list[0];
      if (best) setSelectedJavaPath(best.path);
    }

    setIsScanning(false);
  };

  const handleSaveDataPath = async () => {
    setIsSavingPath(true);
    const current = await loadLauncherSettings();
    const next = {
      language: current?.language || "en",
      theme: current?.theme || "dark",
      closeAction: current?.closeAction || "keep_open",
      dataPath: dataPath.trim(),
      windowMode: current?.windowMode || windowMode,
      defaultRamMB: current?.defaultRamMB || maxRam,
      defaultResolutionW: current?.defaultResolutionW || resW,
      defaultResolutionH: current?.defaultResolutionH || resH,
      defaultJvmArgs: current?.defaultJvmArgs || jvmArgs,
      defaultJavaPath: current?.defaultJavaPath || selectedJavaPath,
      autoUpdateEnabled: current?.autoUpdateEnabled ?? true,
      gpuPreference: current?.gpuPreference || gpuPreference,
      wrapperCommand: current?.wrapperCommand || wrapperCommand,
    };
    await updateLauncherSettings(next);
    setIsSavingPath(false);
  };

  return (
    <TooltipProvider>
      <div className="flex h-full w-full overflow-hidden bg-background text-foreground">
        <Tabs
          defaultValue="general"
          orientation="vertical"
          className="flex h-full w-full flex-col md:flex-row"
        >
          {/* Sidebar */}
          <aside className="w-full flex-shrink-0 border-b bg-muted/20 md:w-64 md:border-b-0 md:border-r">
            <div className="flex items-center gap-3 p-4 md:p-6">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/")}
                className="-ml-2 h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft size={18} />
              </Button>
              <h1 className="text-xl font-bold tracking-tight">Settings</h1>
            </div>

            <TabsList className="flex h-auto w-full flex-row gap-1 bg-transparent px-2 pb-2 md:flex-col md:px-3 md:pb-0">
              {settingTabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="justify-start gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                  >
                    <Icon size={16} />
                    <div className="flex flex-col items-start gap-0.5 text-left">
                      <span>{tab.label}</span>
                    </div>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </aside>

          {/* Content Area */}
          <main className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-3xl p-6 md:py-10">
              <TabsContent value="general" className="mt-0 outline-none">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold tracking-tight">General</h2>
                  <p className="text-muted-foreground">
                    Configure display and memory settings.
                  </p>
                </div>
                <GeneralTab
                  minRam={minRam}
                  setMinRam={setMinRam}
                  maxRam={maxRam}
                  setMaxRam={setMaxRam}
                  resW={resW}
                  setResW={setResW}
                  resH={resH}
                  setResH={setResH}
                  windowMode={windowMode}
                  setWindowMode={setWindowMode}
                  gpuPreference={gpuPreference}
                  setGpuPreference={setGpuPreference}
                />
              </TabsContent>

              <TabsContent value="java" className="mt-0 outline-none">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold tracking-tight">Java</h2>
                  <p className="text-muted-foreground">
                    Manage Java runtime versions and arguments.
                  </p>
                </div>
                <JavaTab
                  javaList={javaList}
                  isScanning={isScanning}
                  onScan={handleScanJava}
                  jvmArgs={jvmArgs}
                  setJvmArgs={setJvmArgs}
                  selectedPath={selectedJavaPath}
                  onSelect={setSelectedJavaPath}
                  wrapperCommand={wrapperCommand}
                  setWrapperCommand={setWrapperCommand}
                />
              </TabsContent>

              <TabsContent value="data" className="mt-0 outline-none">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold tracking-tight">Data</h2>
                  <p className="text-muted-foreground">
                    Manage storage locations and data paths.
                  </p>
                </div>
                <DataTab
                  dataPath={dataPath}
                  setDataPath={setDataPath}
                  onSave={handleSaveDataPath}
                  isSaving={isSavingPath}
                />
              </TabsContent>

              <TabsContent value="about" className="mt-0 outline-none">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold tracking-tight">About</h2>
                  <p className="text-muted-foreground">
                    Version information and updates.
                  </p>
                </div>
                <AboutTab />
              </TabsContent>
            </div>
          </main>
        </Tabs>
      </div>
    </TooltipProvider>
  );
}
