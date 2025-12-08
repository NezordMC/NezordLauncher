function App() {
  return (
    <div className="flex flex-col items-center justify-center w-screen h-screen font-sans text-white bg-zinc-950 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-8 app-drag z-50 bg-transparent"></div>

      <div className="text-center space-y-4 animate-in fade-in zoom-in duration-500">
        <h1 className="text-6xl font-extrabold tracking-tighter text-white drop-shadow-2xl">
          NEZORD
        </h1>
        
        <div className="h-px w-32 bg-zinc-800 mx-auto"></div>
        
        <p className="text-xs text-zinc-500 font-mono uppercase tracking-[0.4em]">
          LAUNCHER
        </p>
      </div>

      <div className="absolute bottom-4 text-[10px] text-zinc-800 font-mono">
        v1.0.0
      </div>
    </div>
  )
}

export default App
