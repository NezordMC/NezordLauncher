import { useState } from "react";
import { useLauncherContext } from "@/context/LauncherContext";
import { Plus, Play, Box, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddInstanceModal } from "@/components/AddInstanceModal";
import { useNavigate } from "react-router-dom";

export function HomePage() {
  const { instances, launchInstance, isLaunching } = useLauncherContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="h-full w-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          Library{" "}
          <span className="text-zinc-600 text-lg font-mono">
            ({instances.length})
          </span>
        </h1>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-9 text-xs tracking-wider gap-2"
        >
          <Plus size={14} /> NEW INSTANCE
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {instances.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center h-64 text-zinc-500 border border-dashed border-zinc-800 rounded-xl bg-zinc-900/20">
              <Box className="mb-4 opacity-50" size={48} />
              <span className="text-sm font-medium">No instances found</span>
              <span className="text-xs text-zinc-600 mt-1">
                Create one to start playing
              </span>
            </div>
          ) : (
            instances.map((inst) => (
              <div
                key={inst.id}
                className="group relative bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700 transition-all duration-200 hover:shadow-xl hover:shadow-black/50"
              >
                <div className="aspect-video bg-zinc-950 relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent opacity-80" />

                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="font-bold text-white truncate text-sm mb-0.5">
                      {inst.name}
                    </h3>
                    <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-mono">
                      <span className="bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-300">
                        {inst.gameVersion}
                      </span>
                      {inst.modloaderType !== "vanilla" && (
                        <span className="uppercase text-emerald-500">
                          {inst.modloaderType}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-black/60 backdrop-blur text-white text-[10px] font-mono px-2 py-1 rounded flex items-center gap-1">
                      <Clock size={10} /> {Math.floor(inst.playTime / 60)}m
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-zinc-900 flex gap-2">
                  <Button
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-8 gap-1.5"
                    disabled={isLaunching}
                    onClick={() => launchInstance(inst.id)}
                  >
                    <Play size={12} fill="currentColor" /> PLAY
                  </Button>
                  <Button
                    variant="outline"
                    className="h-8 w-8 px-0 border-zinc-700 hover:bg-zinc-800 text-zinc-400"
                    onClick={() => navigate(`/instance/${inst.id}`)}
                  >
                    <Box size={14} />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <AddInstanceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
