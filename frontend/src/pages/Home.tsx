import { useState } from "react";
import { useInstanceStore } from "@/stores/instanceStore";
import { useLaunchStore } from "@/stores/launchStore";
import { useAccountStore } from "@/stores/accountStore";
import {
  Search,
  Plus,
  Box,
  Package,
  SlidersHorizontal,
  FilterX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AddInstanceModal } from "@/components/instances/AddInstanceModal";
import { InstanceCard } from "@/components/home/InstanceCard";
import { InstanceDetailModal } from "@/components/instances/InstanceDetailModal";
import { Instance } from "@/types";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type SortOption =
  | "nameAsc"
  | "nameDesc"
  | "createdNewest"
  | "createdOldest";
type LoaderFilter = "all" | "vanilla" | "fabric" | "quilt";
const loaderOptions: LoaderFilter[] = ["all", "vanilla", "fabric", "quilt"];

export function HomePage() {
  const { instances } = useInstanceStore();
  const {
    launchInstance,
    launchingInstanceId,
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

  const [sortBy, setSortBy] = useState<SortOption>("createdNewest");
  const [filterLoader, setFilterLoader] = useState<LoaderFilter>("all");
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const hasAnyInstances = instances.length > 0;
  const hasActiveFilters = normalizedQuery.length > 0 || filterLoader !== "all";

  const filteredInstances = instances
    .filter((inst) =>
      inst.name.toLowerCase().includes(normalizedQuery),
    )
    .filter((inst) => {
      if (filterLoader === "all") return true;
      return inst.modloaderType.toLowerCase() === filterLoader;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "nameAsc":
          return a.name.localeCompare(b.name);
        case "nameDesc":
          return b.name.localeCompare(a.name);
        case "createdNewest":
          return (b.created || "").localeCompare(a.created || "");
        case "createdOldest":
          return (a.created || "").localeCompare(b.created || "");
        default:
          return 0;
      }
    });

  const loaderCounts = {
    all: instances.length,
    vanilla: instances.filter(
      (inst) => inst.modloaderType.toLowerCase() === "vanilla",
    ).length,
    fabric: instances.filter(
      (inst) => inst.modloaderType.toLowerCase() === "fabric",
    ).length,
    quilt: instances.filter(
      (inst) => inst.modloaderType.toLowerCase() === "quilt",
    ).length,
  };

  const clearFilters = () => {
    setSearchQuery("");
    setFilterLoader("all");
  };

  const getInstanceProgress = (instanceId: string) => {
    const progress = downloadProgress[instanceId];
    if (!progress) return { current: 0, total: 0, status: "idle" as const };
    return progress;
  };

  return (
    <div className="h-full w-full flex flex-col p-6">
      <div className="mb-8 p-8 rounded-2xl bg-zinc-900 border border-zinc-800 relative overflow-hidden group flex items-center justify-between">

        <div className="relative z-10">
          <h2 className="text-3xl font-bold text-white mb-2">
            Welcome back,{" "}
            <span className="text-primary">
              {activeAccount?.username || "Guest"}
            </span>
            !
          </h2>
          <p className="text-zinc-500 flex items-center gap-2">
            <span
              className={cn(
                "inline-block w-2 h-2 rounded-full",
                activeAccount ? "bg-green-500" : "bg-zinc-700",
              )}
            />
            {activeAccount
              ? "Ready to launch your adventure."
              : "Please login to play online."}
          </p>
        </div>

        <div className="relative z-10 flex items-center mr-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-zinc-950/50 border border-zinc-800 text-zinc-400">
              <Package size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold text-white leading-none">
                {instances.length}
              </div>
              <div className="text-xs text-zinc-500 font-medium uppercase tracking-wider mt-1.5">
                Instances
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Instance Library</h1>
            <p className="text-sm text-zinc-500">
              Manage and play your modpacks
            </p>
          </div>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="h-9 bg-primary hover:bg-primary/90 text-white font-medium text-sm gap-2"
          >
            <Plus size={16} />
            New Instance
          </Button>
        </div>

        {hasAnyInstances && (
          <>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <div className="relative w-full lg:max-w-md">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
                />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search instances..."
                  className="w-full h-9 pl-9 bg-zinc-900 border-zinc-800 text-sm focus:ring-1 focus:ring-primary/50"
                />
              </div>

              <div className="flex w-full flex-wrap items-center justify-end gap-2 lg:ml-auto lg:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsFilterPanelOpen((prev) => !prev)}
                  className={cn(
                    "h-9 px-3 border-zinc-800 bg-zinc-900 text-zinc-200 hover:bg-zinc-800 hover:text-white",
                    isFilterPanelOpen &&
                      "border-primary/50 bg-primary/10 text-primary",
                  )}
                >
                  <SlidersHorizontal size={14} />
                  Filters
                </Button>

                <div className="min-w-[140px]">
                  <Select
                    value={sortBy}
                    onValueChange={(val: SortOption) => setSortBy(val)}
                  >
                    <SelectTrigger className="h-9 bg-zinc-900 border-zinc-800 text-xs">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nameAsc">Name (A-Z)</SelectItem>
                      <SelectItem value="nameDesc">Name (Z-A)</SelectItem>
                      <SelectItem value="createdNewest">
                        Date Created (Newest)
                      </SelectItem>
                      <SelectItem value="createdOldest">
                        Date Created (Oldest)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="h-9 px-3 text-zinc-300 hover:text-white hover:bg-zinc-800"
                  >
                    <FilterX size={14} />
                    Clear
                  </Button>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-zinc-500">
              <span>
                Showing {filteredInstances.length} of {instances.length} instance
                {instances.length === 1 ? "" : "s"}
              </span>
              {hasActiveFilters && (
                <span className="text-primary/90">Filters active</span>
              )}
            </div>

            {isFilterPanelOpen && (
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-3 animate-in fade-in duration-200">
                <div className="flex flex-wrap items-center gap-2">
                  {loaderOptions.map((type) => (
                    <button
                      key={type}
                      onClick={() => setFilterLoader(type)}
                      className={cn(
                        "inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all capitalize border",
                        filterLoader === type
                          ? "bg-primary/20 border-primary/40 text-primary"
                          : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700",
                      )}
                    >
                      <span>{type}</span>
                      <span className="text-[10px] text-zinc-500">
                        {loaderCounts[type]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {!hasAnyInstances ? (
          <div className="flex flex-col items-center justify-center h-[60vh] text-zinc-500 text-center animate-in fade-in duration-500">
            <div className="bg-zinc-900/50 p-6 rounded-full border border-zinc-800 mb-6 relative group overflow-hidden">
              <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors" />
              <Box
                className="w-16 h-16 text-zinc-400 group-hover:text-primary transition-colors"
                strokeWidth={1.5}
              />
            </div>

            <h3 className="text-xl font-bold text-white mb-2">
              Your library is empty
            </h3>
            <p className="text-zinc-500 max-w-sm mb-8 leading-relaxed">
              Create your first Minecraft instance to start your adventure. You
              can install Vanilla, Fabric, or Quilt.
            </p>

            <Button
              onClick={() => setIsModalOpen(true)}
              size="lg"
              className="bg-primary hover:bg-primary/90 text-white font-semibold px-8 h-12 rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:scale-105 transition-all duration-300"
            >
              <Plus size={20} className="mr-2" />
              Create First Instance
            </Button>
          </div>
        ) : filteredInstances.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[60vh] text-zinc-500 text-center animate-in fade-in duration-500">
            <h3 className="text-xl font-bold text-white mb-2">
              No matching instances
            </h3>
            <p className="text-zinc-500 max-w-sm mb-8 leading-relaxed">
              We couldn't find any instances with the current search and filter
              selection.
            </p>

            <div className="flex items-center gap-2">
              <Button
                onClick={clearFilters}
                variant="outline"
                className="h-10 border-zinc-700 bg-zinc-900 text-zinc-100 hover:bg-zinc-800"
              >
                <FilterX size={16} className="mr-1" />
                Clear Filters
              </Button>
              <Button
                onClick={() => setIsModalOpen(true)}
                className="h-10 bg-primary hover:bg-primary/90 text-white"
              >
                <Plus size={16} className="mr-1" />
                New Instance
              </Button>
            </div>
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
