import { useLauncherContext } from "@/context/LauncherContext";
import { Loader2 } from "lucide-react";

export function HomePage() {
  const { instances } = useLauncherContext();

  return (
    <div className="h-full w-full flex flex-col">
      <h1 className="text-2xl font-bold tracking-tight mb-6">Instances</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {instances.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center h-64 text-zinc-500 border border-dashed border-zinc-800 rounded-lg">
            <Loader2 className="animate-spin mb-2" size={24} />
            <span className="text-xs font-mono">NO INSTANCES FOUND</span>
          </div>
        ) : (
          instances.map((inst) => (
            <div
              key={inst.id}
              className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg"
            >
              <h3 className="font-bold">{inst.name}</h3>
              <p className="text-xs text-zinc-500 font-mono">
                {inst.gameVersion} • {inst.modloaderType}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
