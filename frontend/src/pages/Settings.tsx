import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useSettingStore } from "@/stores/settingStore";
import { JavaInfo } from "@/types";
import { ArrowLeft } from "lucide-react";
import { GeneralSettings } from "@/components/settings/GeneralSettings";
import { JavaManager } from "@/components/settings/JavaManager";
import { AboutSettings } from "@/components/settings/AboutSettings";

export function SettingsPage() {
  const navigate = useNavigate();
  const { scanJava } = useSettingStore();

  const [javaList, setJavaList] = useState<JavaInfo[]>([]);
  const [isScanning, setIsScanning] = useState(false);

  const [defaultRam, setDefaultRam] = useState(4096);
  const [resW, setResW] = useState(854);
  const [resH, setResH] = useState(480);
  const [jvmArgs, setJvmArgs] = useState("");

  useEffect(() => {
    const storedRam = localStorage.getItem("nezord_default_ram");
    if (storedRam) setDefaultRam(parseInt(storedRam));

    const storedW = localStorage.getItem("nezord_default_width");
    if (storedW) setResW(parseInt(storedW));

    const storedH = localStorage.getItem("nezord_default_height");
    if (storedH) setResH(parseInt(storedH));

    const storedArgs = localStorage.getItem("nezord_global_jvm_args");
    if (storedArgs) setJvmArgs(storedArgs);

    handleScanJava();
  }, []);

  useEffect(() => {
    localStorage.setItem("nezord_default_ram", defaultRam.toString());
  }, [defaultRam]);

  useEffect(() => {
    localStorage.setItem("nezord_default_width", resW.toString());
    localStorage.setItem("nezord_default_height", resH.toString());
  }, [resW, resH]);

  useEffect(() => {
    localStorage.setItem("nezord_global_jvm_args", jvmArgs);
  }, [jvmArgs]);

  const handleScanJava = async () => {
    setIsScanning(true);
    const list = await scanJava();
    setJavaList(list);
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

      <div className="space-y-8 max-w-4xl mx-auto w-full pb-20">
        <GeneralSettings
          defaultRam={defaultRam}
          setDefaultRam={setDefaultRam}
          resW={resW}
          setResW={setResW}
          resH={resH}
          setResH={setResH}
          jvmArgs={jvmArgs}
          setJvmArgs={setJvmArgs}
        />
        <JavaManager
          javaList={javaList}
          isScanning={isScanning}
          onScan={handleScanJava}
        />
        <AboutSettings />
      </div>
    </div>
  );
}
