import { useState } from "react";
import { NavLink, useLocation, Outlet } from "react-router-dom";
import { Icon, icons } from "./Icon";

const DRH_ITEMS = [
  { path: "/personnels", label: "Personnels" },
  { path: "/salaire",    label: "Salaires" },
];

const DASHBOARD_ITEM    = { path: "/dashboard",   label: "Tableau de Bord",    icon: icons.home };
const MANAGEMENT_ITEM   = { path: "/management",  label: "Gestion",            icon: icons.shield };

const SHARED_ITEMS = [
  { path: "/projets",  label: "Projets",  icon: icons.layers },
  { path: "/planning", label: "Planning", icon: icons.clock },
];

const ADMIN_ONLY_ITEMS = [
  { path: "/synthese", label: "Synthèse", icon: icons.list },
  { path: "/finance",  label: "Finance",  icon: icons.dollar },
];

// Sub-pages listed with full paths so startsWith lookup finds them before the shorter parent
const ALL_ITEMS_SORTED = [
  DASHBOARD_ITEM,
  ...DRH_ITEMS,
  ...SHARED_ITEMS,
  ...ADMIN_ONLY_ITEMS,
  MANAGEMENT_ITEM,
  { path: "/finance/accomptes", label: "Accomptes" },
  { path: "/finance/situation", label: "Situation Financière" },
].sort((a, b) => b.path.length - a.path.length);

export default function Layout({ onLogout, userRole }) {
  const location  = useLocation();
  const isAdmin   = userRole === "admin";
  const isDrhActive = DRH_ITEMS.some(n => location.pathname.startsWith(n.path));
  const [drhOpen, setDrhOpen] = useState(isDrhActive);

  const current = ALL_ITEMS_SORTED.find(n => location.pathname.startsWith(n.path));

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-logo" style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "20px 16px 16px" }}>
          <img src="./all.png" alt="Logo" style={{ height: 150 }} />
        </div>

        <nav className="nav">
          {/* Dashboard — admin only */}
          {isAdmin && (
            <NavLink
              to={DASHBOARD_ITEM.path}
              className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}
            >
              <Icon path={DASHBOARD_ITEM.icon} size={17} />
              {DASHBOARD_ITEM.label}
            </NavLink>
          )}

          {/* DRH collapsible — admin only */}
          {isAdmin && (
            <>
              <button
                onClick={() => setDrhOpen(o => !o)}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  width: "100%", background: "none", border: "none", cursor: "pointer",
                  padding: "11px 20px",
                  color: isDrhActive ? "var(--white)" : "var(--sky-light)",
                  fontSize: 14, fontWeight: 500, fontFamily: "inherit",
                  borderLeft: `3px solid ${isDrhActive ? "var(--sky)" : "transparent"}`,
                  backgroundColor: isDrhActive ? "rgba(74,158,202,0.2)" : "transparent",
                  transition: "background 0.15s",
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Icon path={icons.users} size={17} /> DRH
                </span>
                <span style={{
                  transform: drhOpen ? "rotate(0deg)" : "rotate(-90deg)",
                  transition: "transform 0.2s ease",
                  display: "flex", opacity: 0.7,
                }}>
                  <Icon path={icons.chevronDown} size={13} />
                </span>
              </button>

              <div style={{
                overflow: "hidden",
                maxHeight: drhOpen ? `${DRH_ITEMS.length * 42}px` : 0,
                transition: "max-height 0.25s ease",
              }}>
                <div style={{ position: "relative" }}>
                  <div style={{
                    position: "absolute", left: 28, top: 0, bottom: 0,
                    width: 1, background: "rgba(74,158,202,0.25)",
                  }} />
                  {DRH_ITEMS.map(item => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}
                      style={({ isActive }) => ({
                        paddingLeft: 36, paddingTop: 11, paddingBottom: 11,
                        fontSize: 13, fontWeight: 400,
                        color: isActive ? "var(--white)" : "rgba(184,221,240,0.75)",
                        letterSpacing: 0,
                      })}
                    >
                      {item.label}
                    </NavLink>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Shared items (Projets, Planning) — all roles */}
          {SHARED_ITEMS.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}
            >
              <Icon path={item.icon} size={17} />
              {item.label}
            </NavLink>
          ))}

          {/* Admin-only items (Synthèse, Finance, Gestion) */}
          {isAdmin && ADMIN_ONLY_ITEMS.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}
            >
              <Icon path={item.icon} size={17} />
              {item.label}
            </NavLink>
          ))}

          {isAdmin && (
            <NavLink
              to={MANAGEMENT_ITEM.path}
              className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}
            >
              <Icon path={MANAGEMENT_ITEM.icon} size={17} />
              {MANAGEMENT_ITEM.label}
            </NavLink>
          )}
        </nav>

        <div style={{ padding: "12px 20px 16px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: 1 }}>
            <br />ALL MENUISERIE V1.0
          </div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="flex justify-between items-center" style={{ width: "100%" }}>
            <div>
              <div className="topbar-title">{current?.label ?? ""}</div>
              <div className="topbar-sub">Gestion de chantier — Pointage horaire</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{
                fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px",
                padding: "3px 8px", borderRadius: 4,
                background: isAdmin ? "rgba(74,158,202,0.15)" : "rgba(180,180,180,0.18)",
                color: isAdmin ? "var(--sky)" : "var(--gray-400)",
              }}>
                {isAdmin ? "Admin" : "Mod"}
              </span>
              <button className="btn btn-ghost btn-sm" onClick={onLogout} style={{ color: "var(--navy)" }}>
                Déconnexion
              </button>
            </div>
          </div>
        </header>
        <div className="content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
