package com.pointage.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AffaireDTO {
    private Long id;
    private String nom;
    private String description;
    private Boolean actif;
    private String numeroAffaire;
    private String devis;
    private Long projetId;
    private String projetNom;
    private String projetNumeroSerie;
    private String createdAt;
    private String lieuTravailType;
    private String etat;
    private BigDecimal montant;
}
