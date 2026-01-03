export function AboutSettings() {
  return (
    <div className="space-y-6 text-center pt-10 animate-in fade-in zoom-in-95 duration-300">
      <h1 className="text-4xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-primary to-fuchsia-500">
        NEZORD
      </h1>
      <p className="text-zinc-500 font-mono text-xs">v1.3.0-beta</p>
      <div className="max-w-md mx-auto text-sm text-zinc-400 space-y-4">
        <p>
          Built with <span className="text-white font-bold">Wails</span>,{" "}
          <span className="text-white font-bold">React</span>, and{" "}
          <span className="text-white font-bold">Golang</span>.
        </p>
        <p className="text-xs text-zinc-600">
          Designed for performance and simplicity.
        </p>
      </div>
    </div>
  );
}
