import { useState, useEffect, useRef } from "react";
import { Icon, icons } from "../components/Icon";
import api from "../services/api";

const currentMonth = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

const fH = (h) => {
  if (!h || h === 0) return "—";
  return h % 1 === 0 ? `${h}h` : `${h.toFixed(2)}h`;
};

// ── Table row definitions ─────────────────────────────────────────────────────
const ROWS = [
  { id: "entree", label: "Heure d'entrée",     split: true,  matin: j => j.matinHeureEntree || "—",   apres: j => j.apresMidiHeureEntree || "—" },
  { id: "sortie", label: "Heure de sortie",    split: true,  matin: j => j.matinHeureSortie || "—",   apres: j => j.apresMidiHeureSortie || "—" },
  { id: "htrav",  label: "H. travaillées",     split: false, full: j => fH(j.heuresTravaillees) },
  { id: "hsupp",  label: "H. supplémentaires", split: false, full: j => fH(j.heuresSupplementaires) },
];

const S_LABEL_TH = {
  position: "sticky", left: 0, zIndex: 3,
  background: "var(--sky-bg)", minWidth: 162,
  textAlign: "left", borderRight: "2px solid var(--sky-light)",
};
const S_LABEL_TD = {
  position: "sticky", left: 0, zIndex: 1,
  background: "var(--sky-bg)",
  fontWeight: 600, color: "var(--navy-mid)",
  borderRight: "2px solid var(--sky-light)",
  whiteSpace: "nowrap",
};
const S_TOTAL_TH = {
  position: "sticky", right: 0, zIndex: 3,
  background: "var(--sky-bg)", minWidth: 72,
  textAlign: "center", borderLeft: "2px solid var(--sky-light)",
};
const S_TOTAL_TD = {
  position: "sticky", right: 0, zIndex: 1,
  background: "var(--sky-bg)",
  textAlign: "center", fontWeight: 700,
  borderLeft: "2px solid var(--sky-light)",
};

const dayBg = (j) => {
  if (j.weekend) return { background: "rgba(192,57,43,0.07)" };
  if (j.samedi)  return { background: "rgba(224,123,42,0.08)" };
  return {};
};

const rowStyle = (id) => {
  if (id === "hsupp") return { color: "var(--green)", fontWeight: 700 };
  return {};
};

// ── Bar chart (SVG) ───────────────────────────────────────────────────────────
function BarChart({ jours, getValue, color }) {
  const CHART_H = 110;
  const LABEL_H = 18;
  const H       = CHART_H + LABEL_H;
  const barW    = Math.max(8, Math.min(22, 640 / jours.length));
  const gap     = 3;
  const W       = jours.length * (barW + gap) + gap;
  const values  = jours.map(getValue);
  const max     = Math.max(...values, 0.1);

  return (
    <div style={{ overflowX: "auto" }}>
      <svg width={W} height={H} style={{ display: "block" }}>
        {jours.map((j, i) => {
          const v   = values[i];
          const bH  = v > 0 ? Math.max((v / max) * CHART_H, 3) : 1;
          const x   = gap + i * (barW + gap);
          const y   = CHART_H - bH;
          return (
            <g key={j.date}>
              <title>{`${j.date.split("-")[2]} ${j.jourSemaine || ""}: ${v > 0 ? v.toFixed(2) + "h" : "—"}`}</title>
              <rect x={x} y={y} width={barW} height={bH}
                fill={j.weekend ? "var(--gray-200)" : v > 0 ? color : "rgba(0,0,0,0.05)"}
                rx={2}
              />
              <text x={x + barW / 2} y={H - 2} textAnchor="middle"
                fontSize={8} fontFamily="Barlow, sans-serif"
                fill={j.weekend ? "rgba(192,57,43,0.45)" : j.samedi ? "rgba(224,123,42,0.6)" : "var(--gray-400)"}>
                {j.date.split("-")[2]}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ── Presence calendar ─────────────────────────────────────────────────────────
function PresenceCalendar({ jours }) {
  if (!jours.length) return null;
  const firstDay = new Date(jours[0].date + "T12:00:00");
  const startCol = (firstDay.getDay() + 6) % 7; // Mon = 0
  const DOW      = ["Lu", "Ma", "Me", "Je", "Ve", "Sa", "Di"];
  const cells    = [...Array(startCol).fill(null), ...jours];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div style={{ maxWidth: 400 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 5 }}>
        {DOW.map(d => (
          <div key={d} style={{ textAlign: "center", fontSize: 9, fontWeight: 700, color: "var(--gray-400)", paddingBottom: 4, letterSpacing: "0.5px" }}>
            {d}
          </div>
        ))}
        {cells.map((j, i) => {
          if (!j) return <div key={`e${i}`} />;
          const worked  = j.heuresTravaillees > 0;
          const isSun   = j.weekend;
          const isSat   = j.samedi;
          const tooltip = isSun ? "Dimanche" : worked ? `${j.heuresTravaillees.toFixed(2)}h travaillées${isSat ? " (Sam)" : ""}` : isSat ? "Samedi — absent" : "Absent";
          return (
            <div
              key={j.date}
              title={`${j.date}: ${tooltip}`}
              style={{
                aspectRatio: "1",
                borderRadius: 4,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 600, cursor: "default",
                background: isSun  ? "var(--gray-100)"
                          : worked ? "rgba(46,139,87,0.14)"
                          :          "rgba(192,57,43,0.08)",
                color: isSun  ? "var(--gray-400)"
                     : worked ? "var(--green)"
                     :          "var(--red)",
                border: `1px solid ${
                  isSun  ? "var(--gray-200)"
                : worked ? "rgba(46,139,87,0.28)"
                :          "rgba(192,57,43,0.18)"
                }`,
              }}
            >
              {j.date.split("-")[2]}
            </div>
          );
        })}
      </div>
      {/* Legend */}
      <div style={{ display: "flex", gap: 16, marginTop: 12, fontSize: 11, color: "var(--gray-600)", flexWrap: "wrap" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: "rgba(46,139,87,0.14)", border: "1px solid rgba(46,139,87,0.28)", display: "inline-block" }} />
          Présent
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: "rgba(192,57,43,0.08)", border: "1px solid rgba(192,57,43,0.18)", display: "inline-block" }} />
          Absent
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: "var(--gray-100)", border: "1px solid var(--gray-200)", display: "inline-block" }} />
          Dimanche
        </span>
      </div>
    </div>
  );
}

// ── Stat card definitions ─────────────────────────────────────────────────────
const STAT_CARDS = [
  { id: "jours",    label: "Jours travaillés",    color: "var(--sky)",      chartLabel: "Calendrier de présence" },
  { id: "htrav",    label: "H. Travaillées",       color: "var(--navy-mid)", chartLabel: "Heures travaillées par jour" },
  { id: "hsupp",    label: "H. Supplémentaires",   color: "var(--green)",    chartLabel: "Heures supplémentaires par jour" },
  { id: "presence", label: "Taux de présence",     color: "var(--orange)",   chartLabel: "Calendrier de présence" },
];

// ── Page ─────────────────────────────────────────────────────────────────────
export default function SynthesePage({ employes }) {
  const [employeId, setEmployeId] = useState("");
  const [mois, setMois]           = useState(currentMonth);
  const [jours, setJours]         = useState([]);
  const [loading, setLoading]     = useState(false);
  const [activeCard, setActiveCard] = useState(null);

  const tableWrapRef = useRef(null);
  const topBarRef    = useRef(null);
  const [tableScrollWidth, setTableScrollWidth] = useState(0);

  const employe = employes.find(e => e.id === Number(employeId));

  useEffect(() => {
    if (!employeId || !mois) { setJours([]); return; }
    setLoading(true);
    api.getSalaireMensuel(employeId, mois)
      .then(d => setJours(d || []))
      .catch(() => setJours([]))
      .finally(() => setLoading(false));
  }, [employeId, mois]);

  useEffect(() => {
    if (tableWrapRef.current) setTableScrollWidth(tableWrapRef.current.scrollWidth);
  }, [jours]);

  const onTopBarScroll = () => {
    if (tableWrapRef.current && topBarRef.current)
      tableWrapRef.current.scrollLeft = topBarRef.current.scrollLeft;
  };
  const onTableScroll = () => {
    if (topBarRef.current && tableWrapRef.current)
      topBarRef.current.scrollLeft = tableWrapRef.current.scrollLeft;
  };

  // ── Derived stats ──────────────────────────────────────────────────────────
  const totalTrav      = jours.reduce((s, j) => s + j.heuresTravaillees, 0);
  const totalSupp      = jours.reduce((s, j) => s + j.heuresSupplementaires, 0);
  const joursOuvrables = jours.filter(j => !j.weekend).length;   // Mon–Sat
  const joursTrav      = jours.filter(j => j.heuresTravaillees > 0).length;
  const tauxPresence   = joursOuvrables > 0 ? Math.round((joursTrav / joursOuvrables) * 100) : 0;

  const statValues = {
    jours:    `${joursTrav} / ${joursOuvrables}`,
    htrav:    fH(totalTrav),
    hsupp:    fH(totalSupp),
    presence: `${tauxPresence}%`,
  };

  const getTotal = (id) => {
    if (id === "htrav") return fH(totalTrav);
    if (id === "hsupp") return fH(totalSupp);
    return "";
  };

  const handleCardClick = (id) => setActiveCard(prev => prev === id ? null : id);
  const activeStatCard = STAT_CARDS.find(c => c.id === activeCard);

  const hasData = !loading && jours.length > 0;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Synthèse</h2>
          <div className="text-muted text-sm" style={{ marginTop: 4 }}>Analyse détaillée du pointage par employé et par mois</div>
        </div>
      </div>

      {/* ── Sélecteurs ─────────────────────────────────── */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-body">
          <div className="form-row" style={{ alignItems: "flex-end", flexWrap: "wrap", gap: 12 }}>
            <div className="form-group" style={{ flex: 2, minWidth: 200 }}>
              <label>Employé</label>
              <select value={employeId} onChange={e => { setEmployeId(e.target.value); setActiveCard(null); }}>
                <option value="">— Sélectionner un employé —</option>
                {employes.map(e => (
                  <option key={e.id} value={e.id}>{e.prenom} {e.nom}</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ maxWidth: 200 }}>
              <label>Mois</label>
              <input type="month" value={mois} onChange={e => { setMois(e.target.value); setActiveCard(null); }} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Loading ─────────────────────────────────────── */}
      {loading && (
        <div style={{ padding: 32, textAlign: "center" }} className="text-muted">Chargement…</div>
      )}

      {/* ── Empty prompt ─────────────────────────────────── */}
      {!loading && !employeId && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-body" style={{ textAlign: "center", padding: "48px 0", color: "var(--gray-400)", fontSize: 14 }}>
            Sélectionnez un employé et un mois pour afficher la synthèse
          </div>
        </div>
      )}

      {/* ── No data ──────────────────────────────────────── */}
      {!loading && employeId && jours.length === 0 && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-body" style={{ textAlign: "center", padding: "32px 0", color: "var(--gray-400)" }}>
            Aucune donnée pour ce mois
          </div>
        </div>
      )}

      {/* ── Stats + table ────────────────────────────────── */}
      {hasData && (
        <>
          {/* Clickable stat cards */}
          <div className="summary-cards" style={{ marginBottom: 16 }}>
            {STAT_CARDS.map(card => {
              const isActive = activeCard === card.id;
              return (
                <div
                  key={card.id}
                  className="summary-card"
                  onClick={() => handleCardClick(card.id)}
                  style={{
                    borderTopColor: card.color,
                    cursor: "pointer",
                    outline: isActive ? `2px solid ${card.color}` : "2px solid transparent",
                    boxShadow: isActive ? "0 4px 16px rgba(0,0,0,0.14)" : "var(--shadow)",
                    transform: isActive ? "translateY(-2px)" : "none",
                    transition: "all 0.15s",
                    userSelect: "none",
                  }}
                >
                  <div className="value" style={{ color: isActive ? card.color : "var(--navy)", fontSize: 28 }}>
                    {statValues[card.id]}
                  </div>
                  <div className="label">{card.label}</div>
                  <div style={{ marginTop: 6, fontSize: 10, color: isActive ? card.color : "var(--gray-400)", fontWeight: 500 }}>
                    {isActive ? "▲ masquer" : "▼ voir graphique"}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Chart panel */}
          {activeCard && activeStatCard && (
            <div className="card" style={{ marginBottom: 16 }}>
              <div className="card-header">
                <span>
                  <Icon path={icons.list} size={15} />
                  {" "}{activeStatCard.chartLabel} — {employe ? `${employe.prenom} ${employe.nom}` : ""} — {mois}
                </span>
                <button
                  onClick={() => setActiveCard(null)}
                  style={{ background: "none", border: "none", color: "rgba(255,255,255,0.7)", cursor: "pointer", fontSize: 20, lineHeight: 1, padding: "0 2px" }}
                  title="Fermer"
                >
                  ×
                </button>
              </div>
              <div className="card-body">
                {activeCard === "htrav" && (
                  <BarChart jours={jours} getValue={j => j.heuresTravaillees} color="var(--sky)" />
                )}
                {activeCard === "hsupp" && (
                  <BarChart jours={jours} getValue={j => j.heuresSupplementaires} color="var(--green)" />
                )}
                {(activeCard === "jours" || activeCard === "presence") && (
                  <PresenceCalendar jours={jours} />
                )}
              </div>
            </div>
          )}

          {/* Pointage table */}
          <div className="card">
            <div className="card-header">
              <span>
                <Icon path={icons.clock} size={16} />
                {" "}Pointage — {employe ? `${employe.prenom} ${employe.nom}` : ""} — {mois}
              </span>
            </div>
            <div className="table-top-scroll" ref={topBarRef} onScroll={onTopBarScroll}>
              <div style={{ width: tableScrollWidth, height: 1 }} />
            </div>
            <div className="table-h-scroll" ref={tableWrapRef} onScroll={onTableScroll}>
              <table style={{ width: "max-content" }}>
                <thead>
                  <tr>
                    <th rowSpan={2} style={S_LABEL_TH}>Rubrique</th>
                    {jours.map(j => (
                      <th key={j.date} colSpan={2} style={{
                        textAlign: "center", minWidth: 74,
                        borderLeft: "1px solid var(--gray-200)",
                        ...dayBg(j),
                        opacity: j.weekend ? 0.55 : 1,
                      }}>
                        {j.date.split("-")[2]}
                        <span style={{ marginLeft: 3, fontSize: 9, fontWeight: 400, opacity: 0.7 }}>
                          {j.jourSemaine}
                        </span>
                      </th>
                    ))}
                    <th rowSpan={2} style={S_TOTAL_TH}>Total</th>
                  </tr>
                  <tr>
                    {jours.flatMap(j => [
                      <th key={`${j.date}-m`}  style={{ textAlign: "center", fontSize: 11, borderLeft: "1px solid var(--gray-200)", ...dayBg(j) }}>M</th>,
                      <th key={`${j.date}-pm`} style={{ textAlign: "center", fontSize: 11, ...dayBg(j) }}>S</th>,
                    ])}
                  </tr>
                </thead>
                <tbody>
                  {ROWS.map(row => (
                    <tr key={row.id}>
                      <td style={S_LABEL_TD}>{row.label}</td>
                      {row.split
                        ? jours.flatMap(j => [
                            <td key={`${j.date}-m`}  style={{ textAlign: "center", whiteSpace: "nowrap", borderLeft: "1px solid var(--gray-200)", ...dayBg(j), ...rowStyle(row.id) }}>{row.matin(j)}</td>,
                            <td key={`${j.date}-pm`} style={{ textAlign: "center", whiteSpace: "nowrap", ...dayBg(j), ...rowStyle(row.id) }}>{row.apres(j)}</td>,
                          ])
                        : jours.map(j => (
                            <td key={j.date} colSpan={2} style={{ textAlign: "center", whiteSpace: "nowrap", borderLeft: "1px solid var(--gray-200)", ...dayBg(j), ...rowStyle(row.id) }}>
                              {row.full(j)}
                            </td>
                          ))
                      }
                      <td style={{ ...S_TOTAL_TD, ...rowStyle(row.id) }}>{getTotal(row.id)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
