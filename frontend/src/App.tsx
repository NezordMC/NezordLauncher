import { HashRouter, Routes, Route, Navigate } from "react-router-dom";

import { MainLayout } from "@/components/MainLayout";
import { HomePage } from "@/pages/Home";
import { SettingsPage } from "@/pages/Settings";
import { SetupWizardPage } from "@/pages/SetupWizard";
import { JSX } from "react";
import { ErrorBoundary } from "@/components/ErrorBoundary";

import { useAccountStore } from "@/stores/accountStore";

function RequireSetup({ children }: { children: JSX.Element }) {
  const { isInitialized, accounts } = useAccountStore();
  const isSetupCached = localStorage.getItem("setup_completed") === "true";

  if (!isInitialized) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-zinc-950 text-zinc-500">
        Loading resources...
      </div>
    );
  }

  if (!isSetupCached || accounts.length === 0) {
    return <Navigate to="/setup" replace />;
  }

  return children;
}

import { AccountProvider } from "@/stores/accountStore";
import { InstanceProvider } from "@/stores/instanceStore";
import { LaunchProvider } from "@/stores/launchStore";
import { SettingsProvider } from "@/stores/settingStore";

function App() {
  return (
    <AccountProvider>
      <SettingsProvider>
        <InstanceProvider>
          <LaunchProvider>
            <ErrorBoundary>
              <HashRouter>
                <Routes>
                  <Route path="/setup" element={<SetupWizardPage />} />

                  <Route
                    element={
                      <RequireSetup>
                        <MainLayout />
                      </RequireSetup>
                    }
                  >
                    <Route path="/" element={<HomePage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                  </Route>

                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </HashRouter>
            </ErrorBoundary>
          </LaunchProvider>
        </InstanceProvider>
      </SettingsProvider>
    </AccountProvider>
  );
}

export default App;
