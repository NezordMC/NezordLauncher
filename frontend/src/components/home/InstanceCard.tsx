import { Button } from "@/components/ui/button";
import { Play, Download, Square, Settings, Loader2 } from "lucide-react";
import { Instance, Account } from "@/types";

import vanillaLogo from "@/assets/images/vanilla.png";
import fabricLogo from "@/assets/images/fabric.png";
import quiltLogo from "@/assets/images/quilt.png";

const modloaderLogos: Record<string, string> = {
  vanilla: vanillaLogo,
  fabric: fabricLogo,
  quilt: quiltLogo,
};

interface InstanceCardProps {
  instance: Instance;
  launchingInstanceId: string | null;
  activeAccount: Account | null;
  downloadProgress?: {
    current: number;
    total: number;
    status: "downloading" | "completed" | "failed" | "idle";
  };
  onLaunch: (id: string, activeAccount: Account | null) => void;
  onStop: () => void;
  onDownload: (id: string) => void;
  onSettings: (id: string) => void;
}

export function InstanceCard({
  instance,
  launchingInstanceId,
  activeAccount,
  downloadProgress,
  onLaunch,
  onStop,
  onDownload,
  onSettings,
}: InstanceCardProps) {
  const logo = modloaderLogos[instance.modloaderType] || modloaderLogos.vanilla;
  const isThisLaunching = launchingInstanceId === instance.id;
  const isDownloading =
    (instance.installState === "downloading" ||
      downloadProgress?.status === "downloading") &&
    !isThisLaunching;
  const needsDownload =
    !downloadProgress ||
    downloadProgress.status === "idle" ||
    downloadProgress.status === "failed";

  const getModloaderColor = () => {
    switch (instance.modloaderType) {
      case "fabric":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      case "quilt":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      default:
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
    }
  };

  return (
    <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-all">
      <div className="flex items-start gap-3 mb-4">
        <img
          src={logo}
          alt={instance.modloaderType}
          className="w-12 h-12 rounded-lg object-cover"
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white truncate">{instance.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded">
              {instance.gameVersion}
            </span>
            <span
              className={`text-[10px] font-medium uppercase px-2 py-0.5 rounded border ${getModloaderColor()}`}
            >
              {instance.modloaderType}
            </span>
          </div>
        </div>
        <button
          onClick={() => onSettings(instance.id)}
          className="text-zinc-500 hover:text-white transition-colors p-1"
        >
          <Settings size={16} />
        </button>
      </div>

      {isDownloading && downloadProgress && (
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-1.5">
            <span>Downloading...</span>
            <span>
              {downloadProgress.current}/{downloadProgress.total}
            </span>
          </div>
          <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{
                width: `${downloadProgress.total > 0 ? (downloadProgress.current / downloadProgress.total) * 100 : 0}%`,
              }}
            />
          </div>
        </div>
      )}

      {downloadProgress?.status === "failed" && (
        <div className="mb-3 p-2 bg-red-500/10 border border-red-500/20 rounded text-xs text-red-400">
          Download failed. Click retry.
        </div>
      )}

      <div className="flex gap-2">
        {isThisLaunching ? (
          <Button
            onClick={onStop}
            className="flex-1 h-10 bg-red-600 hover:bg-red-500 text-white font-medium text-sm gap-2"
          >
            <Square size={14} fill="currentColor" />
            Stop
          </Button>
        ) : isDownloading ? (
          <Button
            disabled
            className="flex-1 h-10 bg-zinc-800 text-zinc-400 font-medium text-sm gap-2"
          >
            <Loader2 size={16} className="animate-spin" />
            Downloading...
          </Button>
        ) : needsDownload ? (
          <Button
            onClick={() => onDownload(instance.id)}
            className="flex-1 h-10 bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-sm gap-2"
          >
            <Download size={16} />
            {downloadProgress?.status === "failed" ? "Retry" : "Download"}
          </Button>
        ) : (
          <Button
            onClick={() => onLaunch(instance.id, activeAccount)}
            className="flex-1 h-10 bg-primary hover:bg-primary/90 text-white font-medium text-sm gap-2"
          >
            <Play size={14} fill="currentColor" />
            Play
          </Button>
        )}
      </div>
    </div>
  );
}
