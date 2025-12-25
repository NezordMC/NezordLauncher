import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { LauncherProvider } from "@/context/LauncherContext";
import { MainLayout } from "@/layouts/MainLayout";
import { HomePage } from "@/pages/Home";
import { SettingsPage } from "@/pages/Settings";
import { SetupWizardPage } from "@/pages/SetupWizard";

function App() {
  return (
    <LauncherProvider>
      <HashRouter>
        <Routes>
          <Route path="/setup" element={<SetupWizardPage />} />

          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </LauncherProvider>
  );
}

export default App;
