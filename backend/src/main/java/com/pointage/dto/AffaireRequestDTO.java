package com.pointage.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
public class AffaireRequestDTO {
    private String nom;
    private String description;
    private Boolean actif;
    private Long projetId;
    private String lieuTravailType;
    private String etat;
    private BigDecimal montant;
}
