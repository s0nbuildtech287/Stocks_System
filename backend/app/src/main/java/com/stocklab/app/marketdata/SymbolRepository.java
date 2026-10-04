package com.stocklab.app.marketdata;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SymbolRepository extends JpaRepository<SymbolEntity, Long> {
    Optional<SymbolEntity> findByTicker(String ticker);
    List<SymbolEntity> findByExchange(String exchange);
    List<SymbolEntity> findByStatus(String status);
}
