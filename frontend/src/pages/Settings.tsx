import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useSettingStore } from "@/stores/settingStore";
import { JavaInfo } from "@/types";
import { ArrowLeft } from "lucide-react";
import { GeneralCard } from "@/components/settings/GeneralCard";
import { JavaCard } from "@/components/settings/JavaCard";
import { UpdaterAboutCard } from "@/components/settings/UpdaterAboutCard";

export function SettingsPage() {
  const navigate = useNavigate();
  const { scanJava } = useSettingStore();

  const [javaList, setJavaList] = useState<JavaInfo[]>([]);
  const [isScanning, setIsScanning] = useState(false);

  const [minRam, setMinRam] = useState(2048);
  const [maxRam, setMaxRam] = useState(4096);
  const [resW, setResW] = useState(854);
  const [resH, setResH] = useState(480);
  const [windowMode, setWindowMode] = useState("Windowed");
  const [jvmArgs, setJvmArgs] = useState("");
  const [selectedJavaPath, setSelectedJavaPath] = useState("");

  useEffect(() => {
    // Migration from old single RAM value
    const storedRam = localStorage.getItem("nezord_default_ram");
    if (storedRam) {
      const ram = parseInt(storedRam);
      setMaxRam(ram);
      setMinRam(Math.max(1024, ram / 2)); // Default min to half of max
    } else {
      // Check new keys
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
    if (storedMode) setWindowMode(storedMode);

    const storedArgs = localStorage.getItem("nezord_global_jvm_args");
    if (storedArgs) setJvmArgs(storedArgs);

    const storedJava = localStorage.getItem("nezord_java_path");
    if (storedJava) setSelectedJavaPath(storedJava);

    handleScanJava();
  }, []);

  useEffect(() => {
    localStorage.setItem("nezord_min_ram", minRam.toString());
    localStorage.setItem("nezord_max_ram", maxRam.toString());
    // Also update legacy key for compatibility if needed, or remove it.
    // Let's keep legacy key updated with maxRam to be safe for other parts of the app
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

    // Auto-select valid Java if none selected
    if (!selectedJavaPath || !list.some((j) => j.path === selectedJavaPath)) {
      // Prefer Java 17+ or just first
      const best = list.find((j) => j.major >= 17) || list[0];
      if (best) setSelectedJavaPath(best.path);
    }

    setIsScanning(false);
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
        <div className="lg:col-span-2">
          <UpdaterAboutCard />
        </div>
      </div>
    </div>
  );
}
