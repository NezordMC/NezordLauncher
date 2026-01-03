import { Settings, User, Plus, Terminal } from "lucide-react";
import { useAccountStore } from "@/stores/accountStore";
import { useLaunchStore } from "@/stores/launchStore";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export function Navbar() {
  const { accounts, activeAccount, switchAccount } = useAccountStore();
  const { toggleConsole, isConsoleOpen } = useLaunchStore();
  const navigate = useNavigate();

  return (
    <nav className="h-14 border-b border-zinc-800 bg-zinc-950/50 backdrop-blur-md flex items-center justify-between px-4 select-none drag-region relative z-40">
      <div className="flex items-center gap-3 no-drag">
        <div className="relative group">
          <Button
            variant="ghost"
            size="sm"
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

          <div className="absolute top-full left-0 mt-1 w-56 p-1 bg-zinc-900 border border-zinc-800 rounded-md shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
            {accounts.map((acc) => (
              <button
                key={acc.uuid}
                onClick={() => switchAccount(acc.uuid)}
                className={`w-full text-left px-3 py-2 text-xs font-mono rounded-sm flex items-center justify-between ${
                  activeAccount?.uuid === acc.uuid
                    ? "bg-zinc-800 text-white"
                    : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                }`}
              >
                <span>{acc.username}</span>
                <span className="text-[10px] uppercase opacity-50">
                  {acc.type}
                </span>
              </button>
            ))}
            <div className="h-px bg-zinc-800 my-1"></div>
            <button
              onClick={() => navigate("/setup")}
              className="w-full text-left px-3 py-2 text-xs font-mono rounded-sm text-primary hover:bg-zinc-800 flex items-center gap-2"
            >
              <Plus size={12} /> ADD ACCOUNT
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 no-drag">
        <Button
          variant="ghost"
          size="icon"
          className={`text-zinc-400 hover:text-white hover:bg-zinc-800 ${isConsoleOpen ? "bg-zinc-800 text-primary" : ""}`}
          onClick={toggleConsole}
          title="Toggle Console"
        >
          <Terminal size={18} />
        </Button>
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
  );
}
