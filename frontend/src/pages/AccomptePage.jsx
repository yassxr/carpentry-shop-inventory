import { useState, useEffect } from "react";
import { Icon, icons } from "../components/Icon";
import api from "../services/api";

const MODES = [
  { value: "cheque",           label: "Chèque" },
  { value: "espece",           label: "Espèce" },
  { value: "tpe",              label: "TPE" },
  { value: "virement_bancaire", label: "Virement bancaire" },
  { value: "lettre_echange",   label: "Lettre d'échange" },
];

const modeLabel = (v) => MODES.find(m => m.value === v)?.label ?? v;

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(str) {
  if (!str) return "—";
  const [y, m, d] = str.split("-");
  return `${d}/${m}/${y}`;
}

function formatSavedAt(str) {
  if (!str) return "—";
  const [datePart, timePart] = str.split("T");
  const [y, m, d] = datePart.split("-");
  return `${d}/${m}/${y} ${timePart.slice(0, 5)}`;
}

function fmtMontant(val) {
  if (val == null || val === "") return "—";
  return Number(val).toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " MAD";
}

const EMPTY_FORM = { modePaiement: "cheque", reference: "", date: "", montant: "" };

export default function AccomptePage({ projets, affaires, showToast }) {
  const [projetId, setProjetId]           = useState("");
  const [affaireId, setAffaireId]         = useState("");
  const [accomptes, setAccomptes]         = useState([]);
  const [showModal, setShowModal]         = useState(false);
  const [editingId, setEditingId]         = useState(null);
  const [form, setForm]                   = useState(EMPTY_FORM);
  const [saving, setSaving]               = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const filteredAffaires = affaires.filter(
    a => a.projetId === Number(projetId) &&
         (a.etat === "en_instance" || a.etat === "accorde")
  );

  const selectedAffaire = affaires.find(a => a.id === Number(affaireId));

  useEffect(() => {
    setAffaireId("");
    setAccomptes([]);
  }, [projetId]);

  useEffect(() => {
    if (!affaireId) { setAccomptes([]); return; }
    api.getAccomptes(Number(affaireId)).then(data => setAccomptes(data || []));
  }, [affaireId]);

  const totalEncaisse = accomptes.reduce((s, a) => s + Number(a.montant ?? 0), 0);

  const lastAccompte = accomptes.length > 0
    ? accomptes.reduce((latest, a) =>
        (!latest || (a.savedAt ?? "") > (latest.savedAt ?? "")) ? a : latest
      , null)
    : null;

  const reliquat = selectedAffaire?.montant != null
    ? Math.abs(Number(selectedAffaire.montant) - totalEncaisse)
    : null;

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, date: todayStr() });
    setShowModal(true);
  };

  const openEdit = (acc) => {
    setEditingId(acc.id);
    setForm({
      modePaiement: acc.modePaiement,
      reference: acc.reference || "",
      date: acc.date || "",
      montant: acc.montant?.toString() || "",
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.modePaiement || !form.date || !form.montant) return;
    setSaving(true);
    try {
      const payload = {
        affaireId: Number(affaireId),
        modePaiement: form.modePaiement,
        reference: form.modePaiement === "espece" ? null : (form.reference || null),
        date: form.date,
        montant: Number(form.montant),
      };
      if (editingId) {
        const updated = await api.updateAccompte(editingId, payload);
        setAccomptes(prev => prev.map(a => a.id === editingId ? updated : a));
        showToast?.("Accompte modifié");
      } else {
        const created = await api.createAccompte(payload);
        setAccomptes(prev => [...prev, created]);
        showToast?.("Accompte ajouté");
      }
      setShowModal(false);
    } catch {
      showToast?.("Erreur lors de l'enregistrement", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.deleteAccompte(id);
      setAccomptes(prev => prev.filter(a => a.id !== id));
      showToast?.("Accompte supprimé");
    } catch {
      showToast?.("Erreur lors de la suppression", "error");
    } finally {
      setConfirmDeleteId(null);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>Accomptes</h2>
      </div>

      {/* Selectors */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-body">
          <div className="form-row">
            <div className="form-group">
              <label>Projet</label>
              <select value={projetId} onChange={e => setProjetId(e.target.value)}>
                <option value="">— Sélectionner un projet —</option>
                {projets.map(p => (
                  <option key={p.id} value={p.id}>{p.numeroSerie} — {p.nom}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Affaire</label>
              <select
                value={affaireId}
                onChange={e => setAffaireId(e.target.value)}
                disabled={!projetId}
              >
                <option value="">— Sélectionner une affaire —</option>
                {filteredAffaires.map(a => (
                  <option key={a.id} value={a.id}>{a.numeroAffaire} — {a.nom}</option>
                ))}
              </select>
            </div>
          </div>
          {projetId && filteredAffaires.length === 0 && (
            <div style={{ marginTop: 10, fontSize: 12, color: "var(--gray-400)" }}>
              Aucune affaire en instance ou accordée pour ce projet.
            </div>
          )}
        </div>
      </div>

      {/* Table + summary */}
      {affaireId && (
        <>
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-header">
              <span>Accomptes — {selectedAffaire?.numeroAffaire}</span>
              <button className="btn btn-sky btn-sm" onClick={openCreate}>
                <Icon path={icons.plus} size={14} /> Ajouter un accompte
              </button>
            </div>
            <div className="table-wrap">
              {accomptes.length === 0 ? (
                <div style={{ padding: 40, textAlign: "center", color: "var(--gray-400)", fontSize: 13 }}>
                  Aucun accompte enregistré pour cette affaire
                </div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Mode de paiement</th>
                      <th>Référence</th>
                      <th>Montant</th>
                      <th style={{ width: 90 }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accomptes.map(acc => (
                      <tr key={acc.id}>
                        <td>{formatDate(acc.date)}</td>
                        <td>{modeLabel(acc.modePaiement)}</td>
                        <td>
                          {acc.reference
                            ? acc.reference
                            : <span style={{ color: "var(--gray-400)" }}>—</span>
                          }
                        </td>
                        <td style={{ fontWeight: 600 }}>{fmtMontant(acc.montant)}</td>
                        <td>
                          <div style={{ display: "flex", gap: 4 }}>
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={() => openEdit(acc)}
                              title="Modifier"
                            >
                              <Icon path={icons.edit} size={13} />
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => setConfirmDeleteId(acc.id)}
                              title="Supprimer"
                            >
                              <Icon path={icons.trash} size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Summary cards */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {/* Left: Encaissement */}
            <div className="card">
              <div className="card-body">
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "var(--gray-400)", marginBottom: 10 }}>
                  Encaissement
                </div>
                {accomptes.length === 0 ? (
                  <div style={{ color: "var(--gray-400)", fontSize: 13 }}>Aucun encaissement</div>
                ) : (
                  <>
                    <div style={{ fontSize: 12, color: "var(--gray-600)", marginBottom: 4 }}>
                      au {formatSavedAt(lastAccompte?.savedAt)}
                    </div>
                    <div style={{
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontSize: 30, fontWeight: 700, color: "var(--navy)",
                    }}>
                      {fmtMontant(totalEncaisse)}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Right: Reliquat */}
            <div className="card">
              <div className="card-body">
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "var(--gray-400)", marginBottom: 10 }}>
                  Reliquat
                </div>
                {reliquat != null ? (
                  <>
                    <div style={{
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontSize: 30, fontWeight: 700,
                      color: reliquat === 0 ? "var(--green)" : "var(--orange)",
                    }}>
                      {fmtMontant(reliquat)}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--gray-400)", marginTop: 4 }}>
                      sur {fmtMontant(selectedAffaire.montant)} contractuel
                    </div>
                  </>
                ) : (
                  <div style={{ color: "var(--gray-400)", fontSize: 13 }}>
                    Montant de l'affaire non défini
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Create / Edit modal */}
      {showModal && (
        <div
          className="modal-overlay"
          onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          <div className="modal">
            <div className="modal-header">
              {editingId ? "Modifier l'accompte" : "Ajouter un accompte"}
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setShowModal(false)}
                style={{ color: "white", border: "none", padding: "2px 6px" }}
              >
                <Icon path={icons.x} size={16} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Mode de paiement *</label>
                <select
                  value={form.modePaiement}
                  onChange={e => setForm(f => ({ ...f, modePaiement: e.target.value }))}
                >
                  {MODES.map(m => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>

              {form.modePaiement !== "espece" && (
                <div className="form-group">
                  <label>Référence</label>
                  <input
                    type="text"
                    placeholder="N° chèque, référence virement..."
                    value={form.reference}
                    onChange={e => setForm(f => ({ ...f, reference: e.target.value }))}
                  />
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label>Date *</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label>Montant (MAD) *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0,00"
                    value={form.montant}
                    onChange={e => setForm(f => ({ ...f, montant: e.target.value }))}
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}>
                Annuler
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSave}
                disabled={saving || !form.date || !form.montant}
              >
                <Icon path={icons.save} size={14} />
                {saving ? "Enregistrement..." : "Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm delete */}
      {confirmDeleteId && (
        <div
          className="modal-overlay"
          onClick={e => { if (e.target === e.currentTarget) setConfirmDeleteId(null); }}
        >
          <div className="modal" style={{ width: 360 }}>
            <div className="modal-header">Confirmer la suppression</div>
            <div className="modal-body">
              <p style={{ fontSize: 14 }}>Supprimer cet accompte ?</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setConfirmDeleteId(null)}>
                Annuler
              </button>
              <button className="btn btn-danger" onClick={() => handleDelete(confirmDeleteId)}>
                <Icon path={icons.trash} size={14} /> Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
