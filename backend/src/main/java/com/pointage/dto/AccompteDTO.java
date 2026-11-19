package com.pointage.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AccompteDTO {
    private Long id;
    private Long affaireId;
    private String modePaiement;
    private String reference;
    private String date;
    private BigDecimal montant;
    private String savedAt;
}
