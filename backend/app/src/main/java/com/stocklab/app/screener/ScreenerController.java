package com.stocklab.app.screener;

import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/v1/screener")
public class ScreenerController {

    private final NamedParameterJdbcTemplate jdbcTemplate;

    // Strict security whitelist of allowed column names
    private static final Set<String> ALLOWED_COLUMNS = Set.of(
            "pe_ttm", "pb", "ps_ttm", "eps_ttm", "bvps", "roe_ttm", "roa_ttm",
            "net_margin_ttm", "debt_to_equity", "revenue_growth_yoy", "profit_growth_yoy",
            "avg_value_20d", "market_cap", "beta_1y", "volatility_60d",
            "return_1m", "return_3m", "return_12m"
    );

    public ScreenerController(NamedParameterJdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public record ScreenerCondition(String field, String op, Object value) {}

    public record ScreenerRequest(
            List<String> exchanges,
            List<ScreenerCondition> conditions,
            String sortBy,
            String sortDir,
            Integer limit
    ) {}

    @PostMapping("/run")
    public ResponseEntity<?> runScreener(@RequestBody(required = false) ScreenerRequest request) {
        StringBuilder sql = new StringBuilder("""
            SELECT s.ticker, s.name, s.exchange, s.industry_group,
                   m.market_cap, m.avg_value_20d, m.pe_ttm, m.pb, m.roe_ttm, m.eps_ttm, m.revenue_growth_yoy
            FROM symbols s
            LEFT JOIN LATERAL (
                SELECT * FROM metrics_daily md
                WHERE md.symbol_id = s.id
                ORDER BY md.trade_date DESC
                LIMIT 1
            ) m ON true
            WHERE s.status = 'LISTED'
        """);

        MapSqlParameterSource params = new MapSqlParameterSource();

        if (request != null) {
            if (request.exchanges() != null && !request.exchanges().isEmpty()) {
                sql.append(" AND s.exchange IN (:exchanges)");
                params.addValue("exchanges", request.exchanges());
            }

            if (request.conditions() != null) {
                int idx = 0;
                for (ScreenerCondition cond : request.conditions()) {
                    if (cond.field() == null || !ALLOWED_COLUMNS.contains(cond.field().toLowerCase())) {
                        continue; // Block non-whitelisted columns
                    }
                    String paramName = "param_" + idx++;
                    String safeCol = "m." + cond.field().toLowerCase();

                    switch (cond.op().toUpperCase()) {
                        case ">=" -> { sql.append(" AND ").append(safeCol).append(" >= :").append(paramName); params.addValue(paramName, cond.value()); }
                        case "<=" -> { sql.append(" AND ").append(safeCol).append(" <= :").append(paramName); params.addValue(paramName, cond.value()); }
                        case ">"  -> { sql.append(" AND ").append(safeCol).append(" > :").append(paramName);  params.addValue(paramName, cond.value()); }
                        case "<"  -> { sql.append(" AND ").append(safeCol).append(" < :").append(paramName);  params.addValue(paramName, cond.value()); }
                        case "="  -> { sql.append(" AND ").append(safeCol).append(" = :").append(paramName);  params.addValue(paramName, cond.value()); }
                    }
                }
            }

            // Safe sorting
            String sortCol = "m.market_cap";
            if (request.sortBy() != null && ALLOWED_COLUMNS.contains(request.sortBy().toLowerCase())) {
                sortCol = "m." + request.sortBy().toLowerCase();
            }
            String sortDirection = "DESC".equalsIgnoreCase(request.sortDir()) ? "DESC" : "ASC";
            sql.append(" ORDER BY ").append(sortCol).append(" ").append(sortDirection).append(" NULLS LAST");

            int maxLimit = (request.limit() != null && request.limit() > 0 && request.limit() <= 200) ? request.limit() : 50;
            sql.append(" LIMIT ").append(maxLimit);
        } else {
            sql.append(" ORDER BY m.market_cap DESC NULLS LAST LIMIT 50");
        }

        try {
            List<Map<String, Object>> results = jdbcTemplate.queryForList(sql.toString(), params);
            return ResponseEntity.ok(Map.of(
                    "count", results.size(),
                    "items", results
            ));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of(
                    "count", 0,
                    "items", List.of(),
                    "note", "No DB rows currently available or default sample data."
            ));
        }
    }

    @GetMapping("/presets")
    public ResponseEntity<?> getPresets() {
        return ResponseEntity.ok(List.of(
                Map.of("id", 1, "name", "Cổ phiếu tăng trưởng (ROE > 15%, Tăng trưởng LN > 20%)", "description", "Lọc các doanh nghiệp có hiệu quả sinh lời và tăng trưởng tốt"),
                Map.of("id", 2, "name", "Cổ phiếu định giá rẻ (P/E < 10, P/B < 1.5)", "description", "Tìm kiếm cơ hội cổ phiếu có mức định giá thấp"),
                Map.of("id", 3, "name", "Top vốn hóa & thanh khoản cao", "description", "Lọc cổ phiếu thanh khoản 20 phiên > 20 tỷ VNĐ")
        ));
    }
}
