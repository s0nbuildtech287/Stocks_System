package com.stocklab.app.marketdata.dto;

import com.stocklab.app.marketdata.SymbolEntity;
import java.time.LocalDate;

public record SymbolResponse(
        Long id,
        String ticker,
        String name,
        String exchange,
        String industry,
        String industryGroup,
        LocalDate listingDate,
        String status,
        Long sharesOutstanding
) {
    public static SymbolResponse fromEntity(SymbolEntity entity) {
        return new SymbolResponse(
                entity.getId(),
                entity.getTicker(),
                entity.getName(),
                entity.getExchange(),
                entity.getIndustry(),
                entity.getIndustryGroup(),
                entity.getListingDate(),
                entity.getStatus(),
                entity.getSharesOutstanding()
        );
    }
}
