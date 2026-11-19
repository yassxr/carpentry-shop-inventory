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
public class AffaireHistoryItemDTO {
    private String date;
    private String employeNom;
    private String employePrenom;
    private List<PlageInfo> matinPlages;
    private List<PlageInfo> apresmidiPlages;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PlageInfo {
        private String heureDebut;
        private String heureFin;
        private String commentaire;
    }
}
