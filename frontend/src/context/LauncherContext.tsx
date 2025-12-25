import { createContext, useContext, ReactNode } from "react";
import { useLauncher } from "@/hooks/useLauncher";

const LauncherContext = createContext<ReturnType<typeof useLauncher> | null>(
  null,
);

export function LauncherProvider({ children }: { children: ReactNode }) {
  const launcher = useLauncher();

  return (
    <LauncherContext.Provider value={launcher}>
      {children}
    </LauncherContext.Provider>
  );
}

export function useLauncherContext() {
  const context = useContext(LauncherContext);
  if (!context) {
    throw new Error(
      "useLauncherContext must be used within a LauncherProvider",
    );
  }
  return context;
}
