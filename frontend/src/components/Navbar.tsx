import { useState } from "react";
import { Settings, User } from "lucide-react";
import { useAccountStore } from "@/stores/accountStore";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { AccountManagerModal } from "@/components/account/AccountManagerModal";

export function Navbar() {
  const { activeAccount } = useAccountStore();
  const navigate = useNavigate();
  const [isAccountModalOpen, setAccountModalOpen] = useState(false);

  return (
    <>
      <nav className="h-16 border-b border-zinc-800 bg-zinc-950/30 backdrop-blur-sm flex items-center justify-between px-6 select-none relative z-40">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setAccountModalOpen(true)}
            className="gap-3 text-zinc-300 hover:text-white hover:bg-zinc-800/50 border border-zinc-800/50 hover:border-zinc-700 h-10 px-3 transition-all"
          >
            <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center">
              <User
                size={14}
                className={activeAccount ? "text-primary" : "text-zinc-500"}
              />
            </div>
            <div className="flex flex-col items-start gap-0.5">
              <span className="font-medium text-xs text-zinc-400">Account</span>
              <span className="font-bold text-xs max-w-[120px] truncate leading-none">
                {activeAccount ? activeAccount.username : "No Account"}
              </span>
            </div>
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-all"
            onClick={() => navigate("/settings")}
            title="Settings"
          >
            <Settings size={18} />
          </Button>
        </div>
      </nav>

      <AccountManagerModal
        isOpen={isAccountModalOpen}
        onClose={() => setAccountModalOpen(false)}
      />
    </>
  );
}
