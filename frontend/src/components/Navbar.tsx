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
      <nav className="h-14 border-b border-zinc-800 bg-zinc-950/50 backdrop-blur-md flex items-center justify-between px-4 select-none drag-region relative z-40">
        <div className="flex items-center gap-3 no-drag">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setAccountModalOpen(true)}
            className="gap-2 text-zinc-300 hover:text-white hover:bg-zinc-800 border border-transparent hover:border-zinc-700"
          >
            <User
              size={16}
              className={activeAccount ? "text-primary" : "text-zinc-500"}
            />
            <span className="font-mono text-xs font-bold max-w-[150px] truncate">
              {activeAccount ? activeAccount.username : "No Account"}
            </span>
          </Button>
        </div>

        <div className="flex items-center gap-2 no-drag">
          <Button
            variant="ghost"
            size="icon"
            className="text-zinc-400 hover:text-white hover:bg-zinc-800"
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
