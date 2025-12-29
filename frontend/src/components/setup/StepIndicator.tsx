interface StepIndicatorProps {
  step: number;
}

export function StepIndicator({ step }: StepIndicatorProps) {
  return (
    <div className="flex justify-center gap-2 mb-8">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className={`h-1 rounded-full transition-all duration-300 ${
            step === i ? "w-8 bg-white" : "w-2 bg-zinc-800"
          }`}
        />
      ))}
    </div>
  );
}
