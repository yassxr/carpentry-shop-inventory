package com.pointage.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "affaires")
@Getter
@Setter
@NoArgsConstructor
public class Affaire {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nom;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private Boolean actif = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "projet_id")
    private Projet projet;

    @Column(name = "numero_affaire")
    private String numeroAffaire;

    private String devis;

    @Column(name = "lieu_travail_type")
    private String lieuTravailType;

    @Column(name = "etat", columnDefinition = "VARCHAR(32) DEFAULT 'en_instance'")
    private String etat = "en_instance";

    @Column(precision = 15, scale = 2)
    private BigDecimal montant;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
