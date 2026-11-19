import { useState, useEffect } from "react";
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

export default function SalairePage({ employes, setEmployes, showToast, userRole }) {
  const canEdit = userRole === "admin";
  const [employeId, setEmployeId] = useState("");
  const [mois, setMois]           = useState(currentMonth);
  const [jours, setJours]         = useState([]);
  const [loading, setLoading]     = useState(false);
  const [tarifEdit, setTarifEdit] = useState("");
  const [editingTarif, setEditingTarif] = useState(false);

  const employe = employes.find(e => e.id === Number(employeId));

  useEffect(() => {
    if (employe) setTarifEdit(employe.tarifHoraire != null ? String(employe.tarifHoraire) : "");
    else         setTarifEdit("");
    setEditingTarif(false);
  }, [employe?.id]);

  useEffect(() => {
    if (!employeId || !mois) { setJours([]); return; }
    setLoading(true);
    api.getSalaireMensuel(employeId, mois)
      .then(d => setJours(d || []))
      .catch(() => setJours([]))
      .finally(() => setLoading(false));
  }, [employeId, mois]);

  const totalTrav = jours.reduce((s, j) => s + j.heuresTravaillees, 0);
  const totalRegl = jours.reduce((s, j) => s + j.heuresReglementaires, 0);
  const totalSupp = jours.reduce((s, j) => s + j.heuresSupplementaires, 0);
  const tarif     = employe?.tarifHoraire;
  const salaire   = tarif ? totalTrav * tarif : null;

  const handleSaveTarif = async () => {
    if (!employe) return;
    try {
      const updated = await api.updateEmploye(employe.id, { ...employe, tarifHoraire: Number(tarifEdit) });
      setEmployes(prev => prev.map(e => e.id === updated.id ? updated : e));
      showToast("Tarif mis à jour", "success");
      setEditingTarif(false);
    } catch {
      showToast("Erreur lors de la mise à jour", "error");
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Fiche de Salaire</h2>
          <div className="text-muted text-sm" style={{ marginTop: 4 }}>Récapitulatif mensuel de pointage</div>
        </div>
      </div>

      {/* ── Sélecteurs ─────────────────────────────────── */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-body">
          <div className="form-row" style={{ alignItems: "flex-end", flexWrap: "wrap", gap: 12 }}>
            <div className="form-group" style={{ flex: 2, minWidth: 200 }}>
              <label>Employé</label>
              <select value={employeId} onChange={e => setEmployeId(e.target.value)}>
                <option value="">— Sélectionner un employé —</option>
                {employes.map(e => (
                  <option key={e.id} value={e.id}>{e.prenom} {e.nom}</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ maxWidth: 200 }}>
              <label>Mois</label>
              <input type="month" value={mois} onChange={e => setMois(e.target.value)} />
            </div>
            {employe && (
              <div className="form-group" style={{ maxWidth: 240 }}>
                <label>Tarif horaire (MAD/h)</label>
                {editingTarif ? (
                  <div style={{ display: "flex", gap: 6 }}>
                    <input type="number" step="0.01" min="0" value={tarifEdit}
                      onChange={e => setTarifEdit(e.target.value)} style={{ flex: 1 }} />
                    <button className="btn btn-success btn-sm" onClick={handleSaveTarif}>
                      <Icon path={icons.check} size={13} />
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={() => setEditingTarif(false)}>
                      <Icon path={icons.x} size={13} />
                    </button>
                  </div>
                ) : (
                  <div style={{ display: "flex", gap: 8, alignItems: "center", height: 38 }}>
                    <span style={{ fontWeight: 600, fontSize: 15, color: "var(--navy)" }}>
                      {tarif ? `${tarif} MAD/h` : <span className="text-muted">Non défini</span>}
                    </span>
                    {canEdit && (
                      <button className="btn btn-ghost btn-sm" onClick={() => setEditingTarif(true)} title="Modifier">
                        <Icon path={icons.edit} size={13} />
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {employeId && mois && loading && (
        <div style={{ padding: 32, textAlign: "center" }} className="text-muted">Chargement…</div>
      )}

      {employeId && mois && !loading && jours.length === 0 && (
        <div className="card">
          <div className="card-body" style={{ textAlign: "center", padding: "32px 0", color: "var(--gray-400)" }}>
            Aucune donnée pour ce mois
          </div>
        </div>
      )}

      {/* ── Bilan mensuel ──────────────────────────────── */}
      {employeId && mois && !loading && jours.length > 0 && (
        <div className="card">
          <div className="card-header">
            <span><Icon path={icons.dollar} size={16} /> Bilan mensuel</span>
          </div>
          <div className="card-body">
            <div className="summary-cards" style={{ marginBottom: 0 }}>
              <div className="summary-card">
                <div className="value">{fH(totalTrav)}</div>
                <div className="label">H. Travaillées</div>
              </div>
              <div className="summary-card" style={{ borderTopColor: "var(--gray-400)" }}>
                <div className="value" style={{ fontSize: 28 }}>{fH(totalRegl)}</div>
                <div className="label">H. Réglementaires</div>
              </div>
              <div className="summary-card" style={{ borderTopColor: totalSupp > 0 ? "var(--green)" : "var(--gray-400)" }}>
                <div className="value" style={{ fontSize: 28, color: totalSupp > 0 ? "var(--green)" : "var(--navy)" }}>
                  {fH(totalSupp)}
                </div>
                <div className="label">H. Supplémentaires</div>
              </div>
              <div className="summary-card" style={{ borderTopColor: salaire != null ? "var(--orange)" : "var(--gray-400)" }}>
                <div className="value" style={{ fontSize: salaire != null ? 22 : 28, color: salaire != null ? "var(--orange)" : "var(--navy)" }}>
                  {salaire != null ? `${salaire.toFixed(2)} MAD` : "—"}
                </div>
                <div className="label">{tarif ? `Salaire · ${tarif} MAD/h` : "Salaire (tarif non défini)"}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
