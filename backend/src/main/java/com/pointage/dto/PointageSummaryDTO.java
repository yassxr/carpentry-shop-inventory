package com.pointage.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PointageSummaryDTO {
    private Long id;
    private String employeNomComplet;
    private String matinHeureEntree;
    private String matinHeureSortie;
    private String apresMidiHeureEntree;
    private String apresMidiHeureSortie;
}
