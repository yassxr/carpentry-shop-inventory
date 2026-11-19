CREATE DATABASE IF NOT EXISTS pointage_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE pointage_db;

CREATE TABLE IF NOT EXISTS employes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    matricule VARCHAR(50) UNIQUE NOT NULL,
    poste VARCHAR(100),
    type_employe VARCHAR(50),
    date_naissance DATE,
    tarif_horaire VARCHAR(50),
    actif BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS affaires (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL,
    nom VARCHAR(200) NOT NULL,
    description TEXT,
    lieu_travail_type ENUM('ATELIER','CHANTIER') DEFAULT NULL,
    actif BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS plages_horaires (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    affaire_id BIGINT NOT NULL,
    pointage_id BIGINT NOT NULL,
    heure_debut DATETIME NOT NULL,
    heure_fin DATETIME NOT NULL,
    commentaire TEXT,
    periode VARCHAR(50) NOT NULL,
    lieu_travail_type ENUM('ATELIER','CHANTIER') DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (affaire_id) REFERENCES affaires(id),
    FOREIGN KEY (pointage_id) REFERENCES pointages(id)
);

CREATE TABLE IF NOT EXISTS pointages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    date_pointage DATE NOT NULL,
    employe_id BIGINT NOT NULL,

    -- Matin
    matin_heure_entree TIME,
    matin_heure_sortie TIME,
    matin_affaire_id BIGINT,
    matin_commentaire TEXT,

    -- Après-midi
    apresmidi_heure_entree TIME,
    apresmidi_heure_sortie TIME,
    apresmidi_affaire_id BIGINT,
    apresmidi_commentaire TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (employe_id) REFERENCES employes(id),
    FOREIGN KEY (matin_affaire_id) REFERENCES affaires(id),
    FOREIGN KEY (apresmidi_affaire_id) REFERENCES affaires(id),
    UNIQUE KEY unique_pointage (date_pointage, employe_id)
);

-- Sample data
INSERT INTO employes (nom, prenom, matricule, poste) VALUES
('Alami', 'Mohamed', 'EMP001', 'Maçon'),
('Benali', 'Ahmed', 'EMP002', 'Électricien'),
('Chraibi', 'Youssef', 'EMP003', 'Plombier'),
('Doukali', 'Hassan', 'EMP004', 'Chef de chantier'),
('El Fassi', 'Karim', 'EMP005', 'Manœuvre');

INSERT INTO affaires (code, nom, description) VALUES
('TADDARTE', 'Projet Taddarte', 'Construction résidentielle Taddarte'),
('GSDD', 'GSDD', 'Projet GSDD'),
('AFF003', 'Villa Belvédère', 'Construction villa Belvédère'),
('AFF004', 'Immeuble Centre', 'Immeuble centre-ville');

