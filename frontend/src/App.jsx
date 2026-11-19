import { useState, useEffect, useCallback } from "react";
import { HashRouter as BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import CSS from "./styles/globalStyles";
import Toast from "./components/Toast";
import Layout from "./components/Layout";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import PointagePage from "./pages/PointagePage";
import EmployesPage from "./pages/EmployesPage";
import ProjetsPage from "./pages/ProjetsPage";
import SalairePage from "./pages/SalairePage";
import SynthesePage from "./pages/SynthesePage";
import FinancePage from "./pages/FinancePage";
import AccomptePage from "./pages/AccomptePage";
import SituationFinancierePage from "./pages/SituationFinancierePage";
import ManagementPage from "./pages/ManagementPage";
import api from "./services/api";

const SESSION_TIMEOUT_MS = 8 * 60 * 60 * 1000; // 8 hours

function readValidSession() {
  try {
    const raw = sessionStorage.getItem("session");
    if (!raw) return null;
    const { role, loginAt } = JSON.parse(raw);
    if (Date.now() - loginAt > SESSION_TIMEOUT_MS) {
      sessionStorage.removeItem("session");
      return null;
    }
    return role;
  } catch {
    sessionStorage.removeItem("session");
    return null;
  }
}

export default function App() {
  const [employes, setEmployes] = useState([]);
  const [affaires, setAffaires] = useState([]);
  const [projets, setProjets]   = useState([]);
  const [toast, setToast]       = useState(null);
  const [userRole, setUserRole] = useState(() => readValidSession());

  const isAuthenticated = !!userRole;
  const showToast = (msg, type = "success") => setToast({ msg, type });

  const handleLogout = useCallback(() => {
    sessionStorage.removeItem("session");
    setUserRole(null);
  }, []);

  // Periodic check — expire the session if the tab was left open past the timeout
  useEffect(() => {
    if (!isAuthenticated) return;
    const id = setInterval(() => {
      if (!readValidSession()) handleLogout();
    }, 60 * 1000);
    return () => clearInterval(id);
  }, [isAuthenticated, handleLogout]);

  useEffect(() => {
    if (!isAuthenticated) return;
    Promise.all([api.getEmployes(), api.getAffaires(), api.getProjets()])
      .then(([e, a, p]) => { setEmployes(e); setAffaires(a); setProjets(p || []); });
  }, [isAuthenticated]);

  const handleLogin = (role) => setUserRole(role);

  return (
    <>
      <style>{CSS}</style>
      <BrowserRouter>
        {!isAuthenticated ? (
          <>
            <LoginPage onLogin={handleLogin} showToast={showToast} />
            {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
          </>
        ) : (
          <>
            <Routes>
              <Route element={<Layout onLogout={handleLogout} userRole={userRole} />}>
                <Route index element={<Navigate to={userRole === "admin" ? "/dashboard" : "/planning"} replace />} />

                {/* Admin-only routes — MOD redirected to /planning */}
                <Route path="/dashboard" element={
                  userRole === "admin"
                    ? <Dashboard employes={employes} projets={projets} />
                    : <Navigate to="/planning" replace />
                } />
                <Route path="/personnels" element={
                  userRole === "admin"
                    ? <EmployesPage employes={employes} setEmployes={setEmployes} showToast={showToast} userRole={userRole} />
                    : <Navigate to="/planning" replace />
                } />
                <Route path="/salaire" element={
                  userRole === "admin"
                    ? <SalairePage employes={employes} setEmployes={setEmployes} showToast={showToast} userRole={userRole} />
                    : <Navigate to="/planning" replace />
                } />
                <Route path="/synthese" element={
                  userRole === "admin"
                    ? <SynthesePage employes={employes} />
                    : <Navigate to="/planning" replace />
                } />
                <Route path="/finance" element={
                  userRole === "admin" ? <FinancePage /> : <Navigate to="/planning" replace />
                } />
                <Route path="/finance/accomptes" element={
                  userRole === "admin"
                    ? <AccomptePage projets={projets} affaires={affaires} showToast={showToast} />
                    : <Navigate to="/planning" replace />
                } />
                <Route path="/finance/situation" element={
                  userRole === "admin"
                    ? <SituationFinancierePage projets={projets} affaires={affaires} />
                    : <Navigate to="/planning" replace />
                } />
                <Route path="/management" element={
                  userRole === "admin"
                    ? <ManagementPage showToast={showToast} />
                    : <Navigate to="/planning" replace />
                } />

                {/* Shared routes */}
                <Route path="/projets" element={
                  <ProjetsPage
                    projets={projets} setProjets={setProjets}
                    affaires={affaires} setAffaires={setAffaires}
                    employes={employes}
                    showToast={showToast} userRole={userRole}
                  />
                } />
                <Route path="/planning" element={
                  <PointagePage
                    employes={employes} affaires={affaires}
                    projets={projets} showToast={showToast}
                  />
                } />

                <Route path="*" element={<Navigate to="/planning" replace />} />
              </Route>
            </Routes>
            {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
          </>
        )}
      </BrowserRouter>
    </>
  );
}
