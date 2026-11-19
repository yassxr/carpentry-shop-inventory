package com.pointage.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "accomptes")
@Getter
@Setter
@NoArgsConstructor
public class Accompte {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "affaire_id", nullable = false)
    private Affaire affaire;

    @Column(name = "mode_paiement", nullable = false)
    private String modePaiement;

    @Column(name = "reference")
    private String reference;

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal montant;

    @Column(name = "saved_at")
    private LocalDateTime savedAt;

    @PrePersist
    @PreUpdate
    void onSave() {
        this.savedAt = LocalDateTime.now();
    }
}
