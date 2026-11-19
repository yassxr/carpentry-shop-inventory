package com.pointage.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "projets")
@Getter
@Setter
@NoArgsConstructor
public class Projet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nom;

    @Enumerated(EnumType.STRING)
    private SituationProjet situation;

    @Column(name = "maitre_ouvrage")
    private String maitreouvrage;

    private String telephone;

    private String email;

    @Column(name = "numero_serie", unique = true, nullable = false)
    private String numeroSerie;

    private String chef;

    private String bct;

    private String bet;

    private String lieu;

    @Column(name = "type_personne", columnDefinition = "VARCHAR(16) DEFAULT 'physique'")
    private String typePersonne = "physique";

    @Column(name = "nom_societe")
    private String nomSociete;

    @Column(name = "nom_responsable")
    private String nomResponsable;

    @OneToMany(mappedBy = "projet", fetch = FetchType.LAZY)
    private List<Affaire> affaires = new ArrayList<>();

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public enum SituationProjet {
        EN_COURS, COMPLET, AVORTE
    }
}
