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
    stopInstance,
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
          <div className="flex flex-col items-center justify-center h-[60vh] text-zinc-500 text-center animate-in fade-in duration-500">
            <div className="bg-zinc-900/50 p-6 rounded-full border border-zinc-800 mb-6 relative group overflow-hidden">
              <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors" />
              <Box
                className="w-16 h-16 text-zinc-400 group-hover:text-primary transition-colors"
                strokeWidth={1.5}
              />
            </div>

            <h3 className="text-xl font-bold text-white mb-2">
              {searchQuery ? "No matching instances" : "Your library is empty"}
            </h3>
            <p className="text-zinc-500 max-w-sm mb-8 leading-relaxed">
              {searchQuery
                ? `We couldn't find any instances matching "${searchQuery}". Try a different search term.`
                : "Create your first Minecraft instance to start your adventure. You can install Vanilla, Fabric, or Quilt."}
            </p>

            <Button
              onClick={() => setIsModalOpen(true)}
              size="lg"
              className="bg-primary hover:bg-primary/90 text-white font-semibold px-8 h-12 rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:scale-105 transition-all duration-300"
            >
              <Plus size={20} className="mr-2" />
              {searchQuery ? "Create New Instance" : "Create First Instance"}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredInstances.map((inst) => (
              <InstanceCard
                key={inst.id}
                instance={inst}
                launchingInstanceId={launchingInstanceId}
                activeAccount={activeAccount}
                downloadProgress={getInstanceProgress(inst.id)}
                onLaunch={launchInstance}
                onStop={() => stopInstance(inst.id)}
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
