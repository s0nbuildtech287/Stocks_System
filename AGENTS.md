# AGENTS.md — VN Stock Lab

## Ngôn ngữ & phong cách
- Trả lời tiếng Việt, ngắn gọn. Code/comment tiếng Anh, tên biến rõ nghĩa.

## Kiến trúc (không phá vỡ)
- `backend/core`: Java thuần, KHÔNG import Spring/JPA. Mọi logic tài chính nằm ở đây.
- `backend/app`: Spring Boot, chỉ gọi core, không chứa công thức tài chính.
- `ingestion`: Python, chỉ thu thập dữ liệu và ghi DB.
- Đơn vị giá: VND. Ngày: DATE theo lịch giao dịch VN.

## Quy tắc bắt buộc
1. Đọc file liên quan trước khi sửa; không viết lại file không cần thiết.
2. Logic tài chính (điều chỉnh giá, chỉ số, phí, backtest, định giá) PHẢI có unit test.
3. Backtest và chỉ số chỉ dùng dữ liệu có `published_date <= ngày T` (point-in-time).
4. SQL động chỉ dùng whitelist cột + tham số hóa. Không nối chuỗi từ input.
5. Migration chỉ thêm file mới (V{n}__*.sql), không sửa migration đã chạy.
6. Không commit secret/.env. Không thêm dependency khi chưa nêu lý do.
7. Không hiển thị "nên mua/nên bán"; luôn kèm giả định và cảnh báo.

## Quy trình
- Mỗi lần chỉ làm 1 task nhỏ; chạy test trước khi báo xong.
- Báo ngắn: đã đổi gì, file nào, test nào đã chạy.
