import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Gamepad2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface GeneralCardProps {
  minRam: number;
  setMinRam: (val: number) => void;
  maxRam: number;
  setMaxRam: (val: number) => void;
  resW: number;
  setResW: (val: number) => void;
  resH: number;
  setResH: (val: number) => void;
  windowMode: string;
  setWindowMode: (val: string) => void;
}

export function GeneralCard({
  minRam,
  setMinRam,
  maxRam,
  setMaxRam,
  resW,
  setResW,
  resH,
  setResH,
  windowMode,
  setWindowMode,
}: GeneralCardProps) {
  const presets = [
    { label: "Low (2GB)", min: 1024, max: 2048 },
    { label: "Medium (4GB)", min: 2048, max: 4096 },
    { label: "High (8GB)", min: 4096, max: 8192 },
  ];
  const windowOptions = ["Windowed", "Fullscreen", "Borderless"];
  const safeWindowMode = windowOptions.includes(windowMode)
    ? windowMode
    : "Windowed";

  const applyPreset = (min: number, max: number) => {
    setMinRam(min);
    setMaxRam(max);
  };

  return (
    <Card className="border-zinc-800 bg-zinc-900">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Gamepad2 className="text-primary" /> General
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <label className="text-sm font-medium text-zinc-300">
            Default Resolution
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-[10px] text-zinc-500 uppercase font-bold">
                Width
              </span>
              <Input
                type="number"
                value={resW}
                onChange={(e) => setResW(parseInt(e.target.value) || 0)}
                className="font-mono bg-zinc-950/50"
              />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-zinc-500 uppercase font-bold">
                Height
              </span>
              <Input
                type="number"
                value={resH}
                onChange={(e) => setResH(parseInt(e.target.value) || 0)}
                className="font-mono bg-zinc-950/50"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-zinc-300">
              Memory Range
            </label>
            <span className="text-xs font-mono text-primary">
              {minRam} MB - {maxRam} MB
            </span>
          </div>

          <div className="space-y-6 pt-2">
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] text-zinc-500 uppercase font-bold">
                <span>Min (Initial)</span>
                <span>{minRam} MB</span>
              </div>
              <input
                type="range"
                min="1024"
                max="16384"
                step="512"
                value={minRam}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setMinRam(val);
                  if (val > maxRam) setMaxRam(val);
                }}
                className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-[10px] text-zinc-500 uppercase font-bold">
                <span>Max (Limit)</span>
                <span>{maxRam} MB</span>
              </div>
              <input
                type="range"
                min="1024"
                max="16384"
                step="512"
                value={maxRam}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setMaxRam(val);
                  if (val < minRam) setMinRam(val);
                }}
                className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-2">
            {presets.map((preset) => (
              <Button
                key={preset.label}
                variant="outline"
                size="sm"
                onClick={() => applyPreset(preset.min, preset.max)}
                className="text-xs border-zinc-700 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
              >
                {preset.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium text-zinc-300">
            Game Window Mode
          </label>
          <Select value={safeWindowMode} onValueChange={setWindowMode}>
            <SelectTrigger className="w-full bg-zinc-950/50 border-zinc-800">
              <SelectValue placeholder="Select mode" />
            </SelectTrigger>
            <SelectContent>
              {windowOptions.map((mode) => (
                <SelectItem key={mode} value={mode}>
                  {mode}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
