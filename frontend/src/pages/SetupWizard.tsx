import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLauncherContext } from "@/context/LauncherContext";
import { JavaInfo } from "@/hooks/useLauncher";
import {
  Check,
  ChevronRight,
  Loader2,
  User,
  Zap,
  Coffee,
  CheckCircle,
} from "lucide-react";
import { LoginModal } from "@/components/LoginModal";

export function SetupWizardPage() {
  const navigate = useNavigate();
  const { scanJava, accounts, addOfflineAccount, loginElyBy } =
    useLauncherContext();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [detectedJava, setDetectedJava] = useState<JavaInfo[]>([]);
  const [ramValue, setRamValue] = useState(4096);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [newOfflineName, setNewOfflineName] = useState("");
  const [isAddingOffline, setIsAddingOffline] = useState(false);

  useEffect(() => {
    if (step === 2 && detectedJava.length === 0) {
      setLoading(true);
      scanJava().then((res) => {
        setDetectedJava(res);
        setLoading(false);
      });
    }
  }, [step]);

  const handleNext = () => setStep((p) => p + 1);

  const handleFinish = () => {
    localStorage.setItem("setup_completed", "true");
    localStorage.setItem("nezord_default_ram", ramValue.toString());
    navigate("/");
  };

  const StepIndicator = () => (
    <div className="flex justify-center gap-2 mb-8">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className={`h-1 rounded-full transition-all duration-300 ${step === i ? "w-8 bg-white" : "w-2 bg-zinc-800"}`}
        />
      ))}
    </div>
  );

  const renderWelcome = () => (
    <div className="space-y-6 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Welcome
        </h1>
        <p className="text-zinc-500 text-sm">Let's configure your launcher.</p>
      </div>
      <Button
        onClick={handleNext}
        className="w-full bg-white text-black hover:bg-zinc-200 font-bold"
      >
        Start Setup
      </Button>
    </div>
  );

  const renderJava = () => (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="text-center space-y-1 mb-6">
        <Coffee className="mx-auto text-zinc-400 mb-2" size={24} />
        <h2 className="text-lg font-bold">Java Check</h2>
      </div>

      <div className="border border-zinc-800 rounded-md p-1 min-h-[100px] max-h-[200px] overflow-y-auto bg-zinc-900/50">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-24 text-zinc-500 gap-2">
            <Loader2 className="animate-spin" size={16} />
            <span className="text-xs">Scanning...</span>
          </div>
        ) : detectedJava.length === 0 ? (
          <div className="p-4 text-center text-red-400 text-xs">
            No Java detected. You can install it later.
          </div>
        ) : (
          detectedJava.map((j, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-3 border-b border-zinc-800/50 last:border-0"
            >
              <div className="font-mono text-xs font-bold text-zinc-400">
                v{j.major}
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="text-xs text-zinc-300 truncate font-mono">
                  {j.path}
                </div>
              </div>
              <Check size={14} className="text-emerald-500" />
            </div>
          ))
        )}
      </div>

      <Button
        onClick={handleNext}
        className="w-full bg-white text-black hover:bg-zinc-200 font-bold"
      >
        Continue
      </Button>
    </div>
  );

  const renderAccount = () => (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="text-center space-y-1 mb-6">
        <User className="mx-auto text-zinc-400 mb-2" size={24} />
        <h2 className="text-lg font-bold">Add Account</h2>
      </div>

      <div className="space-y-2">
        {accounts.length > 0 && (
          <div className="border border-zinc-800 rounded-md p-2 space-y-1 bg-zinc-900/50 mb-4">
            {accounts.map((acc) => (
              <div
                key={acc.uuid}
                className="flex items-center justify-between p-2 bg-zinc-800/30 rounded text-xs"
              >
                <span className="font-bold">{acc.username}</span>
                <span className="uppercase text-zinc-500">{acc.type}</span>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            className="h-12 border-zinc-800 hover:bg-zinc-900 gap-2"
            onClick={() => setIsLoginModalOpen(true)}
          >
            <span className="text-xs">Ely.by</span>
          </Button>
          <Button
            variant="outline"
            className="h-12 border-zinc-800 hover:bg-zinc-900 gap-2"
            onClick={() => setIsAddingOffline(true)}
          >
            <span className="text-xs">Offline</span>
          </Button>
        </div>

        {isAddingOffline && (
          <div className="flex gap-2 animate-in fade-in slide-in-from-top-1 pt-2">
            <Input
              autoFocus
              placeholder="Username"
              className="bg-zinc-900 border-zinc-800 h-9 text-xs"
              value={newOfflineName}
              onChange={(e) => setNewOfflineName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && newOfflineName) {
                  addOfflineAccount(newOfflineName);
                  setNewOfflineName("");
                  setIsAddingOffline(false);
                }
              }}
            />
            <Button
              size="icon"
              className="h-9 w-9 bg-white text-black hover:bg-zinc-200"
              onClick={() => {
                if (newOfflineName) {
                  addOfflineAccount(newOfflineName);
                  setNewOfflineName("");
                  setIsAddingOffline(false);
                }
              }}
            >
              <Check size={14} />
            </Button>
          </div>
        )}
      </div>

      <Button
        onClick={handleNext}
        disabled={accounts.length === 0}
        className="w-full bg-white text-black hover:bg-zinc-200 font-bold mt-4"
      >
        Continue
      </Button>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLogin={loginElyBy}
      />
    </div>
  );

  const renderRam = () => (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="text-center space-y-1 mb-6">
        <Zap className="mx-auto text-zinc-400 mb-2" size={24} />
        <h2 className="text-lg font-bold">Memory</h2>
      </div>

      <div className="p-6 border border-zinc-800 rounded-md bg-zinc-900/50 space-y-6">
        <div className="text-center">
          <span className="text-3xl font-bold">{ramValue}</span>
          <span className="text-zinc-500 text-xs ml-1">MB</span>
        </div>

        <input
          type="range"
          min="1024"
          max="16384"
          step="512"
          value={ramValue}
          onChange={(e) => setRamValue(parseInt(e.target.value))}
          className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white"
        />
      </div>

      <Button
        onClick={handleNext}
        className="w-full bg-white text-black hover:bg-zinc-200 font-bold"
      >
        Finish
      </Button>
    </div>
  );

  const renderFinish = () => (
    <div className="space-y-6 text-center animate-in zoom-in-95 duration-500">
      <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto text-emerald-500 mb-2">
        <CheckCircle size={32} />
      </div>
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-white">Ready</h1>
        <p className="text-zinc-500 text-xs">Setup complete.</p>
      </div>

      <Button
        onClick={handleFinish}
        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
      >
        Go to Dashboard
      </Button>
    </div>
  );

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-zinc-950 text-zinc-200 p-6 select-none">
      <div className="w-full max-w-sm">
        <StepIndicator />
        {step === 1 && renderWelcome()}
        {step === 2 && renderJava()}
        {step === 3 && renderAccount()}
        {step === 4 && renderRam()}
        {step === 5 && renderFinish()}
      </div>
    </div>
  );
}
