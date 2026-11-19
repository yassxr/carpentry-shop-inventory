import { useState, useEffect, useCallback } from "react";
import { Icon, icons } from "../components/Icon";
import api from "../services/api";

const today = () => new Date().toISOString().split("T")[0];

const formatTime = (timeString) => {
  if (!timeString) return "";
  if (typeof timeString === 'string') {
    if (timeString.includes('T')) {
      return timeString.split('T')[1].substring(0, 5);
    }
    return timeString.substring(0, 5);
  }
  return timeString;
};

const EMPTY_FORM = {
  matinHeureEntree: "", matinHeureSortie: "",
  apresMidiHeureEntree: "", apresMidiHeureSortie: "",
};

const EMPTY_PLAGE = { projetId: "", affaireId: "", lieuTravailType: "", heureDebut: "", heureFin: "", commentaire: "" };

export default function PointagePage({ employes, affaires, projets = [], showToast }) {
  const [date, setDate] = useState(today());
  const [employeId, setEmployeId] = useState("");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [dayPointages, setDayPointages] = useState([]);
  const [currentPointage, setCurrentPointage] = useState(null);

  const [plages, setPlages] = useState({ matin: [], apresmidi: [] });

  const [modal, setModal] = useState(null);
  const [modalForm, setModalForm] = useState(EMPTY_PLAGE);

  const loadDayPointages = useCallback(async () => {
    if (!date) return;
    try { setDayPointages(await api.getPointagesByDate(date)); }
    catch { setDayPointages([]); }
  }, [date]);

  useEffect(() => { loadDayPointages(); }, [loadDayPointages]);

  useEffect(() => {
    if (!date || !employeId) {
      setForm(EMPTY_FORM);
      setCurrentPointage(null);
      setPlages({ matin: [], apresmidi: [] });
      return;
    }
    api.getPointageByEmployeDate(Number(employeId), date)
      .then(p => {
        if (!p) {
          setForm(EMPTY_FORM);
          setCurrentPointage(null);
          setPlages({ matin: [], apresmidi: [] });
          return;
        }
        setCurrentPointage(p);
        const newForm = {
          matinHeureEntree: p.matinHeureEntree || "",
          matinHeureSortie: p.matinHeureSortie || "",
          apresMidiHeureEntree: p.apresMidiHeureEntree || "",
          apresMidiHeureSortie: p.apresMidiHeureSortie || "",
        };
        setForm(newForm);
        if (p.plagesHoraires) {
          setPlages({
            matin: p.plagesHoraires.filter(pl => pl.periode === "MATIN"),
            apresmidi: p.plagesHoraires.filter(pl => pl.periode === "APRES_MIDI"),
          });
        }
      })
      .catch(() => {
        setForm(EMPTY_FORM);
        setCurrentPointage(null);
        setPlages({ matin: [], apresmidi: [] });
      });
  }, [date, employeId]);

  const buildPayload = () => ({
    datePointage: date,
    employeId: Number(employeId),
    matinHeureEntree: form.matinHeureEntree || null,
    matinHeureSortie: form.matinHeureSortie || null,
    apresMidiHeureEntree: form.apresMidiHeureEntree || null,
    apresMidiHeureSortie: form.apresMidiHeureSortie || null,
    plagesHoraires: [
      ...plages.matin.map((p) => ({
        affaireId: p.affaireId ? Number(p.affaireId) : null,
        lieuTravailType: p.lieuTravailType || null,
        heureDebut: p.heureDebut ? `${date}T${p.heureDebut}:00` : null,
        heureFin: p.heureFin ? `${date}T${p.heureFin}:00` : null,
        commentaire: p.commentaire || "",
        periode: "MATIN",
      })),
      ...plages.apresmidi.map((p) => ({
        affaireId: p.affaireId ? Number(p.affaireId) : null,
        lieuTravailType: p.lieuTravailType || null,
        heureDebut: p.heureDebut ? `${date}T${p.heureDebut}:00` : null,
        heureFin: p.heureFin ? `${date}T${p.heureFin}:00` : null,
        commentaire: p.commentaire || "",
        periode: "APRES_MIDI",
      })),
    ],
  });

  const handleSave = async () => {
    if (!date || !employeId) { showToast("Sélectionnez une date et un employé", "error"); return; }
    setSaving(true);
    try {
      const saved = await api.savePointage(buildPayload());
      if (saved?.id) setCurrentPointage(saved);
      showToast("Pointage enregistré", "success");
      loadDayPointages();
    } catch { showToast("Erreur lors de l'enregistrement", "error"); }
    finally { setSaving(false); }
  };

  const f = (key) => (e) => setForm(prev => ({ ...prev, [key]: e.target.value }));

  const openAddModal = (periode) => {
    setModalForm(EMPTY_PLAGE);
    setModal({ periode, mode: "add" });
  };

  const openEditModal = (periode, plage) => {
    const affaire = plage.affaireId ? affaires.find(a => a.id === Number(plage.affaireId)) : null;
    setModalForm({
      projetId: affaire?.projetId ? String(affaire.projetId) : "",
      affaireId: plage.affaireId ? String(plage.affaireId) : "",
      lieuTravailType: plage.lieuTravailType || "",
      heureDebut: formatTime(plage.heureDebut) || "",
      heureFin: formatTime(plage.heureFin) || "",
      commentaire: plage.commentaire || "",
    });
    setModal({ periode, mode: "edit", plageId: plage.id, plage });
  };

  const closeModal = () => { setModal(null); setModalForm(EMPTY_PLAGE); };

  const handleModalSave = async () => {
    const affaireId = Number(modalForm.affaireId);
    if (!affaireId) { showToast("Sélectionnez une affaire", "error"); return; }
    if (!modalForm.heureDebut || !modalForm.heureFin) { showToast("Renseignez les heures", "error"); return; }

    if (modal.mode === "add") {
      const newPlage = {
        affaireId: affaireId,
        lieuTravailType: modalForm.lieuTravailType || null,
        heureDebut: modalForm.heureDebut,
        heureFin: modalForm.heureFin,
        commentaire: modalForm.commentaire,
        periode: modal.periode === "matin" ? "MATIN" : "APRES_MIDI",
      };
      setPlages(prev => ({
        ...prev,
        [modal.periode]: [...prev[modal.periode], newPlage]
      }));
      showToast("Plage horaire ajoutée", "success");
    } else {
      const updatedPlages = { ...plages };
      const periodKey = modal.periode;
      updatedPlages[periodKey] = updatedPlages[periodKey].map(p =>
        p.id === modal.plageId ? {
          ...p,
          affaireId: affaireId,
          lieuTravailType: modalForm.lieuTravailType || null,
          heureDebut: modalForm.heureDebut,
          heureFin: modalForm.heureFin,
          commentaire: modalForm.commentaire,
        } : p
      );
      setPlages(updatedPlages);
      showToast("Plage horaire mise à jour", "success");
    }
    closeModal();
  };

  const handleDeletePlage = (periode, plage) => {
    setPlages(prev => ({
      ...prev,
      [periode]: prev[periode].filter(p => p.id !== plage.id)
    }));
    showToast("Plage supprimée", "success");
  };

  const mf = (key) => (e) => setModalForm(prev => {
    const next = { ...prev, [key]: e.target.value };
    if (key === "projetId") { next.affaireId = ""; next.lieuTravailType = ""; }
    if (key === "affaireId") {
      const affaire = affaires.find(a => a.id === Number(e.target.value));
      if (affaire?.lieuTravailType) next.lieuTravailType = affaire.lieuTravailType;
    }
    return next;
  });

  const PlageList = ({ periode }) => {
    const list = plages[periode === "matin" ? "matin" : "apresmidi"];
    if (list.length === 0) return null;
    return (
      <div style={{ marginTop: 8, maxHeight: 200, overflowY: "auto" }}>
        {list.map(plage => {
          const affaire = affaires.find(a => a.id === Number(plage.affaireId));
          return (
            <div key={plage.id || `${plage.heureDebut}-${plage.affaireId}`} className="plage-row" style={{
              display: "flex", alignItems: "center", gap: 8,
              background: "rgba(255,255,255,0.06)", borderRadius: 6,
              padding: "6px 10px", marginBottom: 4, fontSize: 13,
            }}>
              <span style={{ fontWeight: 600, minWidth: 90 }}>
                {formatTime(plage.heureDebut)} – {formatTime(plage.heureFin)}
              </span>
              <span className="chip" style={{ minWidth: 70 }}>
                {affaire ? affaire.numeroAffaire : plage.affaireId}
              </span>
              {plage.lieuTravailType && (
                <span className="chip" style={{ minWidth: 60, background: plage.lieuTravailType === "ATELIER" ? "rgba(74,158,202,0.2)" : "rgba(34,197,94,0.15)", fontSize: 11 }}>
                  {plage.lieuTravailType}
                </span>
              )}
              <span style={{ color: "var(--text-muted)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {affaire ? affaire.nom : ""}
              </span>
              <button
                className="btn btn-sm"
                style={{ padding: "2px 8px", fontSize: 12, marginLeft: "auto" }}
                onClick={() => openEditModal(periode, plage)}
                title="Modifier"
              >
                <Icon path={icons.edit} size={13} />
              </button>
              <button
                className="btn btn-danger btn-sm"
                style={{ padding: "2px 8px", fontSize: 12 }}
                onClick={() => handleDeletePlage(periode, plage)}
                title="Supprimer"
              >
                <Icon path={icons.trash} size={13} />
              </button>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Pointage Horaire</h2>
          <div className="text-muted text-sm" style={{ marginTop: 4 }}>Saisie des heures de présence</div>
        </div>
      </div>

      {/* Date + Employé */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-header">
          <span><Icon path={icons.clock} size={16} /> Identification</span>
        </div>
        <div className="card-body">
          <div className="form-row">
            <div className="form-group" style={{ maxWidth: 180 }}>
              <label>Date</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <div className="form-group" style={{ flex: 2 }}>
              <label>Nom et Prénom</label>
              <select value={employeId} onChange={e => setEmployeId(e.target.value)}>
                <option value="">— Sélectionner un employé —</option>
                {employes.map(e => (
                  <option key={e.id} value={e.id}>{e.prenom} {e.nom}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Horaire */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-header"><Icon path={icons.clock} size={16} /> Horaire</div>
        <div className="period-grid" style={{ padding: 16, gap: 12 }}>
          <div className="pointage-period">
            <div className="card-section-header">Matin</div>
            <div className="period-times">
              <div className="form-group">
                <label>Heure d'entrée</label>
                <input type="time" value={form.matinHeureEntree} onChange={f("matinHeureEntree")} />
              </div>
              <div className="form-group">
                <label>Heure de sortie</label>
                <input type="time" value={form.matinHeureSortie} onChange={f("matinHeureSortie")} />
              </div>
            </div>
          </div>
          <div className="pointage-period">
            <div className="card-section-header">Après-Midi</div>
            <div className="period-times">
              <div className="form-group">
                <label>Heure d'entrée</label>
                <input type="time" value={form.apresMidiHeureEntree} onChange={f("apresMidiHeureEntree")} />
              </div>
              <div className="form-group">
                <label>Heure de sortie</label>
                <input type="time" value={form.apresMidiHeureSortie} onChange={f("apresMidiHeureSortie")} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Activité — with plages */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-header"><Icon path={icons.briefcase} size={16} /> Projet & Affaires</div>
        <div className="period-grid" style={{ padding: 16, gap: 12 }}>
          {/* Matin */}
          <div className="pointage-period">
           <div className="card-section-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span>Matin</span>
              <button
                className="btn btn-sm btn-sky"
                onClick={() => openAddModal("matin")}
                title="Ajouter une plage horaire"
              >
                <Icon path={icons.plus} size={13} />
              </button>
            </div>
            <div className="period-details">
              <PlageList periode="matin" />
            </div>
          </div>

          {/* Après-Midi */}
          <div className="pointage-period">
           <div className="card-section-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span>Après-Midi</span>
              <button
                className="btn btn-sm btn-sky"
                onClick={() => openAddModal("apresmidi")}
                title="Ajouter une plage horaire"
              >
                <Icon path={icons.plus} size={13} />
              </button>
            </div>
            <div className="period-details">
              <PlageList periode="apresmidi" />
            </div>
          </div>
        </div>
      </div>


      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 28 }}>
        <button className="btn btn-success" onClick={handleSave} disabled={saving} style={{ padding: "10px 28px", fontSize: 14 }}>
          <Icon path={icons.save} size={16} />
          {saving ? "Enregistrement..." : "Enregistrer le pointage"}
        </button>
      </div>

      {/* Daily recap */}
      {dayPointages.length > 0 && (
        <div className="card">
          <div className="card-header">
            <span>Pointages du {date}</span>
            <span className="chip" style={{ background: "rgba(255,255,255,0.15)", color: "white" }}>{dayPointages.length} employés</span>
          </div>
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
                {dayPointages.map(p => (
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

      {/* ── Plage Horaire Modal ──────────────────────────────── */}
      {modal && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 1000,
            background: "rgba(0,0,0,0.55)", display: "flex",
            alignItems: "center", justifyContent: "center",
          }}
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div style={{
            background: "var(--bg-card, #fbfbfb)", borderRadius: 12,
            padding: 24, width: "100%", maxWidth: 420,
            boxShadow: "0 8px 40px rgba(0,0,0,0.4)",
          }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 16 }}>
                {modal.mode === "add" ? "Ajouter" : "Modifier"} une plage horaire
                {" "}
                <span style={{ opacity: 0.6, fontWeight: 400 }}>
                  — {modal.periode === "matin" ? "☀️ Matin" : "🌇 Après-Midi"}
                </span>
              </h3>
              <button
                onClick={closeModal}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, lineHeight: 1, opacity: 0.6 }}
              >×</button>
            </div>

            {/* Project selector */}
            <div className="form-group" style={{ marginBottom: 14 }}>
              <label>Projet</label>
              <select value={modalForm.projetId} onChange={mf("projetId")}>
                <option value="">— Selectionner un projet —</option>
                {projets.filter(p => p.situation === "EN_COURS").map(p => <option key={p.id} value={p.id}>{p.numeroSerie} — {p.nom}</option>)}
              </select>
            </div>

            {/* Affaire selector — filtered by project */}
            <div className="form-group" style={{ marginBottom: 14 }}>
              <label>Affaire</label>
              <select
                value={modalForm.affaireId}
                onChange={mf("affaireId")}
                disabled={!modalForm.projetId}
              >
                <option value="">
                  {modalForm.projetId ? "— Selectionner une affaire —" : "— Selectionnez d'abord un projet —"}
                </option>
                {affaires
                  .filter(a => a.projetId === Number(modalForm.projetId) && a.etat === "en_execution")
                  .map(a => <option key={a.id} value={a.id}>{a.numeroAffaire} — {a.nom}</option>)
                }
              </select>
            </div>

            {/* Lieu de travail */}
            <div className="form-group" style={{ marginBottom: 14 }}>
              <label>Lieu de Travail</label>
              <select
                value={modalForm.lieuTravailType}
                onChange={mf("lieuTravailType")}
                disabled={!modalForm.affaireId}
              >
                <option value="">— Sélectionner —</option>
                <option value="ATELIER">Atelier</option>
                <option value="CHANTIER">Chantier</option>
              </select>
            </div>

            {/* Times */}
            <div className="form-row" style={{ gap: 12, marginBottom: 14 }}>
              <div className="form-group">
                <label>Heure de début</label>
                <input type="time" value={modalForm.heureDebut} onChange={mf("heureDebut")} />
              </div>
              <div className="form-group">
                <label>Heure de fin</label>
                <input type="time" value={modalForm.heureFin} onChange={mf("heureFin")} />
              </div>
            </div>

            {/* Commentaire */}
            <div className="form-group" style={{ marginBottom: 20 }}>
              <label>Commentaire</label>
              <textarea
                value={modalForm.commentaire}
                onChange={mf("commentaire")}
                placeholder="Remarques..."
                rows={2}
              />
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button className="btn" onClick={closeModal} style={{ padding: "8px 18px" }}>
                Annuler
              </button>
              <button
                className="btn btn-success"
                onClick={handleModalSave}
                style={{ padding: "8px 20px" }}
              >
                <Icon path={icons.save} size={14} />
                {modal.mode === "add" ? "Ajouter" : "Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}