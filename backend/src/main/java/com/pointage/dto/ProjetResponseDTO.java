package com.pointage.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjetResponseDTO {
    private Long id;
    private String nom;
    private String situation;
    private String maitreouvrage;
    private String telephone;
    private String email;
    private String chef;
    private String bct;
    private String bet;
    private String lieu;
    private String typePersonne;
    private String nomSociete;
    private String nomResponsable;
    private String numeroSerie;
    private String createdAt;
    private List<AffaireInfo> affaires;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AffaireInfo {
        private Long id;
        private String nom;
        private String numeroAffaire;
        private String devis;
    }
}
