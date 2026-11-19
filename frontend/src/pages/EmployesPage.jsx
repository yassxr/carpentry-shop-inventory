import { useState } from "react";
import { Icon, icons } from "../components/Icon";
import Modal from "../components/Modal";
import api from "../services/api";

// ── Option lists ────────────────────────────────────────────────────────────

const QUALIFICATIONS = [
  "Sans", "Ouvrier", "Maalam", "Technicien", "Technicien spécialisé",
  "Chauffeur professionnel", "Administrateur adjoint", "Administrateur",
  "Comptable", "Ingénieur", "Ingénieur d'application", "Architecte", "Autre",
];

const DIPLOMES = [
  "Sans", "Niv primaire", "Niv collège", "Niv lycée", "Bachelier",
  "Formation professionnelle", "Niv études supérieures", "licence",
  "Master", "Doctorat", "Ingénieur", "Ingénieur d'application", "Architecte", "Autre",
];

const FONCTIONS = [
  "Directeur", "Gérant", "Secrétaire", "Chef service des études",
  "Chef service comptabilité", "Chef service RH", "Chef service des Achats",
  "Chef d'atelier", "Chef projet", "Chef chantier", "Magasinier",
  "Menuisier fabricant", "Menuisier poseur", "Menuisier finisseur",
  "Aide menuisier", "Vernisseur", "Chauffeur", "Agent d'entretien",
  "Gardien", "Apprenti", "Stagiaire", "Autre",
];

const SITUATIONS = [
  "Actif", "Congé annuel", "Congé Paternité", "Congé sans solde",
  "En formation professionnelle", "Arrêt maladie", "Accident du travail",
  "Maladie professionnelle", "Mise à pied", "Contrat suspendu",
  "Licencié", "Démissionnaire", "Retraité",
];

const SITUATIONS_FAMILIALES = ["Célibataire", "Marié", "Divorcé", "Veuf"];

// ── Empty form ───────────────────────────────────────────────────────────────

const EMPTY_FORM = {
  photo: "", prenom: "", nom: "", dateNaissance: "",
  situationFamiliale: "", nombreEnfants: "", adresse: "",
  telephone: "", email: "",
  qualificationProfessionnelle: "", qualificationAutre: "",
  diplome: "", diplomeAutre: "", dateObtentionDiplome: "",
  numeroCin: "", numeroCnss: "", numeroMatricule: "", dateEmbauche: "",
  telephoneSte: "", fonction: "", fonctionAutre: "",
  statut: "Actif",
  nombreJoursConge: "", nombreJoursAbsence: "", nombreJoursMaladie: "",
  salaireMensuel: "",
  // legacy fields kept for pointage compatibility
  tarifHoraire: "", typeEmploye: "", poste: "",
};

// ── Badge ────────────────────────────────────────────────────────────────────

function getSituationStyle(statut) {
  const s = (statut || "").toLowerCase();
  if (!s || s === "actif") return { color: "var(--green)", bg: "rgba(46,139,87,0.12)" };
  if (s.includes("congé") || s.includes("conge") || s.includes("formation"))
    return { color: "var(--orange)", bg: "rgba(224,123,42,0.12)" };
  if (s.includes("maladie") || s.includes("accident") || s.includes("arrêt") || s.includes("arret"))
    return { color: "#b7791f", bg: "rgba(183,121,31,0.12)" };
  return { color: "var(--red)", bg: "rgba(192,57,43,0.11)" };
}

function StatutBadge({ statut }) {
  const raw = statut === "conge" ? "Congé" : statut === "demissionnaire" ? "Démissionnaire" : (statut || "Actif");
  const label = raw.charAt(0).toUpperCase() + raw.slice(1);
  const { color, bg } = getSituationStyle(statut);
  return (
    <span style={{
      display: "inline-block", padding: "2px 8px", borderRadius: 20,
      fontSize: 11, fontWeight: 600, whiteSpace: "nowrap", color, background: bg,
    }}>
      {label}
    </span>
  );
}

// ── Photo ────────────────────────────────────────────────────────────────────

const DEFAULT_AVATAR = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23e8eaed'/><circle cx='50' cy='36' r='20' fill='%23b0b8c1'/><path d='M10 95 Q10 65 50 65 Q90 65 90 95' fill='%23b0b8c1'/></svg>`;

function Avatar({ src, size = 36 }) {
  return (
    <img src={src || DEFAULT_AVATAR} alt="photo"
      style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: "2px solid var(--sky-pale)" }} />
  );
}

function PhotoUpload({ current, onChange }) {
  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => onChange(ev.target.result);
    reader.readAsDataURL(file);
  };
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <Avatar src={current} size={64} />
      <div>
        <label className="btn btn-secondary btn-sm" style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}>
          <Icon path={icons.plus} size={13} />
          {current ? "Changer la photo" : "Ajouter une photo"}
          <input type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />
        </label>
        {current && (
          <button className="btn btn-ghost btn-sm" style={{ marginLeft: 8 }} onClick={() => onChange("")}>Supprimer</button>
        )}
      </div>
    </div>
  );
}

// ── Form helpers ─────────────────────────────────────────────────────────────

function SectionDivider({ title }) {
  return (
    <div style={{ margin: "20px 0 12px", borderTop: "1px solid var(--sky-pale)", paddingTop: 12 }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: "var(--gray-400)", textTransform: "uppercase", letterSpacing: "0.8px" }}>
        {title}
      </span>
    </div>
  );
}

function SelectWithAutre({ label, options, value, autreValue, onSelect, onAutre, autreLabel = "Préciser..." }) {
  return (
    <div className="form-group">
      <label>{label}</label>
      <select value={value} onChange={e => onSelect(e.target.value)}>
        <option value="">— Sélectionner —</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      {value.toLowerCase() === "autre" && (
        <input style={{ marginTop: 6 }} placeholder={autreLabel} value={autreValue} onChange={e => onAutre(e.target.value)} />
      )}
    </div>
  );
}

// ── Form fields ───────────────────────────────────────────────────────────────

function EmployeFormFields({ form, onChange }) {
  const f = key => e => onChange(key, e.target.value);
  return (
    <>
      {/* Photo */}
      <div style={{ marginBottom: 16 }}>
        <PhotoUpload current={form.photo} onChange={val => onChange("photo", val)} />
      </div>

      {/* Identity */}
      <div className="form-row gap-12">
        <div className="form-group">
          <label>Prénom *</label>
          <input value={form.prenom} onChange={f("prenom")} />
        </div>
        <div className="form-group">
          <label>Nom *</label>
          <input value={form.nom} onChange={f("nom")} />
        </div>
      </div>
      <div className="form-row gap-12">
        <div className="form-group">
          <label>Date de naissance</label>
          <input type="date" value={form.dateNaissance} onChange={f("dateNaissance")} />
        </div>
        <div className="form-group" />
      </div>
      <div className="form-row gap-12">
        <div className="form-group">
          <label>Situation familiale</label>
          <select value={form.situationFamiliale} onChange={f("situationFamiliale")}>
            <option value="">— Sélectionner —</option>
            {SITUATIONS_FAMILIALES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Nombre d'enfants à charge</label>
          <input type="number" min="0" value={form.nombreEnfants} onChange={f("nombreEnfants")} placeholder="0" />
        </div>
      </div>
      <div className="form-group">
        <label>Adresse</label>
        <input value={form.adresse} onChange={f("adresse")} placeholder="Adresse complète..." />
      </div>
      <div className="form-row gap-12">
        <div className="form-group">
          <label>Téléphone personnel</label>
          <input value={form.telephone} onChange={f("telephone")} placeholder="+212 6xx xxx xxx" />
        </div>
        <div className="form-group">
          <label>E-mail</label>
          <input type="email" value={form.email} onChange={f("email")} placeholder="exemple@mail.com" />
        </div>
      </div>

      {/* Professional background */}
      <SectionDivider title="Parcours professionnel" />
      <SelectWithAutre
        label="Qualification professionnelle"
        options={QUALIFICATIONS}
        value={form.qualificationProfessionnelle}
        autreValue={form.qualificationAutre}
        onSelect={v => onChange("qualificationProfessionnelle", v)}
        onAutre={v => onChange("qualificationAutre", v)}
        autreLabel="Préciser la qualification..."
      />
      <div className="form-row gap-12">
        <SelectWithAutre
          label="Diplôme"
          options={DIPLOMES}
          value={form.diplome}
          autreValue={form.diplomeAutre}
          onSelect={v => onChange("diplome", v)}
          onAutre={v => onChange("diplomeAutre", v)}
          autreLabel="Préciser le diplôme..."
        />
        <div className="form-group">
          <label>Date d'obtention</label>
          <input type="date" value={form.dateObtentionDiplome} onChange={f("dateObtentionDiplome")} />
        </div>
      </div>
      <div className="form-row gap-12">
        <div className="form-group">
          <label>Numéro CIN</label>
          <input value={form.numeroCin} onChange={f("numeroCin")} placeholder="Ex: AB123456" />
        </div>
        <div className="form-group">
          <label>Numéro CNSS</label>
          <input value={form.numeroCnss} onChange={f("numeroCnss")} placeholder="Ex: 123456" />
        </div>
      </div>
      <div className="form-row gap-12">
        <div className="form-group">
          <label>Numéro de matricule</label>
          <input value={form.numeroMatricule} onChange={f("numeroMatricule")} placeholder="Ex: MAT-001" />
        </div>
        <div className="form-group">
          <label>Date d'embauche</label>
          <input type="date" value={form.dateEmbauche} onChange={f("dateEmbauche")} />
        </div>
      </div>
      <div className="form-group">
        <label>N° téléphone ste AM</label>
        <input value={form.telephoneSte} onChange={f("telephoneSte")} placeholder="+212 5xx xxx xxx" />
      </div>
      <SelectWithAutre
        label="Fonction"
        options={FONCTIONS}
        value={form.fonction}
        autreValue={form.fonctionAutre}
        onSelect={v => onChange("fonction", v)}
        onAutre={v => onChange("fonctionAutre", v)}
        autreLabel="Préciser la fonction..."
      />

      {/* Administrative tracking */}
      <SectionDivider title="Suivi administratif" />
      <div className="form-group">
        <label>Situation</label>
        <select value={form.statut} onChange={f("statut")}>
          {SITUATIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div className="form-row gap-12">
        <div className="form-group">
          <label>Nb jours congé</label>
          <input type="number" min="0" value={form.nombreJoursConge} onChange={f("nombreJoursConge")} placeholder="0" />
        </div>
        <div className="form-group">
          <label>Nb jours d'absence</label>
          <input type="number" min="0" value={form.nombreJoursAbsence} onChange={f("nombreJoursAbsence")} placeholder="0" />
        </div>
      </div>
      <div className="form-row gap-12">
        <div className="form-group">
          <label>Nb jours maladie</label>
          <input type="number" min="0" value={form.nombreJoursMaladie} onChange={f("nombreJoursMaladie")} placeholder="0" />
        </div>
        <div className="form-group">
          <label>Salaire mensuel (MAD)</label>
          <input type="number" min="0" step="0.01" value={form.salaireMensuel} onChange={f("salaireMensuel")} placeholder="Ex: 5000.00" />
        </div>
      </div>
    </>
  );
}

// ── Fiche helpers ────────────────────────────────────────────────────────────

function FicheRow({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: 10, fontWeight: 700, color: "var(--gray-400)", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 3 }}>
        {label}
      </div>
      <div style={{ fontSize: 14, color: value ? "var(--navy)" : "var(--gray-400)", fontWeight: value ? 500 : 400 }}>
        {value || "—"}
      </div>
    </div>
  );
}

function FicheGrid({ children }) {
  return <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 28px" }}>{children}</div>;
}

function FicheDivider({ title }) {
  return (
    <div style={{ margin: "4px 0 12px", borderTop: "1px solid var(--sky-pale)", paddingTop: 12 }}>
      <span style={{ fontSize: 10, fontWeight: 700, color: "var(--gray-400)", textTransform: "uppercase", letterSpacing: "0.8px" }}>
        {title}
      </span>
    </div>
  );
}

function displayField(val, autre) {
  if (!val) return null;
  return val.toLowerCase() === "autre" && autre ? autre : val;
}

// ── Main page ────────────────────────────────────────────────────────────────

export default function EmployesPage({ employes, setEmployes, showToast, userRole }) {
  const isAdmin = userRole === "admin";

  const [showAdd,         setShowAdd]         = useState(false);
  const [showEdit,        setShowEdit]        = useState(false);
  const [showFiche,       setShowFiche]       = useState(false);
  const [selected,        setSelected]        = useState(null);
  const [ficheAffaires,   setFicheAffaires]   = useState([]);
  const [loadingAffaires, setLoadingAffaires] = useState(false);
  const [form,            setForm]            = useState(EMPTY_FORM);
  const [saving,          setSaving]          = useState(false);

  const handleChange = (key, val) => setForm(p => ({ ...p, [key]: val }));

  const openAdd = () => { setForm(EMPTY_FORM); setShowAdd(true); };

  const openEdit = (emp) => {
    setSelected(emp);
    setForm({
      photo:                        emp.photo                        || "",
      prenom:                       emp.prenom                       || "",
      nom:                          emp.nom                          || "",
      dateNaissance:                emp.dateNaissance                || "",
      situationFamiliale:           emp.situationFamiliale           || "",
      nombreEnfants:                emp.nombreEnfants   != null ? String(emp.nombreEnfants)   : "",
      adresse:                      emp.adresse                      || "",
      telephone:                    emp.telephone                    || "",
      email:                        emp.email                        || "",
      qualificationProfessionnelle: emp.qualificationProfessionnelle || "",
      qualificationAutre:           emp.qualificationAutre           || "",
      diplome:                      emp.diplome                      || "",
      diplomeAutre:                 emp.diplomeAutre                 || "",
      dateObtentionDiplome:         emp.dateObtentionDiplome         || "",
      numeroCin:                    emp.numeroCin                    || "",
      numeroCnss:                   emp.numeroCnss                   || "",
      numeroMatricule:              emp.numeroMatricule              || "",
      dateEmbauche:                 emp.dateEmbauche                 || "",
      telephoneSte:                 emp.telephoneSte                 || "",
      fonction:                     emp.fonction                     || "",
      fonctionAutre:                emp.fonctionAutre                || "",
      statut:                       emp.statut                       || "Actif",
      nombreJoursConge:             emp.nombreJoursConge  != null ? String(emp.nombreJoursConge)  : "",
      nombreJoursAbsence:           emp.nombreJoursAbsence != null ? String(emp.nombreJoursAbsence) : "",
      nombreJoursMaladie:           emp.nombreJoursMaladie != null ? String(emp.nombreJoursMaladie) : "",
      salaireMensuel:               emp.salaireMensuel   != null ? String(emp.salaireMensuel)   : "",
      tarifHoraire:                 emp.tarifHoraire    != null ? String(emp.tarifHoraire)    : "",
      typeEmploye:                  emp.typeEmploye                  || "",
      poste:                        emp.poste                        || "",
    });
    setShowEdit(true);
  };

  const openFiche = async (emp) => {
    setSelected(emp);
    setFicheAffaires([]);
    setShowFiche(true);
    setLoadingAffaires(true);
    try {
      const list = await api.getEmployeAffaires(emp.id);
      setFicheAffaires(list || []);
    } catch { setFicheAffaires([]); }
    finally { setLoadingAffaires(false); }
  };

  const buildPayload = () => ({
    ...form,
    nombreEnfants:      form.nombreEnfants      !== "" ? Number(form.nombreEnfants)      : null,
    nombreJoursConge:   form.nombreJoursConge   !== "" ? Number(form.nombreJoursConge)   : null,
    nombreJoursAbsence: form.nombreJoursAbsence !== "" ? Number(form.nombreJoursAbsence) : null,
    nombreJoursMaladie: form.nombreJoursMaladie !== "" ? Number(form.nombreJoursMaladie) : null,
    salaireMensuel:     form.salaireMensuel     !== "" ? Number(form.salaireMensuel)     : null,
    tarifHoraire:       form.tarifHoraire       !== "" ? Number(form.tarifHoraire)       : null,
    actif: ["Actif", "actif"].includes(form.statut),
  });

  const handleAdd = async () => {
    if (!form.nom || !form.prenom) { showToast("Nom et prénom obligatoires", "error"); return; }
    setSaving(true);
    try {
      const e = await api.createEmploye(buildPayload());
      setEmployes(prev => [...prev, e]);
      setShowAdd(false);
      showToast("Employé ajouté", "success");
    } catch { showToast("Erreur lors de l'ajout", "error"); }
    finally { setSaving(false); }
  };

  const handleEdit = async () => {
    if (!form.nom || !form.prenom) { showToast("Nom et prénom obligatoires", "error"); return; }
    setSaving(true);
    try {
      const updated = await api.updateEmploye(selected.id, buildPayload());
      setEmployes(prev => prev.map(e => e.id === updated.id ? updated : e));
      setShowEdit(false);
      showToast("Employé mis à jour", "success");
    } catch { showToast("Erreur lors de la mise à jour", "error"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try {
      await api.deleteEmploye(id);
      setEmployes(prev => prev.filter(e => e.id !== id));
      showToast("Employé supprimé", "success");
    } catch { showToast("Erreur lors de la suppression", "error"); }
  };

  const modalFooter = (onSave, onClose) => (
    <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
      <button className="btn btn-ghost btn-sm" onClick={onClose}>Annuler</button>
      <button className="btn btn-success" onClick={onSave} disabled={saving}>
        <Icon path={icons.save} size={14} /> {saving ? "Enregistrement..." : "Enregistrer"}
      </button>
    </div>
  );

  const MODAL_STYLE = { width: 700, maxWidth: "95vw" };

  return (
    <div>
      <div className="page-header">
        <h2>Personnels</h2>
        <button className="btn btn-primary" onClick={openAdd}>
          <Icon path={icons.plus} size={16} /> Ajouter
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <span><Icon path={icons.users} size={16} /> {employes.length} employé{employes.length !== 1 ? "s" : ""}</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Photo</th>
                <th>Nom &amp; Prénom</th>
                <th>Fonction</th>
                <th>Qualification</th>
                <th>Situation</th>
                <th>Téléphone</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employes.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", color: "var(--gray-400)", padding: 24 }}>
                    Aucun employé enregistré
                  </td>
                </tr>
              ) : employes.map(emp => (
                <tr key={emp.id}>
                  <td><Avatar src={emp.photo} size={36} /></td>
                  <td style={{ fontWeight: 600 }}>{emp.prenom} {emp.nom}</td>
                  <td>{displayField(emp.fonction, emp.fonctionAutre) || <span className="text-muted">—</span>}</td>
                  <td>{displayField(emp.qualificationProfessionnelle, emp.qualificationAutre) || <span className="text-muted">—</span>}</td>
                  <td><StatutBadge statut={emp.statut || "Actif"} /></td>
                  <td>{emp.telephone || <span className="text-muted">—</span>}</td>
                  <td style={{ textAlign: "right" }}>
                    <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                      <button className="btn btn-info btn-sm" onClick={() => openFiche(emp)}>
                        <Icon path={icons.info} size={13} />
                      </button>
                      {isAdmin && (
                        <button className="btn btn-secondary btn-sm" onClick={() => openEdit(emp)}>
                          <Icon path={icons.edit} size={13} />
                        </button>
                      )}
                      {isAdmin && (
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(emp.id)}>
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
      </div>

      {/* ── Add Modal ─────────────────────────────────────────────────────── */}
      {showAdd && (
        <Modal title="Nouvel Employé" onClose={() => setShowAdd(false)}
          style={MODAL_STYLE} footer={modalFooter(handleAdd, () => setShowAdd(false))}>
          <EmployeFormFields form={form} onChange={handleChange} />
        </Modal>
      )}

      {/* ── Edit Modal ────────────────────────────────────────────────────── */}
      {showEdit && selected && (
        <Modal title={`Modifier — ${selected.prenom} ${selected.nom}`} onClose={() => setShowEdit(false)}
          style={MODAL_STYLE} footer={modalFooter(handleEdit, () => setShowEdit(false))}>
          <EmployeFormFields form={form} onChange={handleChange} />
        </Modal>
      )}

      {/* ── Fiche Professionnelle ─────────────────────────────────────────── */}
      {showFiche && selected && (
        <Modal title="Fiche Professionnelle" onClose={() => setShowFiche(false)}
          style={MODAL_STYLE}
          footer={<button className="btn btn-ghost btn-sm" onClick={() => setShowFiche(false)}>Fermer</button>}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <Avatar src={selected.photo} size={72} />
              <div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "var(--navy)" }}>
                  {selected.prenom} {selected.nom}
                </div>
                <div style={{ fontSize: 13, color: "var(--gray-400)", marginTop: 2 }}>
                  {displayField(selected.fonction, selected.fonctionAutre) || "Fonction non définie"}
                </div>
                <div style={{ marginTop: 6 }}><StatutBadge statut={selected.statut || "Actif"} /></div>
              </div>
            </div>

            {/* Personal info */}
            <FicheDivider title="Informations personnelles" />
            <FicheGrid>
              <FicheRow label="Date de naissance" value={selected.dateNaissance || null} />
              <FicheRow label="Situation familiale" value={selected.situationFamiliale} />
              <FicheRow label="Enfants à charge" value={selected.nombreEnfants != null ? String(selected.nombreEnfants) : null} />
              <FicheRow label="Téléphone personnel" value={selected.telephone} />
              <FicheRow label="E-mail" value={selected.email} />
            </FicheGrid>
            {selected.adresse && (
              <FicheRow label="Adresse" value={selected.adresse} />
            )}

            {/* Professional */}
            <FicheDivider title="Parcours professionnel" />
            <FicheGrid>
              <FicheRow label="Fonction"
                value={displayField(selected.fonction, selected.fonctionAutre)} />
              <FicheRow label="Qualification professionnelle"
                value={displayField(selected.qualificationProfessionnelle, selected.qualificationAutre)} />
              <FicheRow label="Diplôme"
                value={displayField(selected.diplome, selected.diplomeAutre)} />
              <FicheRow label="Date d'obtention" value={selected.dateObtentionDiplome || null} />
              <FicheRow label="Numéro CIN" value={selected.numeroCin} />
              <FicheRow label="Numéro CNSS" value={selected.numeroCnss} />
              <FicheRow label="Numéro de matricule" value={selected.numeroMatricule} />
              <FicheRow label="Date d'embauche" value={selected.dateEmbauche || null} />
              <FicheRow label="N° téléphone ste AM" value={selected.telephoneSte} />
            </FicheGrid>

            {/* Administrative */}
            <FicheDivider title="Suivi administratif" />
            <FicheGrid>
              <FicheRow label="Nb jours congé"    value={selected.nombreJoursConge   != null ? String(selected.nombreJoursConge)   : null} />
              <FicheRow label="Nb jours d'absence" value={selected.nombreJoursAbsence != null ? String(selected.nombreJoursAbsence) : null} />
              <FicheRow label="Nb jours maladie"  value={selected.nombreJoursMaladie  != null ? String(selected.nombreJoursMaladie) : null} />
              <FicheRow label="Salaire mensuel"   value={selected.salaireMensuel      != null ? `${selected.salaireMensuel} MAD`   : null} />
            </FicheGrid>

            {/* Affaires */}
            <FicheDivider title="Affaires travaillées" />
            {loadingAffaires ? (
              <div style={{ textAlign: "center", color: "var(--gray-400)", padding: "12px 0", fontSize: 13 }}>Chargement...</div>
            ) : ficheAffaires.length === 0 ? (
              <div style={{ textAlign: "center", color: "var(--gray-400)", padding: "12px 0", fontSize: 13 }}>Aucune affaire enregistrée</div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>N° Affaire</th>
                      <th>Affaire</th>
                      <th>N° Série Projet</th>
                      <th>Projet</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ficheAffaires.map(a => (
                      <tr key={a.id}>
                        <td><span className="chip">{a.numeroAffaire || "—"}</span></td>
                        <td style={{ fontWeight: 600 }}>{a.nom}</td>
                        <td>{a.projetNumeroSerie ? <span className="chip" style={{ background: "var(--sky-pale)" }}>{a.projetNumeroSerie}</span> : <span className="text-muted">—</span>}</td>
                        <td>{a.projetNom || <span className="text-muted">—</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
