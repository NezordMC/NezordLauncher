import { useState } from "react";
import { useInstanceStore } from "@/stores/instanceStore";
import { useLaunchStore } from "@/stores/launchStore";
import { useAccountStore } from "@/stores/accountStore";
import { Search, Plus, Box } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AddInstanceModal } from "@/components/instances/AddInstanceModal";
import { InstanceCard } from "@/components/home/InstanceCard";
import { InstanceDetailModal } from "@/components/instances/InstanceDetailModal";
import { Instance } from "@/types";

export function HomePage() {
  const { instances } = useInstanceStore();
  const {
    launchInstance,
    launchingInstanceId,
    stopLaunch,
    downloadProgress,
    startDownload,
  } = useLaunchStore();
  const { activeAccount } = useAccountStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInstance, setSelectedInstance] = useState<Instance | null>(
    null,
  );

  const filteredInstances = instances.filter((inst) =>
    inst.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const getInstanceProgress = (instanceId: string) => {
    const progress = downloadProgress[instanceId];
    if (!progress) return { current: 0, total: 0, status: "idle" as const };
    return progress;
  };

  return (
    <div className="h-full w-full flex flex-col p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Instance Library</h1>
          <p className="text-sm text-zinc-500">Manage and play your modpacks</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
            />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-48 h-9 pl-9 bg-zinc-900 border-zinc-800 text-sm"
            />
          </div>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="h-9 bg-primary hover:bg-primary/90 text-white font-medium text-sm gap-2"
          >
            <Plus size={16} />
            New Instance
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredInstances.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-zinc-500 border border-dashed border-zinc-800 rounded-xl bg-zinc-900/30">
            <Box className="mb-4 opacity-50" size={48} />
            <span className="text-sm font-medium">No instances found</span>
            <span className="text-xs text-zinc-600 mt-1">
              Create one to start playing
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredInstances.map((inst) => (
              <InstanceCard
                key={inst.id}
                instance={inst}
                launchingInstanceId={launchingInstanceId}
                activeAccount={activeAccount}
                downloadProgress={getInstanceProgress(inst.id)}
                onLaunch={launchInstance}
                onStop={stopLaunch}
                onDownload={startDownload}
                onSettings={(id) =>
                  setSelectedInstance(
                    instances.find((i) => i.id === id) || null,
                  )
                }
              />
            ))}
          </div>
        )}
      </div>

      <AddInstanceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <InstanceDetailModal
        instance={selectedInstance}
        onClose={() => setSelectedInstance(null)}
      />
    </div>
  );
}
