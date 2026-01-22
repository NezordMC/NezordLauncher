import { useState } from "react";
import { X, Plus, User, Loader2, KeyRound, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAccountStore } from "@/stores/accountStore";

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
  const [showAddForm, setShowAddForm] = useState(false);
  const [accountType, setAccountType] = useState<"offline" | "elyby">(
    "offline",
  );
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    setIsLoading(true);
    setError("");

    try {
      if (accountType === "offline") {
        await addOfflineAccount(username.trim());
      } else {
        await loginElyBy(username, password);
      }
      setUsername("");
      setPassword("");
      setShowAddForm(false);
    } catch (err: any) {
      setError(typeof err === "string" ? err : "Failed to add account");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectAccount = async (uuid: string) => {
    await switchAccount(uuid);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-80 bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl overflow-hidden animate-in slide-in-from-top-2 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-3 border-b border-zinc-800 flex items-center justify-between">
          <span className="text-sm font-semibold text-zinc-100">Accounts</span>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="max-h-64 overflow-y-auto">
          {accounts.map((acc) => (
            <div
              key={acc.uuid}
              className={`w-full group px-3 py-2.5 flex items-center gap-3 transition-colors cursor-pointer border-l-2 ${
                activeAccount?.uuid === acc.uuid
                  ? "bg-primary/10 border-primary"
                  : "hover:bg-zinc-800 border-transparent"
              }`}
              onClick={() => handleSelectAccount(acc.uuid)}
            >
              <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center shrink-0">
                <User size={14} className="text-zinc-400" />
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="text-sm font-medium text-zinc-100 truncate">
                  {acc.username}
                </div>
                <div className="text-[10px] uppercase text-zinc-500">
                  {acc.type}
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeAccount(acc.uuid);
                }}
                className="opacity-0 group-hover:opacity-100 p-2 text-zinc-500 hover:text-red-400 transition-all"
                title="Remove account"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>

        {showAddForm ? (
          <form
            onSubmit={handleAddAccount}
            className="p-3 border-t border-zinc-800 space-y-3"
          >
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setAccountType("offline")}
                className={`flex-1 py-1.5 text-xs font-medium rounded transition-colors ${
                  accountType === "offline"
                    ? "bg-primary text-white"
                    : "bg-zinc-800 text-zinc-400 hover:text-white"
                }`}
              >
                Offline
              </button>
              <button
                type="button"
                onClick={() => setAccountType("elyby")}
                className={`flex-1 py-1.5 text-xs font-medium rounded transition-colors ${
                  accountType === "elyby"
                    ? "bg-primary text-white"
                    : "bg-zinc-800 text-zinc-400 hover:text-white"
                }`}
              >
                Ely.by
              </button>
            </div>

            {error && (
              <div className="p-2 text-xs bg-red-500/10 border border-red-500/20 text-red-400 rounded">
                {error}
              </div>
            )}

            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={accountType === "offline" ? "Username" : "Email"}
              className="h-9 bg-zinc-950 border-zinc-800 text-sm"
              disabled={isLoading}
            />

            {accountType === "elyby" && (
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="h-9 bg-zinc-950 border-zinc-800 text-sm"
                disabled={isLoading}
              />
            )}

            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowAddForm(false)}
                className="flex-1 h-9"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="flex-1 h-9 bg-primary hover:bg-primary/90"
                disabled={isLoading || !username.trim()}
              >
                {isLoading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  "Add"
                )}
              </Button>
            </div>
          </form>
        ) : (
          <div className="p-2 border-t border-zinc-800">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAddForm(true)}
              className="w-full justify-start gap-2 text-primary hover:text-primary hover:bg-primary/10"
            >
              <Plus size={14} />
              Add Account
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
