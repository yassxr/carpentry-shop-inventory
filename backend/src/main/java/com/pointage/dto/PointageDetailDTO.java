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
public class PointageDetailDTO {
    private Long id;
    private String datePointage;
    private Long employeId;
    private String matinHeureEntree;
    private String matinHeureSortie;
    private String apresMidiHeureEntree;
    private String apresMidiHeureSortie;
    private List<PlageHoraireDTO> plagesHoraires;
}
