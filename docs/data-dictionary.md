# Data Dictionary — VN Stock Lab

## 1. Quy ước chung
- **Múi giờ**: `Asia/Ho_Chi_Minh` (UTC+7)
- **Lịch giao dịch**: Thứ 2 - Thứ 6 (trừ các ngày lễ theo quy định UBCKNN)
- **Đơn vị tiền tệ**: VNĐ (Đồng Việt Nam) — Lưu ý: Không lưu dạng nghìn đồng, mọi số liệu giá và giá trị trong DB đều lưu theo VNĐ chuẩn.
- **Khối lượng (Volume)**: Đơn vị là Cổ phiếu.

## 2. Các sàn giao dịch
- `HOSE`: Biên độ dao động ±7%
- `HNX`: Biên độ dao động ±10%
- `UPCOM`: Biên độ dao động ±15%
- Quy mô lô tối thiểu: 100 cổ phiếu (lô chẵn)

## 3. Quy ước bảng dữ liệu
- `symbols`: Danh mục cổ phiếu niêm yết
- `prices_daily`: Giá OHLCV cuối ngày, giá thô (`close`) và hệ số điều chỉnh (`adj_factor`, `adj_close`)
- `financials`: Báo cáo tài chính theo Quý (Q) hoặc Năm (Y), bắt buộc theo dõi `published_date` để chống Look-ahead bias
- `metrics_daily`: Chỉ số tài chính tính sẵn (P/E, P/B, ROE, Beta, thanh khoản 20 phiên)
