import { useState, useEffect } from "react";
import { Icon, icons } from "../components/Icon";
import api from "../services/api";

const EMPTY_FORM = { username: "", password: "" };

function getSession() {
  try { return JSON.parse(sessionStorage.getItem("session") || "{}"); } catch { return {}; }
}

export default function ManagementPage({ showToast }) {
  const { userId: currentUserId, username: currentUsername } = getSession();

  const [users, setUsers]               = useState([]);
  const [showModal, setShowModal]       = useState(false);
  const [editingId, setEditingId]       = useState(null);
  const [isSelfEdit, setIsSelfEdit]     = useState(false);
  const [form, setForm]                 = useState(EMPTY_FORM);
  const [saving, setSaving]             = useState(false);
  const [confirmTermId, setConfirmTermId] = useState(null);

  useEffect(() => {
    api.getUsers().then(data => setUsers(data || []));
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setIsSelfEdit(false);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (user) => {
    setEditingId(user.id);
    setIsSelfEdit(user.id === currentUserId);
    setForm({ username: user.username, password: "" });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!editingId && (!form.username.trim() || !form.password.trim())) return;
    setSaving(true);
    try {
      if (editingId) {
        const updated = await api.updateUser(editingId, form);
        setUsers(prev => prev.map(u => u.id === editingId ? updated : u));
        if (editingId === currentUserId) {
          const session = getSession();
          sessionStorage.setItem("session", JSON.stringify({
            ...session,
            username: updated.username,
          }));
        }
        showToast("Utilisateur modifié");
      } else {
        const created = await api.createUser(form);
        setUsers(prev => [...prev, created]);
        showToast("Utilisateur créé");
      }
      setShowModal(false);
    } catch (e) {
      showToast(e.message || "Erreur lors de l'enregistrement", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleTerminate = async (id) => {
    try {
      const updated = await api.terminateUser(id);
      setUsers(prev => prev.map(u => u.id === id ? updated : u));
      showToast("Compte résilié");
    } catch {
      showToast("Erreur lors de la résiliation", "error");
    } finally {
      setConfirmTermId(null);
    }
  };

  const modUsers  = users.filter(u => u.role === "mod");
  const adminUser = users.find(u => u.role === "admin");

  return (
    <div>
      <div className="page-header">
        <h2>Gestion des utilisateurs</h2>
      </div>

      {/* Admin own account */}
      {adminUser && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-header">Mon compte (Administrateur)</div>
          <div className="card-body" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15 }}>{adminUser.username}</div>
              <div style={{ fontSize: 12, color: "var(--gray-400)", marginTop: 2 }}>Administrateur — accès complet</div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => openEdit(adminUser)}>
              <Icon path={icons.edit} size={13} /> Modifier
            </button>
          </div>
        </div>
      )}

      {/* MOD users */}
      <div className="card">
        <div className="card-header">
          <span>Utilisateurs MOD</span>
          <button className="btn btn-sky btn-sm" onClick={openCreate}>
            <Icon path={icons.plus} size={14} /> Créer un utilisateur
          </button>
        </div>
        <div className="table-wrap">
          {modUsers.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: "var(--gray-400)", fontSize: 13 }}>
              Aucun utilisateur MOD créé
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Nom d'utilisateur</th>
                  <th>Statut</th>
                  <th>Créé le</th>
                  <th style={{ width: 120 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {modUsers.map(user => (
                  <tr key={user.id} style={{ opacity: user.active ? 1 : 0.5 }}>
                    <td style={{ fontWeight: 500 }}>{user.username}</td>
                    <td>
                      {user.active ? (
                        <span className="badge" style={{ background: "rgba(46,139,87,0.12)", color: "var(--green)" }}>Actif</span>
                      ) : (
                        <span className="badge" style={{ background: "rgba(192,57,43,0.12)", color: "var(--red)" }}>Résilié</span>
                      )}
                    </td>
                    <td style={{ color: "var(--gray-600)", fontSize: 12 }}>{user.createdAt || "—"}</td>
                    <td>
                      {user.active && (
                        <div style={{ display: "flex", gap: 4 }}>
                          <button className="btn btn-ghost btn-sm" onClick={() => openEdit(user)} title="Modifier">
                            <Icon path={icons.edit} size={13} />
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => setConfirmTermId(user.id)} title="Résilier">
                            <Icon path={icons.x} size={13} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Create / Edit modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div className="modal">
            <div className="modal-header">
              {editingId ? (isSelfEdit ? "Modifier mon compte" : "Modifier l'utilisateur") : "Créer un utilisateur"}
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}
                style={{ color: "white", border: "none", padding: "2px 6px" }}>
                <Icon path={icons.x} size={16} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Nom d'utilisateur *</label>
                <input
                  type="text"
                  value={form.username}
                  onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                  placeholder="Nom d'utilisateur"
                />
              </div>
              <div className="form-group">
                <label>{editingId ? "Nouveau mot de passe" : "Mot de passe *"}</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder={editingId ? "Laisser vide pour ne pas changer" : "Mot de passe"}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Annuler</button>
              <button
                className="btn btn-primary"
                onClick={handleSave}
                disabled={saving || (!editingId && (!form.username.trim() || !form.password.trim()))}
              >
                <Icon path={icons.save} size={14} />
                {saving ? "Enregistrement..." : "Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm terminate */}
      {confirmTermId && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setConfirmTermId(null); }}>
          <div className="modal" style={{ width: 380 }}>
            <div className="modal-header">Résilier le compte</div>
            <div className="modal-body">
              <p style={{ fontSize: 14 }}>
                Le compte sera désactivé et son mot de passe sera réinitialisé. L'utilisateur ne pourra plus se connecter.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setConfirmTermId(null)}>Annuler</button>
              <button className="btn btn-danger" onClick={() => handleTerminate(confirmTermId)}>
                Résilier le compte
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
