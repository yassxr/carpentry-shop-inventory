package com.pointage.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
public class PointageRequestDTO {
    private String datePointage;
    private Long employeId;
    private String matinHeureEntree;
    private String matinHeureSortie;
    private String apresMidiHeureEntree;
    private String apresMidiHeureSortie;
    private List<PlageHoraireDTO> plagesHoraires;
}
