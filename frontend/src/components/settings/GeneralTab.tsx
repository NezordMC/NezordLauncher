import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";

interface GeneralTabProps {
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
  gpuPreference: string;
  setGpuPreference: (val: string) => void;
}

export function GeneralTab({
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
  gpuPreference,
  setGpuPreference,
}: GeneralTabProps) {
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
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Display</CardTitle>
            <CardDescription>Configure window size and mode.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Window Mode</Label>
              <Select value={safeWindowMode} onValueChange={setWindowMode}>
                <SelectTrigger>
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Width</Label>
                <Input
                  type="number"
                  value={resW}
                  onChange={(e) => setResW(parseInt(e.target.value) || 0)}
                  className="font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label>Height</Label>
                <Input
                  type="number"
                  value={resH}
                  onChange={(e) => setResH(parseInt(e.target.value) || 0)}
                  className="font-mono"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Graphics</CardTitle>
            <CardDescription>
              Select preferred graphics processor.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label>GPU Preference</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info
                      size={14}
                      className="cursor-help text-muted-foreground"
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      Select which GPU to use for Minecraft.
                      <br />
                      "Auto" lets the system decide.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Select value={gpuPreference} onValueChange={setGpuPreference}>
                <SelectTrigger>
                  <SelectValue placeholder="Select GPU" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto (Default)</SelectItem>
                  <SelectItem value="discrete">Discrete GPU</SelectItem>
                  <SelectItem value="integrated">Integrated GPU</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Memory Allocation</CardTitle>
              <CardDescription>
                Adjust Java heap size limits (Min/Max).
              </CardDescription>
            </div>
            <span className="font-mono text-sm text-muted-foreground bg-muted px-2 py-1 rounded-md">
              {minRam} MB - {maxRam} MB
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <Label>Minimum (Initial)</Label>
                <span className="font-mono text-muted-foreground">
                  {minRam} MB
                </span>
              </div>
              <Slider
                min={1024}
                max={16384}
                step={512}
                value={[minRam]}
                onValueChange={([val]) => {
                  setMinRam(val);
                  if (val > maxRam) setMaxRam(val);
                }}
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <Label>Maximum (Limit)</Label>
                <span className="font-mono text-muted-foreground">
                  {maxRam} MB
                </span>
              </div>
              <Slider
                min={1024}
                max={16384}
                step={512}
                value={[maxRam]}
                onValueChange={([val]) => {
                  setMaxRam(val);
                  if (val < minRam) setMinRam(val);
                }}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {presets.map((preset) => (
              <Button
                key={preset.label}
                variant={
                  minRam === preset.min && maxRam === preset.max
                    ? "default"
                    : "outline"
                }
                size="sm"
                onClick={() => applyPreset(preset.min, preset.max)}
              >
                {preset.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
