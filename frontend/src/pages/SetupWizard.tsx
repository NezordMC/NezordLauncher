import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSettingStore } from "@/stores/settingStore";
import { useAccountStore } from "@/stores/accountStore";
import { JavaInfo } from "@/types";
import { StepIndicator } from "@/components/setup/StepIndicator";
import { WelcomeJavaStep } from "@/components/setup/WelcomeJavaStep";
import { AccountStep } from "@/components/setup/AccountStep";
import { MemoryFinishStep } from "@/components/setup/MemoryFinishStep";

export function SetupWizardPage() {
  const navigate = useNavigate();
  const { scanJava, loadLauncherSettings, updateLauncherSettings } =
    useSettingStore();
  const { accounts, addOfflineAccount, loginElyBy } = useAccountStore();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [detectedJava, setDetectedJava] = useState<JavaInfo[]>([]);
  const [selectedJava, setSelectedJava] = useState("");
  const [ramValue, setRamValue] = useState(4096);

  useEffect(() => {
    handleScanJava();
    const storedMax = localStorage.getItem("nezord_max_ram");
    const storedDefault = localStorage.getItem("nezord_default_ram");
    const initial = storedMax || storedDefault;
    if (initial) {
      const parsed = parseInt(initial);
      if (!Number.isNaN(parsed)) {
        setRamValue(parsed);
      }
    }
  }, []);

  const handleScanJava = async () => {
    setLoading(true);
    const res = await scanJava();
    setDetectedJava(res);
    setLoading(false);
  };

  const handleNext = () => setStep((p) => Math.min(p + 1, 3));
  const handleBack = () => setStep((p) => Math.max(p - 1, 1));

  const handleFinish = async () => {
    localStorage.setItem("setup_completed", "true");
    const minValue = Math.max(1024, Math.floor(ramValue / 2));
    localStorage.setItem("nezord_min_ram", minValue.toString());
    const current = await loadLauncherSettings();
    const next = {
      language: current?.language || "en",
      theme: current?.theme || "dark",
      closeAction: current?.closeAction || "keep_open",
      dataPath: current?.dataPath || "",
      windowMode: current?.windowMode || "Windowed",
      defaultRamMB: ramValue,
      defaultResolutionW: current?.defaultResolutionW || 854,
      defaultResolutionH: current?.defaultResolutionH || 480,
      defaultJvmArgs: current?.defaultJvmArgs || "",
      defaultJavaPath: selectedJava || current?.defaultJavaPath || "",
    };
    await updateLauncherSettings(next);
    navigate("/");
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-zinc-950 text-zinc-200 p-6 select-none">
      <div className="w-full max-w-md">
        <StepIndicator step={step} />

        {step === 1 && (
          <WelcomeJavaStep
            loading={loading}
            detectedJava={detectedJava}
            selectedJava={selectedJava}
            onSelectJava={setSelectedJava}
            onScan={handleScanJava}
            onNext={handleNext}
          />
        )}

        {step === 2 && (
          <AccountStep
            accounts={accounts}
            addOfflineAccount={addOfflineAccount}
            loginElyBy={loginElyBy}
            onNext={handleNext}
            onBack={handleBack}
          />
        )}

        {step === 3 && (
          <MemoryFinishStep
            ramValue={ramValue}
            setRamValue={setRamValue}
            onBack={handleBack}
            onFinish={handleFinish}
          />
        )}
      </div>
    </div>
  );
}
