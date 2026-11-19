const BASE_URL = 'http://localhost:8080/api';

const handleResponse = async (res) => {
  if (!res.ok) {
    if (res.status === 404) return null;
    const error = await res.text();
    console.error('API Error:', res.status, error);
    throw new Error(error || `HTTP error ${res.status}`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
};

const api = {
  // Employés
  getEmployes: () => fetch(`${BASE_URL}/employes`).then(handleResponse),
  getEmployeAffaires: (id) => fetch(`${BASE_URL}/employes/${id}/affaires`).then(handleResponse),
  createEmploye: (data) => fetch(`${BASE_URL}/employes`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
  }).then(handleResponse),
  updateEmploye: (id, data) => fetch(`${BASE_URL}/employes/${id}`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
  }).then(handleResponse),
  deleteEmploye: (id) => fetch(`${BASE_URL}/employes/${id}`, { method: 'DELETE' }).then(handleResponse),

  // Affaires
  getAffaires: () => fetch(`${BASE_URL}/affaires`).then(handleResponse),
  getAffairesUnassigned: () => fetch(`${BASE_URL}/affaires/unassigned`).then(handleResponse),
  createAffaire: (data) => fetch(`${BASE_URL}/affaires`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
  }).then(handleResponse),
  updateAffaire: (id, data) => fetch(`${BASE_URL}/affaires/${id}`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
  }).then(handleResponse),
  deleteAffaire: (id) => fetch(`${BASE_URL}/affaires/${id}`, { method: 'DELETE' }).then(handleResponse),
  getAffaireHistory: (id) => fetch(`${BASE_URL}/affaires/${id}/history`).then(handleResponse),

  // Projets
  getProjets: () => fetch(`${BASE_URL}/projets`).then(handleResponse),
  createProjet: (data) => fetch(`${BASE_URL}/projets`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
  }).then(handleResponse),
  updateProjet: (id, data) => fetch(`${BASE_URL}/projets/${id}`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
  }).then(handleResponse),
  deleteProjet: (id) => fetch(`${BASE_URL}/projets/${id}`, { method: 'DELETE' }).then(handleResponse),
  addAffaireToProjet: (projetId, data) => fetch(`${BASE_URL}/projets/${projetId}/affaires`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
  }).then(handleResponse),
  assignAffaireToProjet: (projetId, affaireId) => fetch(`${BASE_URL}/projets/${projetId}/affaires/${affaireId}`, {
    method: 'POST'
  }).then(handleResponse),

  // Salaire mensuel
  getSalaireMensuel: (employeId, mois) =>
    fetch(`${BASE_URL}/pointages/employe/${employeId}/mois/${mois}`).then(handleResponse),

  // Pointages
  savePointage: (data) => fetch(`${BASE_URL}/pointages`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
  }).then(handleResponse),
  getPointagesByDate: (date) => fetch(`${BASE_URL}/pointages/date/${date}`).then(handleResponse),
  getPointageByEmployeDate: (employeId, date) =>
    fetch(`${BASE_URL}/pointages/employe/${employeId}/date/${date}`).then(handleResponse),
  getPointagesByRange: (debut, fin) =>
    fetch(`${BASE_URL}/pointages/range?debut=${debut}&fin=${fin}`).then(handleResponse),
  deletePointage: (id) => fetch(`${BASE_URL}/pointages/${id}`, { method: 'DELETE' }).then(handleResponse),

  // Plages horaires
  getPlagesHoraires: (pointageId, periode) =>
    fetch(`${BASE_URL}/pointages/${pointageId}/plages-horaires${periode ? `?periode=${periode}` : ''}`)
      .then(handleResponse),
  createPlageHoraire: (pointageId, data) => fetch(`${BASE_URL}/pointages/${pointageId}/plages-horaires`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
      affaireId: data.affaireId,
      lieuTravailType: data.lieuTravailType,
      heureDebut: data.heureDebut,
      heureFin: data.heureFin,
      commentaire: data.commentaire,
      periode: data.periode,
    })
  }).then(handleResponse),
  updatePlageHoraire: (pointageId, id, data) =>
    fetch(`${BASE_URL}/pointages/${pointageId}/plages-horaires/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
        affaireId: data.affaireId,
        lieuTravailType: data.lieuTravailType,
        heureDebut: data.heureDebut,
        heureFin: data.heureFin,
        commentaire: data.commentaire,
      })
    }).then(handleResponse),
  deletePlageHoraire: (pointageId, id) =>
    fetch(`${BASE_URL}/pointages/${pointageId}/plages-horaires/${id}`, { method: 'DELETE' }).then(handleResponse),

  // Auth
  login: (data) => fetch(`${BASE_URL}/auth/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
  }).then(handleResponse),

  // Users
  getUsers: () => fetch(`${BASE_URL}/users`).then(handleResponse),
  createUser: (data) => fetch(`${BASE_URL}/users`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
  }).then(handleResponse),
  updateUser: (id, data) => fetch(`${BASE_URL}/users/${id}`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
  }).then(handleResponse),
  terminateUser: (id) => fetch(`${BASE_URL}/users/${id}/terminate`, {
    method: 'PUT'
  }).then(handleResponse),

  // Accomptes
  getAccomptes: (affaireId) => fetch(`${BASE_URL}/accomptes/affaire/${affaireId}`).then(handleResponse),
  createAccompte: (data) => fetch(`${BASE_URL}/accomptes`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
  }).then(handleResponse),
  updateAccompte: (id, data) => fetch(`${BASE_URL}/accomptes/${id}`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
  }).then(handleResponse),
  deleteAccompte: (id) => fetch(`${BASE_URL}/accomptes/${id}`, { method: 'DELETE' }).then(handleResponse),

};

export default api;