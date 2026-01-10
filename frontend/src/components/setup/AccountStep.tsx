import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  User,
  UserCircle,
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";
import { Account } from "@/types";
import { cn } from "@/lib/utils";

interface AccountStepProps {
  accounts: Account[];
  addOfflineAccount: (name: string) => Promise<void>;
  loginElyBy: (u: string, p: string) => Promise<void>;
  onNext: () => void;
  onBack: () => void;
}

export function AccountStep({
  accounts,
  addOfflineAccount,
  loginElyBy,
  onNext,
  onBack,
}: AccountStepProps) {
  const [newOfflineName, setNewOfflineName] = useState("");
  const [isAddingOffline, setIsAddingOffline] = useState(false);
  const [isAddingElyby, setIsAddingElyby] = useState(false);
  const [elybyEmail, setElybyEmail] = useState("");
  const [elybyPassword, setElybyPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleElybyLogin = async () => {
    if (!elybyEmail.trim() || !elybyPassword.trim()) return;
    setIsLoading(true);
    try {
      await loginElyBy(elybyEmail.trim(), elybyPassword);
      setElybyEmail("");
      setElybyPassword("");
      setIsAddingElyby(false);
    } catch (e) {
    } finally {
      setIsLoading(false);
    }
  };

  const handleOfflineAdd = async () => {
    if (!newOfflineName.trim()) return;
    await addOfflineAccount(newOfflineName.trim());
    setNewOfflineName("");
    setIsAddingOffline(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="text-center space-y-1">
        <User className="mx-auto text-primary mb-2" size={28} />
        <h2 className="text-xl font-bold text-white">Add Account</h2>
        <p className="text-zinc-500 text-xs">Choose how you want to play</p>
      </div>

      {accounts.length > 0 && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="border border-primary/30 rounded-lg p-3 bg-primary/5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <UserCircle size={16} className="text-primary" />
              </div>
              <div className="flex-1">
                <span className="font-bold text-sm text-white">
                  {accounts[accounts.length - 1].username}
                </span>
                <p className="text-[10px] uppercase text-zinc-500">
                  {accounts[accounts.length - 1].type}
                </p>
              </div>
              <Check size={16} className="text-primary" />
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => {
            setIsAddingElyby(true);
            setIsAddingOffline(false);
          }}
          className={cn(
            "group p-4 border rounded-xl bg-zinc-900/50 transition-all flex flex-col items-center gap-3",
            isAddingElyby
              ? "border-primary bg-primary/5"
              : "border-zinc-800 hover:border-primary/50 hover:bg-primary/5",
          )}
        >
          <div className="w-12 h-12 rounded-full overflow-hidden group-hover:scale-110 transition-transform">
            <img
              src="/elyby-logo.png"
              alt="Ely.by"
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-sm font-bold text-zinc-300 group-hover:text-white transition-colors">
            Ely.by
          </span>
        </button>

        <button
          onClick={() => {
            setIsAddingOffline(true);
            setIsAddingElyby(false);
          }}
          className={cn(
            "group p-4 border rounded-xl bg-zinc-900/50 transition-all flex flex-col items-center gap-3",
            isAddingOffline
              ? "border-primary bg-primary/5"
              : "border-zinc-800 hover:border-primary/50 hover:bg-primary/5",
          )}
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-zinc-500/20 to-zinc-600/20 flex items-center justify-center group-hover:scale-110 transition-transform">
            <UserCircle size={20} className="text-zinc-400" />
          </div>
          <span className="text-sm font-bold text-zinc-300 group-hover:text-white transition-colors">
            Offline
          </span>
        </button>
      </div>

      {isAddingElyby && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-200 space-y-3">
          <div className="flex gap-2">
            <Input
              autoFocus
              type="email"
              placeholder="Email or username"
              className="bg-zinc-900 border-zinc-800 h-10 text-sm flex-1"
              value={elybyEmail}
              onChange={(e) => setElybyEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="bg-zinc-900 border-zinc-800 h-10 text-sm pr-10"
                value={elybyPassword}
                onChange={(e) => setElybyPassword(e.target.value)}
                disabled={isLoading}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleElybyLogin();
                  if (e.key === "Escape") {
                    setIsAddingElyby(false);
                    setElybyEmail("");
                    setElybyPassword("");
                  }
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <Button
              onClick={handleElybyLogin}
              disabled={
                isLoading || !elybyEmail.trim() || !elybyPassword.trim()
              }
              className="bg-white text-black hover:bg-zinc-200 h-10 px-4"
            >
              {isLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Check size={16} />
              )}
            </Button>
          </div>
          <p className="text-[10px] text-zinc-600 text-center">
            Press Enter to login or Escape to cancel
          </p>
        </div>
      )}

      {isAddingOffline && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-200 space-y-2">
          <div className="flex gap-2">
            <Input
              autoFocus
              placeholder="Enter username"
              className="bg-zinc-900 border-zinc-800 h-10 text-sm"
              value={newOfflineName}
              onChange={(e) => setNewOfflineName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && newOfflineName.trim()) {
                  handleOfflineAdd();
                }
                if (e.key === "Escape") {
                  setIsAddingOffline(false);
                  setNewOfflineName("");
                }
              }}
            />
            <Button
              onClick={handleOfflineAdd}
              disabled={!newOfflineName.trim()}
              className="bg-white text-black hover:bg-zinc-200 h-10 px-4"
            >
              <Check size={16} />
            </Button>
          </div>
          <p className="text-[10px] text-zinc-600 text-center">
            Press Enter to confirm or Escape to cancel
          </p>
        </div>
      )}

      <div className="flex gap-2 pt-2">
        <Button
          onClick={onBack}
          variant="outline"
          className="flex-1 border-zinc-800 hover:bg-zinc-900 font-medium"
        >
          <ChevronLeft size={16} />
          <span>Back</span>
        </Button>
        <Button
          onClick={onNext}
          disabled={accounts.length === 0}
          className={cn(
            "flex-1 font-bold gap-2",
            accounts.length === 0
              ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
              : "bg-white text-black hover:bg-zinc-200",
          )}
        >
          <span>Continue</span>
          <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  );
}
