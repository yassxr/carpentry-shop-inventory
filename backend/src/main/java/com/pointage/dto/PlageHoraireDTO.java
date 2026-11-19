package com.pointage.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlageHoraireDTO {
    private Long id;
    private Long affaireId;
    private String heureDebut;
    private String heureFin;
    private String commentaire;
    private String periode;
    private String lieuTravailType;
}
