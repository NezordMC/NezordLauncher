import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  User,
  Key,
  UserCircle,
  Check,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Account } from "@/types";
import { LoginModal } from "@/components/account/LoginModal";
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
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [newOfflineName, setNewOfflineName] = useState("");
  const [isAddingOffline, setIsAddingOffline] = useState(false);

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
          onClick={() => setIsLoginModalOpen(true)}
          className="group p-4 border border-zinc-800 rounded-xl bg-zinc-900/50 hover:border-primary/50 hover:bg-primary/5 transition-all flex flex-col items-center gap-3"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500/20 to-blue-600/20 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Key size={20} className="text-blue-400" />
          </div>
          <span className="text-sm font-bold text-zinc-300 group-hover:text-white transition-colors">
            Ely.by
          </span>
        </button>

        <button
          onClick={() => setIsAddingOffline(true)}
          className="group p-4 border border-zinc-800 rounded-xl bg-zinc-900/50 hover:border-primary/50 hover:bg-primary/5 transition-all flex flex-col items-center gap-3"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-zinc-500/20 to-zinc-600/20 flex items-center justify-center group-hover:scale-110 transition-transform">
            <UserCircle size={20} className="text-zinc-400" />
          </div>
          <span className="text-sm font-bold text-zinc-300 group-hover:text-white transition-colors">
            Offline
          </span>
        </button>
      </div>

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
                  addOfflineAccount(newOfflineName.trim());
                  setNewOfflineName("");
                  setIsAddingOffline(false);
                }
                if (e.key === "Escape") {
                  setIsAddingOffline(false);
                  setNewOfflineName("");
                }
              }}
            />
            <Button
              onClick={() => {
                if (newOfflineName.trim()) {
                  addOfflineAccount(newOfflineName.trim());
                  setNewOfflineName("");
                  setIsAddingOffline(false);
                }
              }}
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

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLogin={loginElyBy}
      />
    </div>
  );
}
