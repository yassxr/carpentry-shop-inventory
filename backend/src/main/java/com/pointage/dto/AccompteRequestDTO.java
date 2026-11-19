package com.pointage.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
public class AccompteRequestDTO {
    private Long affaireId;
    private String modePaiement;
    private String reference;
    private String date;
    private BigDecimal montant;
}
