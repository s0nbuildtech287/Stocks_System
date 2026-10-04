package com.stocklab.app.marketdata;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface DailyPriceRepository extends JpaRepository<DailyPriceEntity, DailyPriceEntity.DailyPriceId> {

    @Query("SELECT p FROM DailyPriceEntity p WHERE p.symbolId = :symbolId AND p.tradeDate BETWEEN :from AND :to ORDER BY p.tradeDate ASC")
    List<DailyPriceEntity> findBySymbolIdAndDateRange(
            @Param("symbolId") Long symbolId,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to
    );

    @Query("SELECT p FROM DailyPriceEntity p WHERE p.symbolId = :symbolId ORDER BY p.tradeDate DESC LIMIT :limit")
    List<DailyPriceEntity> findLatestPrices(@Param("symbolId") Long symbolId, @Param("limit") int limit);
}
