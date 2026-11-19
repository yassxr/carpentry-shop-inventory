import { useState } from "react";
import { Icon, icons } from "../components/Icon";
import Modal from "../components/Modal";
import api from "../services/api";
import { useGroupHover } from "../hooks/useGroupHover";

const EMPTY_PROJET  = {
  nom: "", situation: "EN_COURS", lieu: "", bct: "", bet: "", chef: "",
  typePersonne: "physique",
  maitreouvrage: "", nomSociete: "", nomResponsable: "",
  telephone: "", email: "",
};
const EMPTY_AFFAIRE = { nom: "", description: "", etat: "en_instance", montant: "" };

const AFFAIRES_PER_PAGE = 8;
const HISTORY_PER_PAGE  = 8;

function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  const getItems = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i);
    const items = [0];
    if (page > 2) items.push("ellipsis-start");
    for (let i = Math.max(1, page - 1); i <= Math.min(totalPages - 2, page + 1); i++) items.push(i);
    if (page < totalPages - 3) items.push("ellipsis-end");
    items.push(totalPages - 1);
    return items;
  };
  const btn = (label, target, disabled) => (
    <button
      key={label}
      onClick={() => !disabled && onChange(target)}
      disabled={disabled}
      style={{
        padding: "4px 10px", minWidth: 32, borderRadius: "var(--radius)", cursor: disabled ? "default" : "pointer",
        border: "1px solid var(--gray-200)", background: "transparent",
        color: disabled ? "var(--gray-300)" : "var(--navy)", fontSize: 13,
      }}
    >{label}</button>
  );
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, padding: "12px 0 2px" }}>
      {btn("‹", page - 1, page === 0)}
      {getItems().map((item, idx) =>
        typeof item === "string" ? (
          <span key={item + idx} style={{ color: "var(--gray-400)", fontSize: 13, padding: "0 2px" }}>…</span>
        ) : (
          <button key={item} onClick={() => onChange(item)} style={{
            padding: "4px 10px", minWidth: 32, borderRadius: "var(--radius)", cursor: "pointer",
            border: item === page ? "none" : "1px solid var(--gray-200)",
            background: item === page ? "var(--navy)" : "transparent",
            color: item === page ? "var(--white)" : "var(--navy)",
            fontWeight: item === page ? 700 : 400, fontSize: 13,
          }}>{item + 1}</button>
        )
      )}
      {btn("›", page + 1, page === totalPages - 1)}
    </div>
  );
}

const ETAT_AFFAIRE = {
  en_instance:  { label: "En instance",  color: "var(--gray-400)",  bg: "rgba(0,0,0,0.06)" },
  accorde:      { label: "Accordé",       color: "var(--sky)",       bg: "var(--sky-pale)" },
  en_execution: { label: "En exécution", color: "var(--green)",     bg: "rgba(46,139,87,0.12)" },
  annule:       { label: "Annulé",        color: "var(--red)",       bg: "rgba(192,57,43,0.12)" },
  acheve:       { label: "Achevé",        color: "var(--navy-mid)",  bg: "rgba(15,41,77,0.1)" },
};

const EtatBadge = ({ etat }) => {
  const e = ETAT_AFFAIRE[etat] || ETAT_AFFAIRE.en_instance;
  return (
    <span className="chip" style={{ background: e.bg, color: e.color, fontWeight: 600 }}>
      {e.label}
    </span>
  );
};

function ProjetFormFields({ form, onChange, projets = [], employes = [] }) {
  const f = key => e => onChange(key, e.target.value);

  const physiqueLookup = {};
  projets.forEach(p => {
    if (p.maitreouvrage && !physiqueLookup[p.maitreouvrage]) {
      physiqueLookup[p.maitreouvrage] = { telephone: p.telephone || "", email: p.email || "" };
    }
  });

  const moraleLookup = {};
  projets.forEach(p => {
    if (p.nomSociete && !moraleLookup[p.nomSociete]) {
      moraleLookup[p.nomSociete] = {
        nomResponsable: p.nomResponsable || "",
        telephone: p.telephone || "",
        email: p.email || "",
      };
    }
  });

  const handleMaitreOuvrageChange = e => {
    const val = e.target.value;
    onChange("maitreouvrage", val);
    if (physiqueLookup[val]) {
      onChange("telephone", physiqueLookup[val].telephone);
      onChange("email", physiqueLookup[val].email);
    }
  };

  const handleNomSocieteChange = e => {
    const val = e.target.value;
    onChange("nomSociete", val);
    if (moraleLookup[val]) {
      onChange("nomResponsable", moraleLookup[val].nomResponsable);
      onChange("telephone", moraleLookup[val].telephone);
      onChange("email", moraleLookup[val].email);
    }
  };

  const isPhysique = form.typePersonne !== "morale";

  return (
    <>
      <div className="form-row gap-12">
        <div className="form-group" style={{ flex: 2 }}>
          <label>Nom *</label>
          <input value={form.nom} onChange={f("nom")} placeholder="Ex: Residence Al Firdaous" />
        </div>
        <div className="form-group" style={{ maxWidth: 160 }}>
          <label>Situation</label>
          <select value={form.situation} onChange={f("situation")}>
            <option value="">— Selectionnez —</option>
            <option value="EN_COURS">En Cours</option>
            <option value="COMPLET">Complet</option>
            <option value="AVORTE">Annulé</option>
          </select>
        </div>
      </div>

      <div className="form-row gap-12">
        <div className="form-group">
          <label>Lieu</label>
          <input value={form.lieu} onChange={f("lieu")} placeholder="Ex: Casablanca, Hay Hassani" />
        </div>
        <div className="form-group">
          <label>BCT</label>
          <input value={form.bct} onChange={f("bct")} placeholder="Bureau de controle technique" />
        </div>
      </div>

      <div className="form-row gap-12">
        <div className="form-group">
          <label>BET</label>
          <input value={form.bet} onChange={f("bet")} placeholder="Bureau d'etudes techniques" />
        </div>
        <div className="form-group">
          <label>Chef de projet</label>
          <select value={form.chef} onChange={f("chef")}>
            <option value="">— Selectionnez —</option>
            {employes.map(e => (
              <option key={e.id} value={`${e.prenom} ${e.nom}`}>
                {e.prenom} {e.nom}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-group">
        <div style={{ display: "flex", gap: 20, marginTop: 6, justifyContent: "center" }}>
          {[
            { val: "physique", label: "Personne physique" },
            { val: "morale",   label: "Personne morale"  },
          ].map(({ val, label }) => (
            <label key={val} style={{ display: "flex", alignItems: "center", gap: 7, cursor: "pointer", fontSize: 14 }}>
              <input
                type="radio"
                name="typePersonne"
                value={val}
                checked={form.typePersonne === val}
                onChange={() => onChange("typePersonne", val)}
              />
              {label}
            </label>
          ))}
        </div>
      </div>

      {isPhysique ? (
        <>
          <div className="form-group">
            <label>Nom du maitre d'ouvrage</label>
            <input
              list="maitre-ouvrage-list"
              value={form.maitreouvrage}
              onChange={handleMaitreOuvrageChange}
              placeholder="M. Alami Hassan"
              autoComplete="off"
            />
            <datalist id="maitre-ouvrage-list">
              {Object.keys(physiqueLookup).map(name => (
                <option key={name} value={name} />
              ))}
            </datalist>
          </div>
          <div className="form-row gap-12">
            <div className="form-group">
              <label>Telephone</label>
              <input value={form.telephone} onChange={f("telephone")} placeholder="+212 6xx xxx xxx" />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={form.email} onChange={f("email")} placeholder="contact@email.com" />
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="form-group">
            <label>Nom de la societe</label>
            <input
              list="nom-societe-list"
              value={form.nomSociete}
              onChange={handleNomSocieteChange}
              placeholder="Ex: CGEM Construction"
              autoComplete="off"
            />
            <datalist id="nom-societe-list">
              {Object.keys(moraleLookup).map(name => (
                <option key={name} value={name} />
              ))}
            </datalist>
          </div>
          <div className="form-group">
            <label>Nom du responsable</label>
            <input value={form.nomResponsable} onChange={f("nomResponsable")} placeholder="M. Benali Ahmed" />
          </div>
          <div className="form-row gap-12">
            <div className="form-group">
              <label>Telephone</label>
              <input value={form.telephone} onChange={f("telephone")} placeholder="+212 6xx xxx xxx" />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={form.email} onChange={f("email")} placeholder="contact@email.com" />
            </div>
          </div>
        </>
      )}
    </>
  );
}

const SITUATION_LABEL = { EN_COURS: "En Cours", COMPLET: "Complet", AVORTE: "Annulé" };
const SITUATION_STYLE = {
  EN_COURS: { background: "var(--sky-pale)",          color: "var(--navy-mid)" },
  COMPLET:  { background: "rgba(46,139,87,0.15)",      color: "var(--green)" },
  AVORTE:   { background: "rgba(192,57,43,0.12)",      color: "var(--red)" },
};

const SituationBadge = ({ value }) => {
  if (!value) return <span className="text-muted">—</span>;
  return (
    <span className="chip" style={SITUATION_STYLE[value] || {}}>
      {SITUATION_LABEL[value] || value}
    </span>
  );
};

export default function ProjetsPage({ projets, setProjets, affaires, setAffaires, employes = [], showToast, userRole }) {
  const isAdmin = userRole === "admin";
  const [selectedProjetId, setSelectedProjetId] = useState("");

  const [showAddProjet,  setShowAddProjet]  = useState(false);
  const [showEditProjet, setShowEditProjet] = useState(false);
  const [showFiche,      setShowFiche]      = useState(false);
  const [showAddAffaire, setShowAddAffaire] = useState(false);
  const [showEditAffaire,setShowEditAffaire]= useState(false);
  const [showInfo,       setShowInfo]       = useState(false);

  const [projetForm,  setProjetForm]  = useState(EMPTY_PROJET);
  const [affaireForm, setAffaireForm] = useState(EMPTY_AFFAIRE);
  const [editingAffaire, setEditingAffaire] = useState(null);
  const [selectedAffaire, setSelectedAffaire] = useState(null);
  const [history, setHistory] = useState([]);

  const [savingProjet,  setSavingProjet]  = useState(false);
  const [savingAffaire, setSavingAffaire] = useState(false);

  const [affairesPage, setAffairesPage] = useState(0);
  const [historyPage,  setHistoryPage]  = useState(0);

  const projet = projets.find(p => p.id === Number(selectedProjetId));
  const projetAffaires = affaires.filter(a => a.projetId === Number(selectedProjetId));
  const affairesTotalPages = Math.ceil(projetAffaires.length / AFFAIRES_PER_PAGE);
  const pagedAffaires = projetAffaires.slice(affairesPage * AFFAIRES_PER_PAGE, (affairesPage + 1) * AFFAIRES_PER_PAGE);

  const pf = key => e => setProjetForm(p => ({ ...p, [key]: e.target.value }));
  const af = key => e => setAffaireForm(p => ({ ...p, [key]: e.target.value }));

  // ── Project CRUD ─────────────────────────────────────────────────────────────

  const handleCreateProjet = async () => {
    if (!projetForm.nom) { showToast("Le nom est obligatoire", "error"); return; }
    setSavingProjet(true);
    try {
      const p = await api.createProjet(projetForm);
      setProjets(prev => [p, ...prev]);
      setProjetForm(EMPTY_PROJET);
      setShowAddProjet(false);
      setSelectedProjetId(String(p.id));
      showToast(`Projet ${p.numeroSerie} cree`, "success");
    } catch { showToast("Erreur lors de la creation", "error"); }
    finally { setSavingProjet(false); }
  };

  const openEditProjet = () => {
    if (!projet) return;
    setProjetForm({
      nom:            projet.nom             || "",
      situation:      projet.situation       || "",
      lieu:           projet.lieu            || "",
      bct:            projet.bct             || "",
      bet:            projet.bet             || "",
      chef:           projet.chef            || "",
      typePersonne:   projet.typePersonne    || "physique",
      maitreouvrage:  projet.maitreouvrage   || "",
      nomSociete:     projet.nomSociete      || "",
      nomResponsable: projet.nomResponsable  || "",
      telephone:      projet.telephone       || "",
      email:          projet.email           || "",
    });
    setShowEditProjet(true);
  };

  const handleUpdateProjet = async () => {
    if (!projetForm.nom) { showToast("Le nom est obligatoire", "error"); return; }
    setSavingProjet(true);
    try {
      const updated = await api.updateProjet(projet.id, projetForm);
      setProjets(prev => prev.map(p => p.id === updated.id ? updated : p));
      setShowEditProjet(false);
      showToast("Projet mis a jour", "success");
    } catch { showToast("Erreur lors de la mise a jour", "error"); }
    finally { setSavingProjet(false); }
  };

  const handleDeleteProjet = async () => {
    if (!projet) return;
    try {
      await api.deleteProjet(projet.id);
      setProjets(prev => prev.filter(p => p.id !== projet.id));
      setAffaires(prev => prev.map(a => a.projetId === projet.id
        ? { ...a, projetId: null, projetNom: null, projetNumeroSerie: null, numeroAffaire: null, devis: null }
        : a));
      setSelectedProjetId("");
      showToast("Projet supprime", "success");
    } catch { showToast("Erreur lors de la suppression", "error"); }
  };

  // ── Affaire CRUD ──────────────────────────────────────────────────────────────

  const handleCreateAffaire = async () => {
    if (!affaireForm.nom) { showToast("Le nom est obligatoire", "error"); return; }
    setSavingAffaire(true);
    try {
      const a = await api.addAffaireToProjet(projet.id, {
        ...affaireForm,
        montant: affaireForm.montant !== "" ? Number(affaireForm.montant) : null,
        actif: true,
      });
      setAffaires(prev => [...prev, a]);
      setAffaireForm(EMPTY_AFFAIRE);
      setShowAddAffaire(false);
      showToast(`Affaire ${a.numeroAffaire} creee`, "success");
    } catch { showToast("Erreur lors de la creation", "error"); }
    finally { setSavingAffaire(false); }
  };

  const openEditAffaire = (affaire) => {
    setEditingAffaire(affaire);
    setAffaireForm({
      nom:         affaire.nom         || "",
      description: affaire.description || "",
      etat:        affaire.etat        || "en_instance",
      montant:     affaire.montant     != null ? String(affaire.montant) : "",
    });
    setShowEditAffaire(true);
  };

  const handleUpdateAffaire = async () => {
    if (!affaireForm.nom) { showToast("Le nom est obligatoire", "error"); return; }
    setSavingAffaire(true);
    try {
      const payload = {
        ...affaireForm,
        montant: affaireForm.montant !== "" ? Number(affaireForm.montant) : null,
        actif: editingAffaire.actif,
      };
      const updated = await api.updateAffaire(editingAffaire.id, payload);
      const newAffaires = affaires.map(a => a.id === updated.id ? { ...a, ...updated } : a);
      setAffaires(newAffaires);

      if (updated.projetId) {
        const siblings = newAffaires.filter(a => a.projetId === updated.projetId);
        if (siblings.length > 0 && siblings.every(a => a.etat === "annule")) {
          setProjets(prev => prev.map(p =>
            p.id === updated.projetId ? { ...p, situation: "AVORTE" } : p
          ));
        }
      }

      setShowEditAffaire(false);
      setEditingAffaire(null);
      showToast("Affaire mise a jour", "success");
    } catch { showToast("Erreur lors de la mise a jour", "error"); }
    finally { setSavingAffaire(false); }
  };

  const handleDeleteAffaire = async (affaire) => {
    try {
      await api.deleteAffaire(affaire.id);
      setAffaires(prev => prev.filter(a => a.id !== affaire.id));
      showToast("Affaire supprimee", "success");
    } catch { showToast("Erreur lors de la suppression", "error"); }
  };

  // ── Affaire history ───────────────────────────────────────────────────────────

  const handleInfo = async (affaire) => {
    setSelectedAffaire(affaire);
    setHistory([]);
    setHistoryPage(0);
    setShowInfo(true);
    try {
      const hist = await api.getAffaireHistory(affaire.id);
      const grouped = (hist || []).reduce((acc, h) => {
        const key = h.date;
        if (!acc[key]) acc[key] = { date: h.date, employees: [] };
        acc[key].employees.push({
          nom: h.employeNom,
          prenom: h.employePrenom,
          plages: [
            ...(h.matinPlages || []).map(p => ({ ...p, periode: "MATIN" })),
            ...(h.apresmidiPlages || []).map(p => ({ ...p, periode: "APRES_MIDI" })),
          ],
        });
        return acc;
      }, {});
      setHistory(Object.values(grouped));
    } catch { setHistory([]); }
  };

  const renderHistoryRows = (slice) => {
    const rows = [];
    slice.forEach((h, i) => {
      const totalRowsForDate = h.employees.reduce((sum, e) => sum + Math.max(1, e.plages.length), 0);
      h.employees.forEach((emp, empIdx) => {
        const empRows = Math.max(1, emp.plages.length);
        if (emp.plages.length === 0) {
          rows.push(
            <tr key={`${i}-${empIdx}`} data-group={i}>
              {empIdx === 0 && <td rowSpan={totalRowsForDate} style={{ verticalAlign: "middle" }}><span className="chip">{h.date}</span></td>}
              <td style={{ fontWeight: 600, verticalAlign: "middle" }}>{emp.prenom} {emp.nom}</td>
              <td colSpan={2} style={{ textAlign: "center", color: "var(--gray-400)" }}>Aucune plage</td>
            </tr>
          );
        } else {
          emp.plages.forEach((p, pIdx) => {
            rows.push(
              <tr key={`${i}-${empIdx}-${pIdx}`} data-group={i}>
                {empIdx === 0 && pIdx === 0 && <td rowSpan={totalRowsForDate} style={{ verticalAlign: "middle" }}><span className="chip">{h.date}</span></td>}
                {pIdx === 0 && <td rowSpan={empRows} style={{ fontWeight: 600, verticalAlign: "middle" }}>{emp.prenom} {emp.nom}</td>}
                <td>
                  <span style={{ marginRight: 5 }}>{p.periode === "MATIN" ? "☀️" : "🌇"}</span>
                  {p.heureDebut} – {p.heureFin}
                </td>
                <td style={{ color: "var(--text-muted)" }}>{p.commentaire || "—"}</td>
              </tr>
            );
          });
        }
      });
    });
    return rows;
  };

  const historyTbodyRef = useGroupHover();

  const handleProjetFieldChange = (key, val) => setProjetForm(p => ({ ...p, [key]: val }));

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div>
      <div className="page-header">
        <h2>Projets</h2>
        <button className="btn btn-primary" onClick={() => { setProjetForm(EMPTY_PROJET); setShowAddProjet(true); }}>
          <Icon path={icons.plus} size={16} /> Nouveau projet
        </button>
      </div>

      {/* ── Project selector ─────────────────────────────────────── */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-body">
          <div style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
            <div className="form-group" style={{ flex: 1, minWidth: 260 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                Selectionner un projet
                {projet && <SituationBadge value={projet.situation} />}
              </label>
              <select value={selectedProjetId} onChange={e => { setSelectedProjetId(e.target.value); setAffairesPage(0); }}>
                <option value="">— Choisissez un projet —</option>
                {projets.map(p => (
                  <option key={p.id} value={p.id}>{p.numeroSerie} — {p.nom}</option>
                ))}
              </select>
            </div>

            {projet && (
              <div style={{ display: "flex", gap: 8, paddingBottom: 5 }}>
                <button className="btn btn-info btn-sm" onClick={() => setShowFiche(true)}>
                  <Icon path={icons.info} size={13} /> Fiche
                </button>
                <button className="btn btn-secondary btn-sm" onClick={openEditProjet}>
                  <Icon path={icons.edit} size={13} /> Modifier
                </button>
                {isAdmin && (
                  <button className="btn btn-danger btn-sm" onClick={handleDeleteProjet}>
                    <Icon path={icons.trash} size={13} /> Supprimer
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Affaires table ───────────────────────────────────────── */}
      {projet && (
        <div className="card">
          <div className="card-header">
            <span><Icon path={icons.briefcase} size={16} /> {projet.numeroSerie} — {projet.nom}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span className="chip" style={{ background: "rgba(255,255,255,0.15)", color: "white" }}>
                {projetAffaires.length} affaire{projetAffaires.length !== 1 ? "s" : ""}
              </span>
              <button className="btn btn-sm btn-sky" onClick={() => { setAffaireForm(EMPTY_AFFAIRE); setShowAddAffaire(true); }}>
                <Icon path={icons.plus} size={13} /> Ajouter affaire
              </button>
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Date de creation</th>
                  <th>N° Affaire</th>
                  <th>Devis</th>
                  <th>Nom</th>
                  <th>État</th>
                  <th>Montant</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {projetAffaires.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", color: "var(--gray-400)", padding: 24 }}>
                      Aucune affaire dans ce projet
                    </td>
                  </tr>
                ) : pagedAffaires.map(a => (
                  <tr key={a.id}>
                    <td>{a.createdAt || "—"}</td>
                    <td><span className="chip">{a.numeroAffaire}</span></td>
                    <td><span className="chip" style={{ background: "var(--sky-pale)" }}>{a.devis}</span></td>
                    <td style={{ fontWeight: 600 }}>{a.nom}</td>
                    <td><EtatBadge etat={a.etat || "en_instance"} /></td>
                    <td style={{ color: a.montant != null ? "var(--navy)" : "var(--gray-400)", fontWeight: 500 }}>
                      {a.montant != null ? `${Number(a.montant).toLocaleString("fr-MA")} MAD` : "—"}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                        <button className="btn btn-info btn-sm" onClick={() => handleInfo(a)}>
                          <Icon path={icons.info} size={13} />
                        </button>
                        <button className="btn btn-secondary btn-sm" onClick={() => openEditAffaire(a)}>
                          <Icon path={icons.edit} size={13} />
                        </button>
                        {isAdmin && (
                          <button className="btn btn-danger btn-sm" onClick={() => handleDeleteAffaire(a)}>
                            <Icon path={icons.trash} size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={affairesPage} totalPages={affairesTotalPages} onChange={setAffairesPage} />
        </div>
      )}

      {/* ── Fiche du Projet ────────────────────────────────────── */}
      {showFiche && projet && (
        <Modal
          title={`Fiche — ${projet.numeroSerie}`}
          onClose={() => setShowFiche(false)}
          footer={<button className="btn btn-ghost btn-sm" onClick={() => setShowFiche(false)}>Fermer</button>}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Header row: nom + situation */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <span style={{ fontSize: 18, fontWeight: 700, color: "var(--navy)" }}>{projet.nom}</span>
              <SituationBadge value={projet.situation} />
            </div>

            <div style={{ height: 1, background: "var(--sky-pale)" }} />

            {/* Fields grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 28px" }}>
              {[
                ["N° Serie",         projet.numeroSerie],
                ["Date de creation", projet.createdAt ? projet.createdAt.split("T")[0] : "—"],
                ["Lieu",             projet.lieu],
                ["Chef de projet",   projet.chef],
                ["BCT",              projet.bct],
                ["BET",              projet.bet],
              ].map(([label, val]) => (
                <div key={label}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "var(--gray-400)", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 4 }}>
                    {label}
                  </div>
                  <div style={{ fontSize: 14, color: val ? "var(--navy)" : "var(--gray-400)", fontWeight: val ? 500 : 400 }}>
                    {val || "—"}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ height: 1, background: "var(--sky-pale)" }} />

            {/* Maitre d'ouvrage section */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>

                <span className="chip" style={{ fontSize: 11 }}>
                  {projet.typePersonne === "morale" ? "Personne morale" : "Personne physique"}
                </span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 28px" }}>
                {projet.typePersonne === "morale" ? (
                  <>
                    {[
                      ["Societe",      projet.nomSociete],
                      ["Responsable",  projet.nomResponsable],
                      ["Telephone",    projet.telephone],
                      ["Email",        projet.email],
                    ].map(([label, val]) => (
                      <div key={label}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: "var(--gray-400)", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 4 }}>{label}</div>
                        <div style={{ fontSize: 14, color: val ? "var(--navy)" : "var(--gray-400)", fontWeight: val ? 500 : 400 }}>{val || "—"}</div>
                      </div>
                    ))}
                  </>
                ) : (
                  <>
                    {[
                      ["Maitre d'ouvrage", projet.maitreouvrage],
                      ["Telephone",        projet.telephone],
                      ["Email",            projet.email],
                    ].map(([label, val]) => (
                      <div key={label}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: "var(--gray-400)", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 4 }}>{label}</div>
                        <div style={{ fontSize: 14, color: val ? "var(--navy)" : "var(--gray-400)", fontWeight: val ? 500 : 400 }}>{val || "—"}</div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>

            <div style={{ height: 1, background: "var(--sky-pale)" }} />

            {/* Affaires summary */}
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: "var(--gray-400)", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 8 }}>
                Affaires ({projetAffaires.length})
              </div>
              {projetAffaires.length === 0 ? (
                <span style={{ fontSize: 13, color: "var(--gray-400)" }}>Aucune affaire</span>
              ) : (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {projetAffaires.map(a => (
                    <div key={a.id} style={{ padding: "6px 12px", background: "var(--sky-bg)", borderRadius: "var(--radius)", fontSize: 13 }}>
                      <span style={{ fontWeight: 600, color: "var(--navy)" }}>{a.numeroAffaire}</span>
                      <span style={{ color: "var(--gray-400)", margin: "0 6px" }}>·</span>
                      <span style={{ color: "var(--navy-mid)" }}>{a.nom}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* ── Create Project Modal ────────────────────────────────── */}
      {showAddProjet && (
        <Modal
          title="Nouveau Projet"
          style={{ width: "640px" }}
          onClose={() => setShowAddProjet(false)}
          footer={
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowAddProjet(false)}>Annuler</button>
              <button className="btn btn-success" onClick={handleCreateProjet} disabled={savingProjet}>
                <Icon path={icons.save} size={14} />
                {savingProjet ? "Enregistrement..." : "Creer"}
              </button>
            </div>
          }
        >
          <ProjetFormFields form={projetForm} onChange={handleProjetFieldChange} projets={projets} employes={employes} />

        </Modal>
      )}

      {/* ── Edit Project Modal ──────────────────────────────────── */}
      {showEditProjet && (
        <Modal
          title={`Modifier — ${projet?.numeroSerie}`}
          style={{ width: "640px" }}
          onClose={() => setShowEditProjet(false)}
          footer={
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowEditProjet(false)}>Annuler</button>
              <button className="btn btn-success" onClick={handleUpdateProjet} disabled={savingProjet}>
                <Icon path={icons.save} size={14} />
                {savingProjet ? "Enregistrement..." : "Enregistrer"}
              </button>
            </div>
          }
        >
          <ProjetFormFields form={projetForm} onChange={handleProjetFieldChange} projets={projets} employes={employes} />
        </Modal>
      )}

      {/* ── Create Affaire Modal ────────────────────────────────── */}
      {showAddAffaire && (
        <Modal
          title={`Nouvelle affaire — ${projet?.numeroSerie}`}
          onClose={() => setShowAddAffaire(false)}
          footer={
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowAddAffaire(false)}>Annuler</button>
              <button className="btn btn-success" onClick={handleCreateAffaire} disabled={savingAffaire}>
                <Icon path={icons.save} size={14} />
                {savingAffaire ? "Enregistrement..." : "Creer"}
              </button>
            </div>
          }
        >
          <div className="form-group">
            <label>Nom *</label>
            <input value={affaireForm.nom} onChange={af("nom")} />
          </div>
          <div className="form-row gap-12">
            <div className="form-group">
              <label>État</label>
              <select value={affaireForm.etat} onChange={af("etat")}>
                <option value="en_instance">En instance</option>
                <option value="accorde">Accordé</option>
                <option value="en_execution">En exécution</option>
                <option value="annule">Annulé</option>
                <option value="acheve">Achevé</option>
              </select>
            </div>
            <div className="form-group">
              <label>Montant (MAD)</label>
              <input
                type="number" min={0} placeholder="0"
                value={affaireForm.montant} onChange={af("montant")}
                disabled={userRole !== "admin"}
                title={userRole !== "admin" ? "Réservé à l'administrateur" : undefined}
              />
            </div>
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea value={affaireForm.description} onChange={af("description")} rows={2} />
          </div>
        </Modal>
      )}

      {/* ── Edit Affaire Modal ──────────────────────────────────── */}
      {showEditAffaire && editingAffaire && (
        <Modal
          title={`Modifier affaire — ${editingAffaire.numeroAffaire}`}
          onClose={() => { setShowEditAffaire(false); setEditingAffaire(null); }}
          footer={
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button className="btn btn-ghost btn-sm" onClick={() => { setShowEditAffaire(false); setEditingAffaire(null); }}>Annuler</button>
              <button className="btn btn-success" onClick={handleUpdateAffaire} disabled={savingAffaire}>
                <Icon path={icons.save} size={14} />
                {savingAffaire ? "Enregistrement..." : "Enregistrer"}
              </button>
            </div>
          }
        >
          <div className="form-group">
            <label>Nom *</label>
            <input value={affaireForm.nom} onChange={af("nom")} />
          </div>
          <div className="form-row gap-12">
            <div className="form-group">
              <label>État</label>
              <select value={affaireForm.etat} onChange={af("etat")}>
                <option value="en_instance">En instance</option>
                <option value="accorde">Accordé</option>
                <option value="en_execution">En exécution</option>
                <option value="annule">Annulé</option>
                <option value="acheve">Achevé</option>
              </select>
            </div>
            <div className="form-group">
              <label>Montant (MAD)</label>
              <input
                type="number" min={0} placeholder="0"
                value={affaireForm.montant} onChange={af("montant")}
                readOnly={userRole !== "admin" && !!affaireForm.montant}
                disabled={userRole !== "admin" && !affaireForm.montant}
                title={userRole !== "admin" ? "Réservé à l'administrateur" : undefined}
              />
            </div>
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea value={affaireForm.description} onChange={af("description")} rows={2} />
          </div>
        </Modal>
      )}

      {/* ── Affaire Info Modal ──────────────────────────────────── */}
      {showInfo && selectedAffaire && (
        <Modal
          title={`${selectedAffaire.numeroAffaire} — ${selectedAffaire.nom}`}
          onClose={() => setShowInfo(false)}
          style={{ width: "860px" }}
          footer={<button className="btn btn-ghost btn-sm" onClick={() => setShowInfo(false)}>Fermer</button>}
        >
          <div style={{ display: "flex", gap: 20, marginBottom: 16, fontSize: 13, flexWrap: "wrap", alignItems: "flex-end" }}>
            {[
              ["N° Affaire",       selectedAffaire.numeroAffaire],
              ["Devis",            selectedAffaire.devis],
              ["Date de creation", selectedAffaire.createdAt],
              ["Description",      selectedAffaire.description],
            ].map(([label, val]) => (
              <div key={label}>
                <div style={{ fontSize: 10, fontWeight: 600, color: "var(--gray-600)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 2 }}>{label}</div>
                <span className="chip">{val || "—"}</span>
              </div>
            ))}
            <div>
              <div style={{ fontSize: 10, fontWeight: 600, color: "var(--gray-600)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 2 }}>État</div>
              <EtatBadge etat={selectedAffaire.etat || "en_instance"} />
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 600, color: "var(--gray-600)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 2 }}>Montant</div>
              <span className="chip" style={{ fontWeight: 600 }}>
                {selectedAffaire.montant != null ? `${Number(selectedAffaire.montant).toLocaleString("fr-MA")} MAD` : "—"}
              </span>
            </div>
          </div>

          <div className="divider" />

          {history.length === 0 ? (
            <div style={{ textAlign: "center", color: "var(--gray-400)", padding: "20px 0", fontSize: 13 }}>
              Aucun pointage enregistre pour cette affaire
            </div>
          ) : (() => {
            const historyTotalPages = Math.ceil(history.length / HISTORY_PER_PAGE);
            const pagedHistory = history.slice(historyPage * HISTORY_PER_PAGE, (historyPage + 1) * HISTORY_PER_PAGE);
            return (
              <>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Employe</th>
                        <th>Plage horaire</th>
                        <th>Commentaire</th>
                      </tr>
                    </thead>
                    <tbody ref={historyTbodyRef}>{renderHistoryRows(pagedHistory)}</tbody>
                  </table>
                </div>
                <Pagination page={historyPage} totalPages={historyTotalPages} onChange={setHistoryPage} />
              </>
            );
          })()}
        </Modal>
      )}
    </div>
  );
}
