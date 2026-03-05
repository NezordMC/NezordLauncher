import { useState } from "react";
import { X, User, Check, Trash2, Plus, LogIn } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAccountStore } from "@/stores/accountStore";
import { cn } from "@/lib/utils";

interface AccountManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AccountManagerModal({
  isOpen,
  onClose,
}: AccountManagerModalProps) {
  const {
    accounts,
    activeAccount,
    switchAccount,
    addOfflineAccount,
    removeAccount,
    loginElyBy,
  } = useAccountStore();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("offline");

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    setIsLoading(true);
    setError("");

    try {
      if (activeTab === "offline") {
        await addOfflineAccount(username.trim());
      } else {
        await loginElyBy(username, password);
      }
      setUsername("");
      setPassword("");
    } catch (err: any) {
      setError(typeof err === "string" ? err : "Failed to add account");
    } finally {
      setIsLoading(false);
    }
  };

  const [isSwitching, setIsSwitching] = useState(false);
  const [switchError, setSwitchError] = useState("");

  const handleSelectAccount = async (uuid: string) => {
    if (isSwitching) return;
    setIsSwitching(true);
    setSwitchError("");
    try {
      await switchAccount(uuid);
    } catch (e) {
      console.error(e);
      setSwitchError("Failed to switch account");
    } finally {
      setIsSwitching(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[96vw] max-w-[1120px] sm:max-w-[1120px] p-0 overflow-hidden border-zinc-800 bg-zinc-950 gap-0 sm:rounded-2xl">
        <DialogTitle className="sr-only">Account Manager</DialogTitle>
        <div className="grid grid-cols-12 h-[550px] min-h-0">
          <div className="col-span-4 border-r border-zinc-800 bg-zinc-900/30 flex flex-col min-h-0">
            <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
              <h3 className="font-semibold text-zinc-100 flex items-center gap-2">
                <User size={18} className="text-primary" />
                Accounts
              </h3>
              <span className="text-xs text-zinc-500 font-mono">
                {accounts.length} TOTAL
              </span>
            </div>

            <ScrollArea className="flex-1 min-h-0">
              <div className="p-4 space-y-3">
                {switchError && (
                  <div className="p-3 text-xs bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg">
                    {switchError}
                  </div>
                )}
                {accounts.map((acc) => {
                  const isActive = activeAccount?.uuid === acc.uuid;
                  return (
                    <div
                      key={acc.uuid}
                      className={cn(
                        "group relative flex items-center gap-4 p-4 rounded-xl transition-all cursor-pointer border",
                        isActive
                          ? "bg-zinc-800/80 border-primary/50 ring-1 ring-primary/20"
                          : "bg-zinc-900/50 border-zinc-800/50 hover:bg-zinc-800 hover:border-zinc-700",
                        isSwitching && "opacity-50 pointer-events-none",
                      )}
                      onClick={() => handleSelectAccount(acc.uuid)}
                    >
                      <Avatar
                        className={cn(
                          "w-10 h-10 border transition-all",
                          isActive ? "border-primary/50" : "border-zinc-800",
                        )}
                      >
                        <AvatarImage
                          src={`https://minotar.net/helm/${acc.username}/100.png`}
                          alt={acc.username}
                          className="grayscale group-hover:grayscale-0 transition-all duration-300"
                        />
                        <AvatarFallback className="bg-zinc-800 text-zinc-500">
                          {acc.username.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div
                          className={cn(
                            "font-medium truncate text-sm",
                            isActive ? "text-white" : "text-zinc-300",
                          )}
                        >
                          {acc.username}
                        </div>
                        <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium">
                          {acc.type}
                        </div>
                      </div>

                      {isActive && (
                        <div className="absolute top-2 right-2 flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground shadow-sm shadow-primary/20">
                          <Check size={10} strokeWidth={3} />
                        </div>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeAccount(acc.uuid);
                        }}
                        className="opacity-0 group-hover:opacity-100 absolute right-2 bottom-2 p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-all"
                        title="Remove account"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  );
                })}

                {accounts.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-10 text-center px-4">
                    <User size={32} className="text-zinc-700 mb-3" />
                    <p className="text-sm text-zinc-500">
                      No accounts added yet.
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          <div className="col-span-8 p-8 flex flex-col relative bg-zinc-950/50 min-h-0">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-full transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
              <div className="mb-8 text-center space-y-2">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 text-primary mb-2">
                  <Plus size={24} />
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Add New Account
                </h2>
                <p className="text-sm text-zinc-500">
                  Connect your Minecraft account to play
                </p>
              </div>

              <Tabs
                defaultValue="offline"
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2 mb-6 bg-zinc-900 border border-zinc-800">
                  <TabsTrigger
                    value="offline"
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    Offline
                  </TabsTrigger>
                  <TabsTrigger
                    value="elyby"
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    Ely.by
                  </TabsTrigger>
                </TabsList>

                {error && (
                  <div className="mb-4 p-3 text-xs bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg flex items-start gap-2">
                    <div className="mt-0.5 shrink-0 w-1 h-1 rounded-full bg-red-500" />
                    {error}
                  </div>
                )}

                <form onSubmit={handleAddAccount} className="space-y-4">
                  <TabsContent value="offline" className="space-y-4 mt-0">
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                        Username
                      </label>
                      <Input
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Steve"
                        className="bg-zinc-900 border-zinc-800 h-10 focus-visible:ring-primary/50"
                        autoFocus
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="elyby" className="space-y-4 mt-0">
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                        Email or Username
                      </label>
                      <Input
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="steve@example.com"
                        className="bg-zinc-900 border-zinc-800 h-10 focus-visible:ring-primary/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                        Password
                      </label>
                      <Input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="bg-zinc-900 border-zinc-800 h-10 focus-visible:ring-primary/50"
                      />
                    </div>
                  </TabsContent>

                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90 text-white font-medium h-10 mt-2"
                    disabled={isLoading || !username.trim()}
                  >
                    {activeTab === "elyby" ? (
                      <LogIn className="w-4 h-4 mr-2" />
                    ) : (
                      <Plus className="w-4 h-4 mr-2" />
                    )}
                    {isLoading ? "Adding..." : "Add Account"}
                  </Button>
                </form>
              </Tabs>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
