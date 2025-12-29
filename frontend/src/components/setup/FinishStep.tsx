import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

interface FinishStepProps {
  onFinish: () => void;
}

export function FinishStep({ onFinish }: FinishStepProps) {
  return (
    <div className="space-y-6 text-center animate-in zoom-in-95 duration-500">
      <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto text-emerald-500 mb-2">
        <CheckCircle size={32} />
      </div>
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-white">Ready</h1>
        <p className="text-zinc-500 text-xs">Setup complete.</p>
      </div>

      <Button
        onClick={onFinish}
        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
      >
        Go to Dashboard
      </Button>
    </div>
  );
}
