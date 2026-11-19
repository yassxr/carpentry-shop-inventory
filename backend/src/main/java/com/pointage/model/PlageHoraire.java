package com.pointage.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "plages_horaires")
@Getter
@Setter
@NoArgsConstructor
public class PlageHoraire {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pointage_id", nullable = false)
    private Pointage pointage;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "affaire_id")
    private Affaire affaire;

    @Column(name = "heure_debut")
    private LocalDateTime heureDebut;

    @Column(name = "heure_fin")
    private LocalDateTime heureFin;

    @Column(columnDefinition = "TEXT")
    private String commentaire;

    @Column(nullable = false)
    private String periode;

    @Column(name = "lieu_travail_type")
    private String lieuTravailType;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
