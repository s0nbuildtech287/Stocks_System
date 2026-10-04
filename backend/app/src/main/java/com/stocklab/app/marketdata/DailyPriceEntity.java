package com.stocklab.app.marketdata;

import jakarta.persistence.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Objects;

@Entity
@Table(name = "prices_daily")
@IdClass(DailyPriceEntity.DailyPriceId.class)
public class DailyPriceEntity {

    public static class DailyPriceId implements Serializable {
        private Long symbolId;
        private LocalDate tradeDate;

        public DailyPriceId() {}
        public DailyPriceId(Long symbolId, LocalDate tradeDate) {
            this.symbolId = symbolId;
            this.tradeDate = tradeDate;
        }
        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (!(o instanceof DailyPriceId that)) return false;
            return Objects.equals(symbolId, that.symbolId) && Objects.equals(tradeDate, that.tradeDate);
        }
        @Override
        public int hashCode() {
            return Objects.hash(symbolId, tradeDate);
        }
    }

    @Id
    @Column(name = "symbol_id", nullable = false)
    private Long symbolId;

    @Id
    @Column(name = "trade_date", nullable = false)
    private LocalDate tradeDate;

    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal open;

    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal high;

    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal low;

    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal close;

    @Column(nullable = false)
    private Long volume;

    @Column(precision = 24, scale = 2)
    private BigDecimal value;

    @Column(name = "adj_factor", nullable = false, precision = 20, scale = 10)
    private BigDecimal adjFactor = BigDecimal.ONE;

    @Column(name = "adj_close", precision = 18, scale = 4)
    private BigDecimal adjClose;

    // Getters and Setters
    public Long getSymbolId() { return symbolId; }
    public void setSymbolId(Long symbolId) { this.symbolId = symbolId; }
    public LocalDate getTradeDate() { return tradeDate; }
    public void setTradeDate(LocalDate tradeDate) { this.tradeDate = tradeDate; }
    public BigDecimal getOpen() { return open; }
    public void setOpen(BigDecimal open) { this.open = open; }
    public BigDecimal getHigh() { return high; }
    public void setHigh(BigDecimal high) { this.high = high; }
    public BigDecimal getLow() { return low; }
    public void setLow(BigDecimal low) { this.low = low; }
    public BigDecimal getClose() { return close; }
    public void setClose(BigDecimal close) { this.close = close; }
    public Long getVolume() { return volume; }
    public void setVolume(Long volume) { this.volume = volume; }
    public BigDecimal getValue() { return value; }
    public void setValue(BigDecimal value) { this.value = value; }
    public BigDecimal getAdjFactor() { return adjFactor; }
    public void setAdjFactor(BigDecimal adjFactor) { this.adjFactor = adjFactor; }
    public BigDecimal getAdjClose() { return adjClose; }
    public void setAdjClose(BigDecimal adjClose) { this.adjClose = adjClose; }
}
