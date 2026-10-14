package com.stocklab.app.papertrading.service;

import com.stocklab.app.papertrading.dto.CreatePortfolioRequest;
import com.stocklab.app.papertrading.dto.PlaceOrderRequest;

import java.util.List;
import java.util.Map;

public interface PaperTradingService {
    List<Map<String, Object>> getUserPortfolios();
    Map<String, Object> getPortfolioDetail(Long portfolioId);
    Map<String, Object> createPortfolio(CreatePortfolioRequest req);
    Map<String, Object> placeOrder(Long portfolioId, PlaceOrderRequest req);
}
