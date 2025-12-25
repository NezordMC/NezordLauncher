import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { LauncherProvider } from "@/context/LauncherContext";
import { MainLayout } from "@/layouts/MainLayout";
import { HomePage } from "@/pages/Home";
import { SettingsPage } from "@/pages/Settings";
import { SetupWizardPage } from "@/pages/SetupWizard";
import { JSX } from "react";


function RequireSetup({ children }: { children: JSX.Element }) {
  
  const isSetup = localStorage.getItem("setup_completed") === "true";

  
  if (!isSetup) {
    return <Navigate to="/setup" replace />;
  }

  
  return children;
}

function App() {
  return (
    <LauncherProvider>
      <HashRouter>
        <Routes>
          {}
          <Route path="/setup" element={<SetupWizardPage />} />

          {}
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

          {}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </LauncherProvider>
  );
}

export default App;
