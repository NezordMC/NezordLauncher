import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSettingStore } from "@/stores/settingStore";
import { useAccountStore } from "@/stores/accountStore";
import { JavaInfo } from "@/types";
import { StepIndicator } from "@/components/setup/StepIndicator";
import { WelcomeStep } from "@/components/setup/WelcomeStep";
import { JavaStep } from "@/components/setup/JavaStep";
import { AccountStep } from "@/components/setup/AccountStep";
import { MemoryStep } from "@/components/setup/MemoryStep";
import { FinishStep } from "@/components/setup/FinishStep";

export function SetupWizardPage() {
  const navigate = useNavigate();
  const { scanJava } = useSettingStore();
  const { accounts, addOfflineAccount, loginElyBy } = useAccountStore();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [detectedJava, setDetectedJava] = useState<JavaInfo[]>([]);
  const [ramValue, setRamValue] = useState(4096);

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

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-zinc-950 text-zinc-200 p-6 select-none">
      <div className="w-full max-w-sm">
        <StepIndicator step={step} />
        {step === 1 && <WelcomeStep onNext={handleNext} />}
        {step === 2 && (
          <JavaStep
            loading={loading}
            detectedJava={detectedJava}
            onNext={handleNext}
          />
        )}
        {step === 3 && (
          <AccountStep
            accounts={accounts}
            addOfflineAccount={addOfflineAccount}
            loginElyBy={loginElyBy}
            onNext={handleNext}
          />
        )}
        {step === 4 && (
          <MemoryStep
            ramValue={ramValue}
            setRamValue={setRamValue}
            onNext={handleNext}
          />
        )}
        {step === 5 && <FinishStep onFinish={handleFinish} />}
      </div>
    </div>
  );
}
