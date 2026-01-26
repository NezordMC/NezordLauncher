import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useSettingStore } from "@/stores/settingStore";
import { JavaInfo } from "@/types";
import { ArrowLeft } from "lucide-react";
import { GeneralCard } from "@/components/settings/GeneralCard";
import { JavaCard } from "@/components/settings/JavaCard";
import { UpdaterAboutCard } from "@/components/settings/UpdaterAboutCard";

export function SettingsPage() {
  const navigate = useNavigate();
  const { scanJava, loadLauncherSettings, updateLauncherSettings } =
    useSettingStore();

  const [javaList, setJavaList] = useState<JavaInfo[]>([]);
  const [isScanning, setIsScanning] = useState(false);

  const [minRam, setMinRam] = useState(2048);
  const [maxRam, setMaxRam] = useState(4096);
  const [resW, setResW] = useState(854);
  const [resH, setResH] = useState(480);
  const [windowMode, setWindowMode] = useState("Windowed");
  const [jvmArgs, setJvmArgs] = useState("");
  const [selectedJavaPath, setSelectedJavaPath] = useState("");
  const [dataPath, setDataPath] = useState("");
  const [isSavingPath, setIsSavingPath] = useState(false);

  useEffect(() => {
    const storedRam = localStorage.getItem("nezord_default_ram");
    if (storedRam) {
      const ram = parseInt(storedRam);
      setMaxRam(ram);
      setMinRam(Math.max(1024, ram / 2));
    } else {
      const storedMin = localStorage.getItem("nezord_min_ram");
      const storedMax = localStorage.getItem("nezord_max_ram");
      if (storedMin) setMinRam(parseInt(storedMin));
      if (storedMax) setMaxRam(parseInt(storedMax));
    }

    const storedW = localStorage.getItem("nezord_default_width");
    if (storedW) setResW(parseInt(storedW));

    const storedH = localStorage.getItem("nezord_default_height");
    if (storedH) setResH(parseInt(storedH));

    const storedMode = localStorage.getItem("nezord_window_mode");
    const allowedModes = ["Windowed", "Fullscreen", "Borderless"];
    if (storedMode && allowedModes.includes(storedMode)) {
      setWindowMode(storedMode);
    }

    const storedArgs = localStorage.getItem("nezord_global_jvm_args");
    if (storedArgs) setJvmArgs(storedArgs);

    const storedJava = localStorage.getItem("nezord_java_path");
    if (storedJava) setSelectedJavaPath(storedJava);

    handleScanJava();
    loadLauncherSettings().then((settings) => {
      if (settings?.dataPath !== undefined) {
        setDataPath(settings.dataPath || "");
      }
    });
  }, []);

  useEffect(() => {
    localStorage.setItem("nezord_min_ram", minRam.toString());
    localStorage.setItem("nezord_max_ram", maxRam.toString());
    localStorage.setItem("nezord_default_ram", maxRam.toString());
  }, [minRam, maxRam]);

  useEffect(() => {
    localStorage.setItem("nezord_default_width", resW.toString());
    localStorage.setItem("nezord_default_height", resH.toString());
  }, [resW, resH]);

  useEffect(() => {
    localStorage.setItem("nezord_window_mode", windowMode);
  }, [windowMode]);

  useEffect(() => {
    localStorage.setItem("nezord_global_jvm_args", jvmArgs);
  }, [jvmArgs]);

  useEffect(() => {
    localStorage.setItem("nezord_java_path", selectedJavaPath);
  }, [selectedJavaPath]);

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
    };
    await updateLauncherSettings(next);
    setIsSavingPath(false);
  };

  return (
    <div className="h-full flex flex-col p-6 overflow-y-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/")}
          className="hover:bg-zinc-800 text-zinc-400 hover:text-white"
        >
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto w-full pb-20">
        <GeneralCard
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
        />
        <JavaCard
          javaList={javaList}
          isScanning={isScanning}
          onScan={handleScanJava}
          jvmArgs={jvmArgs}
          setJvmArgs={setJvmArgs}
          selectedPath={selectedJavaPath}
          onSelect={setSelectedJavaPath}
        />
        <Card className="border-zinc-800 bg-zinc-900">
          <CardHeader>
            <CardTitle className="text-xl">Data Path</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              value={dataPath}
              onChange={(e) => setDataPath(e.target.value)}
              placeholder="/home/user/.local/share/NezordLauncher"
              className="font-mono bg-zinc-950/50"
            />
            <div className="text-xs text-zinc-500">
              Restart required to apply the new data path
            </div>
            <Button
              variant="outline"
              onClick={handleSaveDataPath}
              disabled={isSavingPath}
            >
              {isSavingPath ? "Saving..." : "Save Data Path"}
            </Button>
          </CardContent>
        </Card>
        <div className="lg:col-span-2">
          <UpdaterAboutCard />
        </div>
      </div>
    </div>
  );
}
