import {
  WindowMinimise,
  WindowToggleMaximise,
  Quit,
} from "../../wailsjs/runtime/runtime";

export function TitleBar() {
  return (
    <div className="h-10 bg-zinc-950 flex items-center px-4 select-none app-drag relative z-50 border-b border-zinc-800/50">
      <div className="flex items-center gap-2 no-drag group absolute left-4">
        <button
          onClick={Quit}
          className="w-3 h-3 rounded-full bg-[#FF5F56] hover:bg-[#FF5F56]/80 flex items-center justify-center transition-all border border-transparent hover:border-[#E0443E]"
        >
          <span className="opacity-0 group-hover:opacity-100 text-[8px] font-bold text-[#4c0002]">
            ×
          </span>
        </button>
        <button
          onClick={WindowMinimise}
          className="w-3 h-3 rounded-full bg-[#FFBD2E] hover:bg-[#FFBD2E]/80 flex items-center justify-center transition-all border border-transparent hover:border-[#DEA123]"
        >
          <span className="opacity-0 group-hover:opacity-100 text-[8px] font-bold text-[#5c3e03]">
            −
          </span>
        </button>
        <button
          onClick={WindowToggleMaximise}
          className="w-3 h-3 rounded-full bg-[#27C93F] hover:bg-[#27C93F]/80 flex items-center justify-center transition-all border border-transparent hover:border-[#1AAB29]"
        >
          <span className="opacity-0 group-hover:opacity-100 text-[6px] font-bold text-[#0a4d0f]">
            sw
          </span>
        </button>
      </div>

      <div className="flex-1 flex justify-center items-center pointer-events-none">
        <span className="text-xs font-medium text-zinc-500 tracking-wide">
          Nezord Launcher
        </span>
      </div>
    </div>
  );
}
