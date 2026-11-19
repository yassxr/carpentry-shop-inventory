package com.pointage.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PointageMensuelDTO {
    private String date;
    private String jourSemaine;
    private boolean weekend;
    private boolean samedi;

    private Long pointageId;
    private String matinHeureEntree;
    private String matinHeureSortie;
    private String apresMidiHeureEntree;
    private String apresMidiHeureSortie;

    private double heuresTravaillees;
    private double heuresReglementaires;
    private double heuresSupplementaires;
}
