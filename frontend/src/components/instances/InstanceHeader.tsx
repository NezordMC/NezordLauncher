import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Play, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Instance, Account } from "@/types";

interface InstanceHeaderProps {
  instance: Instance;
  isDirty: boolean;
  isSaving: boolean;
  onSave: () => void;
  isLaunching: boolean;
  onLaunch: (id: string, account: Account | null) => void;
  activeAccount: Account | null;
}

export function InstanceHeader({
  instance,
  isDirty,
  isSaving,
  onSave,
  isLaunching,
  onLaunch,
  activeAccount,
}: InstanceHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-4 border-b border-zinc-800 pb-4 mb-4 shrink-0">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => navigate("/")}
        className="hover:bg-zinc-800 text-zinc-400 hover:text-white"
      >
        <ArrowLeft size={20} />
      </Button>
      <div>
        <h1 className="text-xl font-bold tracking-tight">{instance.name}</h1>
        <p className="text-xs text-zinc-500 font-mono flex gap-2">
          {instance.gameVersion} • {instance.modloaderType}
        </p>
      </div>
      <div className="ml-auto flex gap-2">
        <Button
          onClick={onSave}
          disabled={!isDirty || isSaving}
          className={`font-bold text-xs gap-2 transition-all ${
            isDirty
              ? "bg-primary hover:bg-primary/90"
              : "bg-zinc-800 text-zinc-500"
          }`}
        >
          {isSaving ? (
            <Loader2 className="animate-spin" size={14} />
          ) : (
            <Save size={14} />
          )}
          {isDirty ? "SAVE CHANGES" : "SAVED"}
        </Button>
        <Button
          onClick={() => onLaunch(instance.id, activeAccount)}
          disabled={isLaunching}
          className="bg-primary hover:bg-primary/90 text-white font-bold text-xs gap-2 min-w-[120px]"
        >
          <Play size={14} fill="currentColor" />{" "}
          {isLaunching ? "LAUNCHING..." : "PLAY"}
        </Button>
      </div>
    </div>
  );
}
