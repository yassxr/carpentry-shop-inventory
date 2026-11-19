import { useNavigate } from "react-router-dom";
import { Icon, icons } from "../components/Icon";

const CARDS = [
  {
    path: "/finance/accomptes",
    icon: icons.dollar,
    title: "Accomptes",
    desc: "Gérer les versements et encaissements par affaire",
  },
  {
    path: "/finance/situation",
    icon: icons.list,
    title: "Situation Financière",
    desc: "Vue d'ensemble de la situation financière des projets",
  },
];

export default function FinancePage() {
  const navigate = useNavigate();

  return (
    <div>
      <div className="page-header">
        <h2>Finance</h2>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, maxWidth: 680 }}>
        {CARDS.map(card => (
          <button
            key={card.path}
            onClick={() => navigate(card.path)}
            style={{
              background: "var(--white)",
              border: "2px solid var(--sky-light)",
              borderRadius: "var(--radius)",
              padding: "36px 28px",
              cursor: "pointer",
              textAlign: "left",
              boxShadow: "var(--shadow)",
              transition: "border-color 0.15s, box-shadow 0.15s",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = "var(--sky)";
              e.currentTarget.style.boxShadow = "var(--shadow-lg)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = "var(--sky-light)";
              e.currentTarget.style.boxShadow = "var(--shadow)";
            }}
          >
            <div style={{ marginBottom: 14, color: "var(--sky)" }}>
              <Icon path={card.icon} size={38} />
            </div>
            <div style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 22, fontWeight: 700, color: "var(--navy)", marginBottom: 8,
            }}>
              {card.title}
            </div>
            <div style={{ fontSize: 13, color: "var(--gray-600)", lineHeight: 1.5 }}>
              {card.desc}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
