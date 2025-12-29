import { useState } from "react";
import { useInstanceStore } from "@/stores/instanceStore";
import { useLaunchStore } from "@/stores/launchStore";
import { useAccountStore } from "@/stores/accountStore";
import { Plus, Box } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddInstanceModal } from "@/components/instances/AddInstanceModal";
import { useNavigate } from "react-router-dom";
import { InstanceCard } from "@/components/home/InstanceCard";

export function HomePage() {
  const { instances } = useInstanceStore();
  const { launchInstance, isLaunching, stopLaunch } = useLaunchStore();
  const { activeAccount } = useAccountStore();
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
              <InstanceCard
                key={inst.id}
                instance={inst}
                isLaunching={isLaunching}
                activeAccount={activeAccount}
                onLaunch={launchInstance}
                onStop={stopLaunch}
                onManage={(id) => navigate(`/instance/${id}`)}
              />
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
