package com.pointage.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "employes")
@Getter
@Setter
@NoArgsConstructor
public class Employe {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nom;

    @Column(nullable = false)
    private String prenom;

    private String poste;

    @Column(name = "tarif_horaire")
    private Double tarifHoraire;

    @Column(name = "numero_cnss")
    private String numeroCnss;

    private String telephone;

    @Column(columnDefinition = "LONGTEXT")
    private String photo;

    @Column(name = "date_naissance")
    private LocalDate dateNaissance;

    @Column(name = "type_employe")
    private String typeEmploye;

    @Column(nullable = false)
    private Boolean actif = true;

    @Column(nullable = false, columnDefinition = "VARCHAR(50) DEFAULT 'Actif'")
    private String statut = "Actif";

    // ── New personnel fields ────────────────────────────────────────────────────

    @Column(name = "situation_familiale")
    private String situationFamiliale;

    @Column(name = "nombre_enfants")
    private Integer nombreEnfants;

    @Column(columnDefinition = "LONGTEXT")
    private String adresse;

    private String email;

    @Column(name = "qualification_professionnelle")
    private String qualificationProfessionnelle;

    @Column(name = "qualification_autre")
    private String qualificationAutre;

    private String diplome;

    @Column(name = "diplome_autre")
    private String diplomeAutre;

    @Column(name = "date_obtention_diplome")
    private LocalDate dateObtentionDiplome;

    @Column(name = "telephone_ste")
    private String telephoneSte;

    private String fonction;

    @Column(name = "fonction_autre")
    private String fonctionAutre;

    @Column(name = "nombre_jours_conge")
    private Integer nombreJoursConge;

    @Column(name = "nombre_jours_absence")
    private Integer nombreJoursAbsence;

    @Column(name = "nombre_jours_maladie")
    private Integer nombreJoursMaladie;

    @Column(name = "salaire_mensuel")
    private Double salaireMensuel;

    @Column(name = "numero_cin")
    private String numeroCin;

    @Column(name = "numero_matricule")
    private String numeroMatricule;

    @Column(name = "date_embauche")
    private LocalDate dateEmbauche;

    // ───────────────────────────────────────────────────────────────────────────

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
