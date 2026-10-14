package com.stocklab.app.marketdata.dto;

import com.stocklab.app.marketdata.DailyPriceEntity;
import java.math.BigDecimal;
import java.time.LocalDate;

public record DailyPriceResponse(
        LocalDate tradeDate,
        BigDecimal open,
        BigDecimal high,
        BigDecimal low,
        BigDecimal close,
        BigDecimal adjClose,
        Long volume,
        BigDecimal value
) {
    public static DailyPriceResponse fromEntity(DailyPriceEntity entity) {
        return new DailyPriceResponse(
                entity.getTradeDate(),
                entity.getOpen(),
                entity.getHigh(),
                entity.getLow(),
                entity.getClose(),
                entity.getAdjClose(),
                entity.getVolume(),
                entity.getValue()
        );
    }
}
