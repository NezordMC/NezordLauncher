import { useState } from "react";
import { Console } from "./components/Console";

function App() {
  const [logs] = useState<string[]>([
    "[SYSTEM] Nezord Launcher Initialized",
    "[SYSTEM] Ready to launch",
    "[GAME] Loading assets...",
    "[ERROR] Failed to load texture: missing.png (Simulation)",
    "[GAME] Game process started (PID: 12345)",
  ]);

  return (
    <div className="flex flex-col items-center justify-center w-screen h-screen font-sans text-white bg-zinc-950 relative overflow-hidden p-8">
      <div className="absolute top-0 left-0 w-full h-8 app-drag z-50 bg-transparent"></div>

      <div className="w-full max-w-2xl space-y-6 z-10">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tighter text-white">
            NEZORD
          </h1>
          <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest">
            CONSOLE MONITOR TEST
          </p>
        </div>

        <div className="h-64 w-full">
          <Console logs={logs} />
        </div>
      </div>

      <div className="absolute bottom-4 text-[10px] text-zinc-800 font-mono">
        v1.0.0
      </div>
    </div>
  );
}

export default App;
