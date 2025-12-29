import { HashRouter, Routes, Route, Navigate } from "react-router-dom";

import { MainLayout } from "@/components/MainLayout";
import { HomePage } from "@/pages/Home";
import { SettingsPage } from "@/pages/Settings";
import { SetupWizardPage } from "@/pages/SetupWizard";
import { InstanceDetailPage } from "@/pages/InstanceDetail";
import { JSX } from "react";

function RequireSetup({ children }: { children: JSX.Element }) {
  const isSetup = localStorage.getItem("setup_completed") === "true";
  if (!isSetup) {
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
                  <Route
                    path="/instance/:id"
                    element={<InstanceDetailPage />}
                  />{" "}
                  {/* NEW */}
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </HashRouter>
          </LaunchProvider>
        </InstanceProvider>
      </SettingsProvider>
    </AccountProvider>
  );
}

export default App;
