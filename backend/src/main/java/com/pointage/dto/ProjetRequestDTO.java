package com.pointage.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class ProjetRequestDTO {
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
}
