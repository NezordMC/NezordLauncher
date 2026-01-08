import { cn } from "@/lib/utils";
import { Box, User, Zap } from "lucide-react";

interface StepIndicatorProps {
  step: number;
}

const steps = [
  { id: 1, label: "Welcome", icon: Box },
  { id: 2, label: "Account", icon: User },
  { id: 3, label: "Memory", icon: Zap },
];

export function StepIndicator({ step }: StepIndicatorProps) {
  return (
    <div className="flex justify-center items-center gap-4 mb-8">
      {steps.map((s, i) => {
        const Icon = s.icon;
        const isActive = step === s.id;
        const isCompleted = step > s.id;

        return (
          <div key={s.id} className="flex items-center gap-4">
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
                  isActive
                    ? "bg-primary text-white scale-110 shadow-lg shadow-primary/20"
                    : isCompleted
                      ? "bg-primary/20 text-primary"
                      : "bg-zinc-800 text-zinc-500",
                )}
              >
                <Icon size={18} />
              </div>
              <span
                className={cn(
                  "text-[10px] font-medium transition-colors",
                  isActive ? "text-white" : "text-zinc-600",
                )}
              >
                {s.label}
              </span>
            </div>

            {i < steps.length - 1 && (
              <div
                className={cn(
                  "w-8 h-0.5 rounded-full transition-colors",
                  isCompleted ? "bg-primary" : "bg-zinc-800",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
