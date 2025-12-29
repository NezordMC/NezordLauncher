import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Check } from "lucide-react";
import { Account } from "@/types";
import { LoginModal } from "@/components/account/LoginModal";

interface AccountStepProps {
  accounts: Account[];
  addOfflineAccount: (name: string) => Promise<void>;
  loginElyBy: (u: string, p: string) => Promise<void>;
  onNext: () => void;
}

export function AccountStep({
  accounts,
  addOfflineAccount,
  loginElyBy,
  onNext,
}: AccountStepProps) {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [newOfflineName, setNewOfflineName] = useState("");
  const [isAddingOffline, setIsAddingOffline] = useState(false);

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="text-center space-y-1 mb-6">
        <User className="mx-auto text-zinc-400 mb-2" size={24} />
        <h2 className="text-lg font-bold">Add Account</h2>
      </div>

      <div className="space-y-2">
        {accounts.length > 0 && (
          <div className="border border-zinc-800 rounded-md p-2 space-y-1 bg-zinc-900/50 mb-4">
            {accounts.map((acc) => (
              <div
                key={acc.uuid}
                className="flex items-center justify-between p-2 bg-zinc-800/30 rounded text-xs"
              >
                <span className="font-bold">{acc.username}</span>
                <span className="uppercase text-zinc-500">{acc.type}</span>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            className="h-12 border-zinc-800 hover:bg-zinc-900 gap-2"
            onClick={() => setIsLoginModalOpen(true)}
          >
            <span className="text-xs">Ely.by</span>
          </Button>
          <Button
            variant="outline"
            className="h-12 border-zinc-800 hover:bg-zinc-900 gap-2"
            onClick={() => setIsAddingOffline(true)}
          >
            <span className="text-xs">Offline</span>
          </Button>
        </div>

        {isAddingOffline && (
          <div className="flex gap-2 animate-in fade-in slide-in-from-top-1 pt-2">
            <Input
              autoFocus
              placeholder="Username"
              className="bg-zinc-900 border-zinc-800 h-9 text-xs"
              value={newOfflineName}
              onChange={(e) => setNewOfflineName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && newOfflineName) {
                  addOfflineAccount(newOfflineName);
                  setNewOfflineName("");
                  setIsAddingOffline(false);
                }
              }}
            />
            <Button
              size="icon"
              className="h-9 w-9 bg-white text-black hover:bg-zinc-200"
              onClick={() => {
                if (newOfflineName) {
                  addOfflineAccount(newOfflineName);
                  setNewOfflineName("");
                  setIsAddingOffline(false);
                }
              }}
            >
              <Check size={14} />
            </Button>
          </div>
        )}
      </div>

      <Button
        onClick={onNext}
        disabled={accounts.length === 0}
        className="w-full bg-white text-black hover:bg-zinc-200 font-bold mt-4"
      >
        Continue
      </Button>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLogin={loginElyBy}
      />
    </div>
  );
}
