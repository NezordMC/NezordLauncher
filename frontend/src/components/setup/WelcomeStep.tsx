import { Button } from "@/components/ui/button";

interface WelcomeStepProps {
  onNext: () => void;
}

export function WelcomeStep({ onNext }: WelcomeStepProps) {
  return (
    <div className="space-y-6 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Welcome
        </h1>
        <p className="text-zinc-500 text-sm">Let's configure your launcher.</p>
      </div>
      <Button
        onClick={onNext}
        className="w-full bg-white text-black hover:bg-zinc-200 font-bold"
      >
        Start Setup
      </Button>
    </div>
  );
}
