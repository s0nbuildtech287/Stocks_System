# VN Stock Lab — Quantitative Terminal & Trading Engine

Nền tảng phân tích định lượng, tối ưu hóa danh mục đầu tư và mô phỏng giao dịch chứng khoán Việt Nam (HOSE, HNX, UPCOM) với dữ liệu thời gian thực.

---

## 1. Mô tả dự án

VN Stock Lab là hệ thống Quantitative Finance Terminal dành cho thị trường chứng khoán Việt Nam, cung cấp công cụ tính toán tài chính nâng cao, quản trị rủi ro danh mục và bảng điện trực tiếp theo chuẩn quy chế giao dịch UBCKNN.

Hệ thống được thiết kế theo hướng module hóa, kết hợp giữa thuật toán định lượng, giao diện trực quan và khả năng triển khai linh hoạt (hỗ trợ cả môi trường Serverless Vercel lẫn kiến trúc microservices với Docker/VPS).

---

## 2. Tính năng chính

- Live Market Data: Bảng điện trực tiếp kết nối VPS Datafeed (< 200ms), tự động cập nhật thời gian thực kèm biểu đồ nến TradingView.
- Portfolio Optimizer: Tối ưu hóa danh mục theo mô hình Markowitz (Modern Portfolio Theory), mô phỏng Monte Carlo, tìm điểm Max Sharpe và Min Variance.
- Risk & Stress Testing: Đo lường rủi ro với Value-at-Risk (VaR 95%, VaR 99%), Conditional VaR và kiểm thử áp lực qua các giai đoạn khủng hoảng thị trường.
- 360° Corporate Insight & News: Tổng hợp chỉ số tài chính (P/E, P/B, EPS, ROE, ROA) và tự động cào tin tức doanh nghiệp từ Google News RSS.
- Peer Comparison: Phân tích và so sánh đối thủ cạnh tranh đa trục trên biểu đồ Radar.
- Paper Trading T+2.5: Sổ lệnh mô phỏng khớp lệnh, quản lý số dư và chu kỳ thanh toán chứng khoán chuẩn Việt Nam.
- Stock Screener: Bộ lọc cổ phiếu đa tiêu chí theo phân tích cơ bản và tín hiệu kỹ thuật.
- Valuation Engine: Mô hình định giá tài sản tài chính CAPM và chiết khấu dòng tiền.

---

## 3. Tech Skills & Công nghệ sử dụng

Frontend:
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- TradingView Lightweight Charts & ECharts
- Lucide Icons

Backend & Thuật toán:
- Java 21 LTS (Clean Architecture, Apache Commons Math)
- Spring Boot 3.3.4 (RESTful API, Spring Security, JWT, Spring Data JPA)
- Node.js / Serverless Edge Runtime (TypeScript Native Quant Engine)
- Python 3.12 (ETL Ingestion Pipeline)

Database & DevOps:
- PostgreSQL 16 & Flyway Database Migration
- Docker & Docker Compose
- Caffeine Cache & Redis
- Swagger / OpenAPI 3

---

## 4. Hướng dẫn khởi động

Cài đặt và chạy cục bộ:

```bash
# 1. Cài đặt thư viện
npm install

# 2. Khởi động giao diện Terminal (Port 3000)
npm run dev
```

Truy cập: http://localhost:3000

Khởi động Full-Stack với Docker (tùy chọn khi cần Database & Java Backend):

```bash
docker compose up -d
```

---

## 5. Tác giả

Xuân Sơn (xu4ns0n)
- GitHub: https://github.com/s0nbuildtech287
- Định hướng: Java Backend Developer / FinTech Systems
