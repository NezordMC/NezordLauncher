import { Console } from "./components/Console";
import { LauncherForm } from "./components/LauncherForm";
import { useLauncher } from "./hooks/useLauncher";

function App() {
  const {
    isLaunching,
    logs,
    launch,
    accounts,
    activeAccount,
    addOfflineAccount,
    loginElyBy,
    switchAccount,
    minecraftVersions,
    fetchModloaders,
  } = useLauncher();

  return (
    <div className="flex flex-col items-center justify-center w-screen h-screen font-sans text-white bg-zinc-950 relative overflow-hidden p-6">
      <div className="absolute top-0 left-0 w-full h-8 app-drag z-50 bg-transparent"></div>

      <div className="w-full max-w-md space-y-6 z-10 flex flex-col h-full justify-center">
        <div className="text-center space-y-2 select-none cursor-default">
          <h1 className="text-5xl font-extrabold tracking-tighter text-white">
            NEZORD
          </h1>
          <div className="h-px w-24 bg-zinc-800 mx-auto"></div>
        </div>

        <LauncherForm
          onLaunch={launch}
          isLaunching={isLaunching}
          accounts={accounts}
          activeAccount={activeAccount}
          onAddAccount={addOfflineAccount}
          onLoginElyBy={loginElyBy}
          onSwitchAccount={switchAccount}
          minecraftVersions={minecraftVersions}
          fetchModloaders={fetchModloaders}
        />

        <div className="flex-grow max-h-48 min-h-[150px]">
          <Console logs={logs} />
        </div>
      </div>

      <div className="absolute bottom-4 text-[10px] text-zinc-800 font-mono select-none">
        v1.0.0
      </div>
    </div>
  );
}

export default App;
