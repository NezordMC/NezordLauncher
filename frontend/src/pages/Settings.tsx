import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLauncherContext } from "@/context/LauncherContext";
import { JavaInfo } from "@/hooks/useLauncher";
import {
  ArrowLeft,
  Monitor,
  Cpu,
  HardDrive,
  RotateCw,
  CheckCircle,
  Terminal,
  Info,
} from "lucide-react";

type Tab = "general" | "java" | "about";

export function SettingsPage() {
  const navigate = useNavigate();
  const { scanJava } = useLauncherContext();

  const [activeTab, setActiveTab] = useState<Tab>("general");
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

  const renderSidebar = () => (
    <div className="w-48 border-r border-zinc-800 pr-4 space-y-2 flex flex-col">
      <Button
        variant="ghost"
        className={`w-full justify-start gap-2 ${activeTab === "general" ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-white"}`}
        onClick={() => setActiveTab("general")}
      >
        <Monitor size={16} /> General
      </Button>
      <Button
        variant="ghost"
        className={`w-full justify-start gap-2 ${activeTab === "java" ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-white"}`}
        onClick={() => setActiveTab("java")}
      >
        <HardDrive size={16} /> Java Manager
      </Button>
      <Button
        variant="ghost"
        className={`w-full justify-start gap-2 ${activeTab === "about" ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-white"}`}
        onClick={() => setActiveTab("about")}
      >
        <Info size={16} /> About
      </Button>
    </div>
  );

  const renderGeneral = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
      {/* RAM */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Cpu className="text-zinc-500" size={20} /> Default Memory
        </h2>
        <div className="p-4 border border-zinc-800 rounded-lg bg-zinc-900/50">
          <div className="flex justify-between mb-4">
            <span className="text-xs font-mono text-zinc-400">
              Allocated RAM
            </span>
            <span className="text-sm font-bold text-emerald-400">
              {defaultRam} MB
            </span>
          </div>
          <input
            type="range"
            min="1024"
            max="16384"
            step="512"
            value={defaultRam}
            onChange={(e) => setDefaultRam(parseInt(e.target.value))}
            className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
          <p className="text-[10px] text-zinc-500 mt-2">
            This value will be applied to all new instances by default.
          </p>
        </div>
      </section>

      {/* Resolution */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Monitor className="text-zinc-500" size={20} /> Default Resolution
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] text-zinc-500 uppercase">Width</label>
            <Input
              type="number"
              value={resW}
              onChange={(e) => setResW(parseInt(e.target.value))}
              className="bg-zinc-900 border-zinc-800 font-mono text-xs"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-zinc-500 uppercase">
              Height
            </label>
            <Input
              type="number"
              value={resH}
              onChange={(e) => setResH(parseInt(e.target.value))}
              className="bg-zinc-900 border-zinc-800 font-mono text-xs"
            />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Terminal className="text-zinc-500" size={20} /> Global JVM Arguments
        </h2>
        <textarea
          value={jvmArgs}
          onChange={(e) => setJvmArgs(e.target.value)}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-3 text-xs font-mono h-24 focus:outline-none focus:ring-1 focus:ring-emerald-600 text-zinc-300 resize-none"
          placeholder="-XX:+UseG1GC -Dsun.rmi.dgc.server.gcInterval=2147483646 ..."
        />
      </section>
    </div>
  );

  const renderJavaManager = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">Java Runtimes</h2>
          <p className="text-xs text-zinc-500">
            Detected JDK installations on your system.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleScanJava}
          disabled={isScanning}
          className="gap-2 border-zinc-700 hover:bg-zinc-800"
        >
          <RotateCw size={14} className={isScanning ? "animate-spin" : ""} />{" "}
          Rescan
        </Button>
      </div>

      <div className="space-y-2">
        {javaList.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-zinc-800 rounded-lg text-zinc-500">
            {isScanning ? "Scanning..." : "No Java installations found."}
          </div>
        ) : (
          javaList.map((java, idx) => (
            <div
              key={idx}
              className="p-3 border border-zinc-800 bg-zinc-900/30 rounded-lg flex items-center justify-between group hover:border-zinc-700 transition-colors"
            >
              <div className="overflow-hidden mr-4">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-zinc-200">
                    Java {java.version}
                  </span>
                  <span className="text-[10px] bg-zinc-800 px-1.5 rounded text-zinc-400 font-mono">
                    v{java.major}
                  </span>
                </div>
                <div
                  className="text-[10px] text-zinc-500 truncate font-mono mt-0.5"
                  title={java.path}
                >
                  {java.path}
                </div>
              </div>
              <CheckCircle
                size={16}
                className="text-emerald-500 opacity-50 group-hover:opacity-100"
              />
            </div>
          ))
        )}
      </div>

      <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <p className="text-xs text-blue-300 flex gap-2">
          <Info size={14} className="shrink-0 mt-0.5" />
          Nezord Launcher automatically selects the best Java version for each
          Minecraft version. You can override this per-instance.
        </p>
      </div>
    </div>
  );

  const renderAbout = () => (
    <div className="space-y-6 text-center pt-10 animate-in fade-in zoom-in-95 duration-300">
      <h1 className="text-4xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-emerald-400 to-cyan-500">
        NEZORD
      </h1>
      <p className="text-zinc-500 font-mono text-xs">v1.3.0-beta</p>
      <div className="max-w-md mx-auto text-sm text-zinc-400 space-y-4">
        <p>
          Built with <span className="text-white font-bold">Wails</span>,{" "}
          <span className="text-white font-bold">React</span>, and{" "}
          <span className="text-white font-bold">Golang</span>.
        </p>
        <p className="text-xs text-zinc-600">
          Designed for performance and simplicity.
        </p>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-4 border-b border-zinc-800 pb-4 mb-6 shrink-0">
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

      <div className="flex-1 flex overflow-hidden">
        {renderSidebar()}
        <div className="flex-1 pl-6 overflow-y-auto pr-2 pb-20">
          {activeTab === "general" && renderGeneral()}
          {activeTab === "java" && renderJavaManager()}
          {activeTab === "about" && renderAbout()}
        </div>
      </div>
    </div>
  );
}
