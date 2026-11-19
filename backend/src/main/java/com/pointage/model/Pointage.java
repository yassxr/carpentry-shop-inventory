package com.pointage.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
    name = "pointages",
    uniqueConstraints = @UniqueConstraint(columnNames = {"date_pointage", "employe_id"})
)
@Getter
@Setter
@NoArgsConstructor
public class Pointage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "date_pointage", nullable = false)
    private LocalDate datePointage;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employe_id", nullable = false)
    private Employe employe;

    @Column(name = "matin_heure_entree")
    private LocalTime matinHeureEntree;

    @Column(name = "matin_heure_sortie")
    private LocalTime matinHeureSortie;

    @Column(name = "apresmidi_heure_entree")
    private LocalTime apresMidiHeureEntree;

    @Column(name = "apresmidi_heure_sortie")
    private LocalTime apresMidiHeureSortie;

    @OneToMany(mappedBy = "pointage", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PlageHoraire> plagesHoraires = new ArrayList<>();

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
