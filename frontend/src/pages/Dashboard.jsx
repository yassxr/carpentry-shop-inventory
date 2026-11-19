import { useState, useEffect } from "react";
import api from "../services/api";

const today = () => new Date().toISOString().split("T")[0];

export default function Dashboard({ employes, projets }) {
  const [todayPoints, setTodayPoints] = useState([]);

  useEffect(() => {
    api.getPointagesByDate(today()).then(setTodayPoints).catch(() => {});
  }, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Tableau de Bord</h2>
          <div className="text-muted text-sm" style={{ marginTop: 4 }}>
            {new Date().toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </div>
        </div>
      </div>

      <div className="summary-cards">
        {[
          { value: employes.length,     label: "Employés actifs" },
          { value: projets.length,      label: "Projets" },
          { value: todayPoints.length,  label: "Pointés aujourd'hui" },
        ].map((c, i) => (
          <div key={i} className="summary-card">
            <div className="value">{c.value}</div>
            <div className="label">{c.label}</div>
          </div>
        ))}
      </div>

      {todayPoints.length > 0 && (
        <div className="card">
          <div className="card-header">Pointages d'aujourd'hui</div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Employé</th>
                  <th>Matin entrée</th>
                  <th>Matin sortie</th>
                  <th>AM entrée</th>
                  <th>AM sortie</th>
                </tr>
              </thead>
              <tbody>
                {todayPoints.map(p => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 600 }}>{p.employeNomComplet}</td>
                    <td>{p.matinHeureEntree || "—"}</td>
                    <td>{p.matinHeureSortie || "—"}</td>
                    <td>{p.apresMidiHeureEntree || "—"}</td>
                    <td>{p.apresMidiHeureSortie || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}