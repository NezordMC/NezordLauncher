import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

interface FinishStepProps {
  onFinish: () => void;
}

export function FinishStep({ onFinish }: FinishStepProps) {
  return (
    <div className="space-y-6 text-center animate-in zoom-in-95 duration-500">
      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary mb-2">
        <CheckCircle size={32} />
      </div>
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-white">Ready</h1>
        <p className="text-zinc-500 text-xs">Setup complete.</p>
      </div>

      <Button
        onClick={onFinish}
        className="w-full bg-primary hover:bg-primary/90 text-white font-bold"
      >
        Go to Dashboard
      </Button>
    </div>
  );
}
