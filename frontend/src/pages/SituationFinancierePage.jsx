import { useState } from "react";

const STAT_CARDS = [
  { etat: "en_instance",  label: "En instance",  color: "var(--gray-600)",  border: "var(--gray-400)" },
  { etat: "accorde",      label: "Accordé",       color: "var(--sky)",       border: "var(--sky)" },
  { etat: "en_execution", label: "En exécution",  color: "var(--green)",     border: "var(--green)" },
  { etat: "annule",       label: "Annulé",        color: "var(--red)",       border: "var(--red)" },
  { etat: "acheve",       label: "Achevé",        color: "var(--navy-mid)",  border: "var(--navy-mid)" },
];

function sumMontant(list, etat) {
  return list.filter(a => a.etat === etat).reduce((s, a) => s + Number(a.montant ?? 0), 0);
}

function fmtMontant(val) {
  return Number(val).toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " MAD";
}

export default function SituationFinancierePage({ projets, affaires }) {
  const [projetId, setProjetId] = useState("");

  const projetAffaires = affaires.filter(a => a.projetId === Number(projetId));
  const total = projetAffaires.reduce((s, a) => s + Number(a.montant ?? 0), 0);

  return (
    <div>
      <div className="page-header">
        <h2>Situation Financière</h2>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-body">
          <div className="form-group" style={{ maxWidth: 420 }}>
            <label>Projet</label>
            <select value={projetId} onChange={e => setProjetId(e.target.value)}>
              <option value="">— Sélectionner un projet —</option>
              {projets.map(p => (
                <option key={p.id} value={p.id}>{p.numeroSerie} — {p.nom}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {projetId && (
        <>
          <div style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "var(--gray-600)", marginBottom: 12 }}>
            Montants du projet
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: 16, marginBottom: 16 }}>
            {STAT_CARDS.map(({ etat, label, color, border }) => {
              const sum = sumMontant(projetAffaires, etat);
              const count = projetAffaires.filter(a => a.etat === etat).length;
              return (
                <div key={etat} className="card" style={{ borderTop: `3px solid ${border}` }}>
                  <div className="card-body">
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color, marginBottom: 10 }}>
                      {label}
                    </div>
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 26, fontWeight: 700, color: "var(--navy)" }}>
                      {fmtMontant(sum)}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--gray-400)", marginTop: 4 }}>
                      {count} affaire{count !== 1 ? "s" : ""}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ borderTop: "2px dashed var(--gray-200)", paddingTop: 16 }}>
            <div className="card" style={{ borderTop: "3px solid var(--navy)" }}>
              <div className="card-body" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "var(--navy)", marginBottom: 6 }}>
                    Montant total
                  </div>
                  <div style={{ fontSize: 12, color: "var(--gray-400)" }}>
                    {projetAffaires.length} affaire{projetAffaires.length !== 1 ? "s" : ""}
                  </div>
                </div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 36, fontWeight: 700, color: "var(--navy)" }}>
                  {fmtMontant(total)}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
