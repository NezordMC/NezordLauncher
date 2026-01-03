import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Loader2, KeyRound, Mail } from "lucide-react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (u: string, p: string) => Promise<void>;
}

export function LoginModal({ isOpen, onClose, onLogin }: LoginModalProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;

    setIsLoading(true);
    setError("");
    try {
      await onLogin(username, password);
      onClose();
      setUsername("");
      setPassword("");
    } catch (e: any) {
      setError(typeof e === "string" ? e : "Login failed. Check credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-950/50">
          <h2 className="font-bold text-xs tracking-widest text-zinc-100 flex items-center gap-2 font-mono">
            <KeyRound size={14} className="text-primary" /> ELY.BY LOGIN
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-[10px] bg-red-500/10 border border-red-500/20 text-red-400 rounded font-mono">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
              Email / Username
            </label>
            <div className="relative">
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="pl-9 bg-black/50 border-zinc-800 text-zinc-300 font-mono text-xs focus-visible:ring-emerald-600"
                placeholder="Steve"
                autoFocus
                disabled={isLoading}
              />
              <Mail
                size={14}
                className="absolute left-3 top-2.5 text-zinc-600"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
              Password
            </label>
            <div className="relative">
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-9 bg-black/50 border-zinc-800 text-zinc-300 font-mono text-xs focus-visible:ring-emerald-600"
                placeholder="••••••••"
                disabled={isLoading}
              />
              <KeyRound
                size={14}
                className="absolute left-3 top-2.5 text-zinc-600"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading || !username || !password}
            className="w-full bg-primary hover:bg-primary/90 text-white font-bold tracking-wider text-xs h-10 mt-2"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={14} />
            ) : (
              "AUTHENTICATE"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
