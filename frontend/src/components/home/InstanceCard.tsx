import { Button } from "@/components/ui/button";
import { Clock, Play, Box, Square } from "lucide-react";
import { Instance, Account } from "@/types";

interface InstanceCardProps {
  instance: Instance;
  isLaunching: boolean;
  activeAccount: Account | null;
  onLaunch: (id: string, activeAccount: Account | null) => void;
  onStop: () => void;
  onManage: (id: string) => void;
}

export function InstanceCard({
  instance,
  isLaunching,
  activeAccount,
  onLaunch,
  onStop,
  onManage,
}: InstanceCardProps) {
  return (
    <div className="group relative bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700 transition-all duration-200 hover:shadow-xl hover:shadow-black/50">
      <div className="aspect-video bg-zinc-950 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent opacity-80" />

        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="font-bold text-white truncate text-sm mb-0.5">
            {instance.name}
          </h3>
          <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-mono">
            <span className="bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-300">
              {instance.gameVersion}
            </span>
            {instance.modloaderType !== "vanilla" && (
              <span className="uppercase text-primary font-bold">
                {instance.modloaderType}
              </span>
            )}
          </div>
        </div>

        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-black/60 backdrop-blur text-white text-[10px] font-mono px-2 py-1 rounded flex items-center gap-1">
            <Clock size={10} /> {Math.floor(instance.playTime / 60)}m
          </div>
        </div>
      </div>

      <div className="p-3 bg-zinc-900 flex gap-2">
        {isLaunching ? (
          <Button
            className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold text-xs h-8 gap-1.5 animate-pulse"
            onClick={onStop}
          >
            <Square size={10} fill="currentColor" /> CANCEL
          </Button>
        ) : (
          <Button
            className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold text-xs h-8 gap-1.5"
            onClick={() => onLaunch(instance.id, activeAccount)}
          >
            <Play size={12} fill="currentColor" /> PLAY
          </Button>
        )}

        <Button
          variant="outline"
          className="h-8 w-8 px-0 border-zinc-700 hover:bg-zinc-800 text-zinc-400"
          onClick={() => onManage(instance.id)}
          disabled={isLaunching}
        >
          <Box size={14} />
        </Button>
      </div>
    </div>
  );
}
