"use client";

import React, { useState, useMemo } from "react";
import {
  BookOpen,
  Search,
  TrendingUp,
  TrendingDown,
  Scale,
  ShieldAlert,
  HelpCircle,
  Lightbulb,
  Target,
  BarChart2,
  DollarSign,
  AlertTriangle,
  Compass,
  CheckCircle2,
  Zap,
  Layers,
  ArrowRight,
  Calculator,
  Percent,
  Clock,
  Award,
} from "lucide-react";

type CategoryType = "all" | "market_rules" | "fundamentals" | "technicals" | "strategies" | "risk_management" | "glossary";

interface TermItem {
  id: string;
  category: "market_rules" | "fundamentals" | "technicals" | "strategies" | "risk_management";
  title: string;
  shortDesc: string;
  fullDesc: string;
  formulaOrRule?: string;
  practicalAction: string;
  example: string;
  commonMistake: string;
  tags: string[];
}

const ACADEMY_ITEMS: TermItem[] = [
  // --- 1. LUẬT CHƠI & BẢNG ĐIỆN ---
  {
    id: "board-colors",
    category: "market_rules",
    title: "Màu sắc trên Bảng điện Chứng khoán",
    shortDesc: "Quy ước 5 màu chuẩn: Xanh lá, Đỏ, Vàng, Tím, Xanh lơ.",
    fullDesc:
      "Bảng điện thể hiện tâm lý mua bán qua 5 màu sắc chính so với Giá Tham Chiếu (giá đóng cửa của phiên trước đó).",
    formulaOrRule:
      "• Xanh lá: Giá Tăng (> Tham chiếu)\n• Đỏ: Giá Giảm (< Tham chiếu)\n• Vàng: Giá Bằng Tham chiếu\n• Tím (Giá Trần - Ceiling): Tăng tối đa trong ngày (+7% sàn HOSE, +10% sàn HNX, +15% sàn UPCoM)\n• Xanh lơ (Giá Sàn - Floor): Giảm tối đa trong ngày (-7% HOSE, -10% HNX, -15% UPCoM)",
    practicalAction: "Cổ phiếu màu Tím nghĩa là cầu mua cực mạnh (bên mua áp đảo hoàn toàn). Cổ phiếu màu Xanh lơ nghĩa là đang bị bán tháo khẩn cấp (mất thanh khoản bên mua).",
    example: "Nếu PNJ hôm qua đóng cửa giá 19.500 đ (sàn HOSE), thì hôm nay: Giá trần là 20.850 đ (+7%, màu Tím); Giá sàn là 18.150 đ (-7%, màu Xanh lơ).",
    commonMistake: "F0 thường FOMO đua lệnh mua giá Trần khi cổ phiếu đã tăng nóng liên tục nhiều phiên, dễ dính nhịp điều chỉnh xả hàng ngắn hạn.",
    tags: ["Màu sắc", "Giá trần", "Giá sàn", "Tham chiếu", "Biên độ"],
  },
  {
    id: "t-plus-2",
    category: "market_rules",
    title: "Chu kỳ Thanh toán T+2.5",
    shortDesc: "Quy tắc thời gian nắm giữ và lúc nào cổ phiếu được bán.",
    fullDesc:
      "Ở thị trường chứng khoán Việt Nam, giao dịch áp dụng chu kỳ thanh toán bù trừ T+2.5. Bạn mua cổ phiếu vào ngày T thì đến chiều ngày T+2 cổ phiếu mới về tài khoản.",
    formulaOrRule:
      "• Ngày T (Thứ 2): Bạn bấm Mua cổ phiếu.\n• Ngày T+1 (Thứ 3): Tiền và cổ phiếu đang trong giai đoạn trung tâm lưu ký xử lý.\n• Ngày T+2 (Thứ 4): Khoảng 11h30 - 13h00 trưa, cổ phiếu về tài khoản. Bạn có thể BÁN ngay trong phiên chiều Thứ 4!\n• Ngày T+3 (Thứ 5): Giao dịch bình thường cả ngày.",
    practicalAction: "Không thể mua xong bán lướt sóng ngay trong ngày (chưa có T+0 cho thị trường cơ sở). Khi mua phải tính trước xác suất thị trường biến động trong 2 ngày tiếp theo.",
    example: "Mua FPT sáng Thứ Hai, Thứ Ba và sáng Thứ Tư không được bán. Chiều Thứ Tư (sau 13h) FPT về tài khoản là bạn có quyền đặt lệnh bán chốt lời hoặc cắt lỗ.",
    commonMistake: "F0 tưởng mua xong là bán được liền trong ngày, khi thị trường đảo chiều bất ngờ thì không thể thoát hàng ngay lập tức được.",
    tags: ["T+2.5", "Chu kỳ", "Thanh toán", "T+0"],
  },
  {
    id: "trading-sessions",
    category: "market_rules",
    title: "Các Phiên Giao dịch: ATO, ATC & Khớp lệnh Liên tục",
    shortDesc: "Thời gian mở cửa, đóng cửa và các loại lệnh cơ bản.",
    fullDesc:
      "Một ngày giao dịch từ Thứ 2 đến Thứ 6 (nghỉ Thứ 7, CN và lễ tết), chia thành các khung giờ cụ thể trên sàn HOSE.",
    formulaOrRule:
      "• 09:00 - 09:15: Phiên ATO (Khớp lệnh định kỳ mở cửa, xác định giá mở cửa).\n• 09:15 - 11:30: Khớp lệnh liên tục buổi sáng (khớp ngay khi có giá phù hợp).\n• 11:30 - 13:00: Nghỉ trưa.\n• 13:00 - 14:30: Khớp lệnh liên tục buổi chiều.\n• 14:30 - 14:45: Phiên ATC (Khớp lệnh định kỳ đóng cửa, xác định giá chốt phiên).\n• 14:45 - 15:00: Giao dịch thỏa thuận.",
    practicalAction: "Phiên ATC (14:30 - 14:45) là phiên quan trọng nhất trong ngày, các quỹ đầu tư lớn thường cơ cấu danh mục và tay to hay kéo/đè giá vào 15 phút này.",
    example: "Lệnh LO (Limit Order) là lệnh mua/bán ở mức giá bạn chỉ định. Lệnh MP (Market Price) là lệnh mua/bán bằng mọi giá khớp ngay lập tức.",
    commonMistake: "F0 đặt lệnh ATO/ATC nhưng không hủy được (quy định không cho sửa/hủy lệnh trong 15 phút ATO/ATC), dẫn đến bị khớp giá bất lợi.",
    tags: ["ATO", "ATC", "Khớp lệnh", "Giờ giao dịch"],
  },

  // --- 2. CHỈ SỐ TÀI CHÍNH & ĐỊNH GIÁ CƠ BẢN ---
  {
    id: "pe-ratio",
    category: "fundamentals",
    title: "Chỉ số P/E (Price to Earnings)",
    shortDesc: "Bao nhiêu năm thì hòa vốn? Cổ phiếu đang đắt hay rẻ so với lợi nhuận.",
    fullDesc:
      "P/E thể hiện mức giá bạn sẵn sàng trả cho 1 đồng lợi nhuận sau thuế của doanh nghiệp. P/E = 10 nghĩa là ở mức lợi nhuận hiện tại, mất 10 năm bạn mới hoàn vốn.",
    formulaOrRule: "P/E = Thị giá cổ phiếu / EPS (Lợi nhuận trên mỗi cổ phiếu)",
    practicalAction:
      "• P/E thấp (< 10): Cổ phiếu có thể đang rẻ (được định giá thấp), HOẶC công ty đang gặp khó khăn trong tương lai.\n• P/E trung bình thị trường VN-Index thường ở mức 12 - 15 lần.\n• So sánh P/E của cổ phiếu với trung bình ngành để biết đắt hay rẻ.",
    example: "FPT có P/E khoảng 18 - 20x vì là công ty công nghệ tăng trưởng doanh thu 20%/năm. Trong khi nhóm Thép (HPG) chu kỳ cao thường có P/E dao động mạnh từ 7x đến 15x.",
    commonMistake: "Nghĩ rằng P/E cứ thấp là tốt. Nhiều cổ phiếu 'bẫy giá trị' (Value Trap) có P/E = 3-4x nhưng là do vừa thanh lý tài sản đột biến, các quý sau lỗ nặng.",
    tags: ["P/E", "Định giá", "EPS", "Lợi nhuận"],
  },
  {
    id: "pb-ratio",
    category: "fundamentals",
    title: "Chỉ số P/B (Price to Book Value)",
    shortDesc: "So sánh giá thị trường với Giá trị sổ sách của tài sản ròng.",
    fullDesc:
      "P/B cho biết giá cổ phiếu đang gấp bao nhiêu lần tài sản ròng (Vốn chủ sở hữu) của công ty sau khi đã trừ hết nợ phải trả.",
    formulaOrRule: "P/B = Thị giá cổ phiếu / Giá trị sổ sách trên mỗi cổ phiếu (BVPS)",
    practicalAction:
      "• P/B < 1.0: Cổ phiếu giao dịch dưới giá trị tài sản thực của công ty (có cơ hội bắt đáy hoặc tài sản có vấn đề trích lập dự phòng).\n• Rất hữu ích khi định giá các ngành có tài sản lớn như Ngân Hàng (TCB, MBB, VCB), Bất Động Sản (VHM), Thép (HPG).",
    example: "Năm 2022 khi thị trường sụp đổ, P/B nhóm Ngân hàng về 0.8 - 0.9x, mở ra cơ hội mua gom dài hạn với biên an toàn lớn.",
    commonMistake: "Dùng P/B để định giá công ty công nghệ hoặc dịch vụ (như FPT, MWG) - sai lầm vì tài sản vô hình và thương hiệu không thể hiện hết trên sổ sách kế toán.",
    tags: ["P/B", "Giá trị sổ sách", "Tài sản ròng", "Ngân hàng"],
  },
  {
    id: "roe-indicator",
    category: "fundamentals",
    title: "Chỉ số ROE (Return on Equity)",
    shortDesc: "Thước đo cỗ máy in tiền: 100 đồng vốn chủ làm ra bao nhiêu đồng lãi.",
    fullDesc:
      "ROE là chỉ số số 1 được tỷ phú Warren Buffett yêu thích. Nó đo lường tỷ suất sinh lời trên mỗi đồng vốn chủ sở hữu bỏ ra.",
    formulaOrRule: "ROE (%) = (Lợi nhuận sau thuế / Vốn chủ sở hữu) × 100%",
    practicalAction:
      "• Doanh nghiệp tốt có ROE > 15% liên tục trong 3 - 5 năm.\n• ROE > 20% là doanh nghiệp xuất sắc, có lợi thế cạnh tranh bền vững (Moat).\n• ROE < 10% là sử dụng vốn kém hiệu quả, gửi ngân hàng có khi an toàn hơn.",
    example: "PNJ, FPT, MWG, VNM thường xuyên duy trì ROE trên 18 - 25%, chứng tỏ đội ngũ ban lãnh đạo kinh doanh cực kỳ hiệu quả.",
    commonMistake: "Không kiểm tra xem ROE cao do kinh doanh giỏi hay do vay nợ quá nhiều (đòn bẩy tài chính D/E cao cũng làm tăng ảo ROE nhưng rủi ro phá sản tăng vọt).",
    tags: ["ROE", "Warren Buffett", "Hiệu quả vốn", "Lợi nhuận ròng"],
  },
  {
    id: "dividend-yield",
    category: "fundamentals",
    title: "Cổ tức & Ngày GDKHQ (Giao Dịch Không Hưởng Quyền)",
    shortDesc: "Nhận tiền mặt từ công ty và hiện tượng giá bị điều chỉnh giảm.",
    fullDesc:
      "Cổ tức là phần lợi nhuận công ty chia cho cổ đông (tiền mặt hoặc cổ phiếu thưởng). Vào ngày Giao Dịch Không Hưởng Quyền (GDKHQ), giá cổ phiếu sẽ bị điều chỉnh giảm kỹ thuật tương ứng với giá trị cổ tức nhận được.",
    formulaOrRule: "Tỷ suất cổ tức = (Cổ tức tiền mặt 1 năm / Thị giá cổ phiếu) × 100%",
    practicalAction: "Nếu bạn muốn nhận cổ tức, bạn phải mua và nắm giữ cổ phiếu TRƯỚC ngày GDKHQ. Nếu mua đúng ngày GDKHQ thì bạn KHÔNG được nhận cổ tức đợt đó.",
    example: "Cổ phiếu VNM giá 70.000 đ, trả cổ tức tiền mặt 2.000 đ/cp. Vào ngày GDKHQ, giá mở cửa tham chiếu của VNM sẽ tự động trừ đi 2.000 đ còn 68.000 đ. Vài tuần sau 2.000 đ tiền mặt (trừ 5% thuế) sẽ đổ về tài khoản.",
    commonMistake: "F0 tưởng mua sát ngày nhận cổ tức là 'ăn lời miễn phí', không biết rằng giá cổ phiếu trên bảng điện sẽ bị trừ tương ứng vào ngày GDKHQ.",
    tags: ["Cổ tức", "GDKHQ", "Chia thưởng", "Thu nhập thụ động"],
  },

  // --- 3. PHÂN TÍCH KỸ THUẬT & CHỈ BÁO ---
  {
    id: "candlestick",
    category: "technicals",
    title: "Biểu đồ Nến Nhật & Các Mẫu Nến Đảo Chiều",
    shortDesc: "Đọc vị cuộc chiến giữa Phe Mua (Bulls) và Phe Bán (Bears).",
    fullDesc:
      "Mỗi cây nến thể hiện 4 mức giá trong phiên: Mở cửa (Open), Đóng cửa (Close), Cao nhất (High), Thấp nhất (Low). Nến xanh nghĩa là Giá đóng cửa > Giá mở cửa (phe Mua thắng thế); Nến đỏ là ngược lại.",
    formulaOrRule:
      "• Nến Doji: Thân nến mảnh như đường chỉ, thể hiện sự do dự, lưỡng lự giằng co.\n• Nến Búa (Hammer): Thân nhỏ ở trên, bóng dưới dài gấp đôi thân, xuất hiện ở đáy xu hướng giảm báo hiệu phe mua bắt đáy đảo chiều tăng.\n• Nến Marubozu: Nến thân dài đặc, không có râu, thể hiện lực mua/bán áp đảo cực mạnh.",
    practicalAction: "Kết hợp mẫu nến đảo chiều với vùng Hỗ trợ/Kháng cự và Khối lượng để tăng độ tin cậy lên 80%. Không nên chỉ nhìn 1 cây nến đơn lẻ.",
    example: "Khi PNJ giảm từ 22k về 18k và xuất hiện một cây nến Búa (Hammer) râu dưới dài cùng thanh khoản nổ to đột biến, đó là dấu hiệu tạo đáy ngắn hạn.",
    commonMistake: "Mua ngay khi thấy nến xanh mà không nhìn khối lượng (Volume thấp nến xanh dễ là bẫy Bulltrap của đội lái).",
    tags: ["Nến Nhật", "Hammer", "Doji", "Kháng cự", "Hỗ trợ"],
  },
  {
    id: "volume-analysis",
    category: "technicals",
    title: "Khối Lượng Giao Dịch (Volume) - Dấu Chân Tay To",
    shortDesc: "Giá có thể nói dối, nhưng Khối Lượng thì không bao giờ nói dối.",
    fullDesc:
      "Volume thể hiện số lượng cổ phiếu trao tay trong phiên. Dòng tiền thông minh (Smart Money / Cá mập / Đội lái) chỉ để lại dấu vết qua khối lượng đột biến.",
    formulaOrRule:
      "• Giá Tăng + Volume Cao: Xu hướng tăng rất mạnh và bền vững (Có dòng tiền tổ chức mua vào).\n• Giá Tăng + Volume Yếu: Tăng rướn, thiếu lực cầu, rủi ro đảo chiều.\n• Giá Giảm + Volume Đột Biến: Bán tháo, phân phối, nên đứng ngoài hoặc cắt lỗ ngay.\n• Giá Giảm + Volume Cạn Kiệt: Lực bán đã yếu dần, chuẩn bị tạo đáy cân bằng.",
    practicalAction: "Chỉ giải ngân mạnh khi thấy phiên bùng nổ vượt kháng cự kèm Volume gấp 1.5 đến 2 lần trung bình 20 phiên (Vol 20 MA).",
    example: "SSI đi ngang tích lũy 3 tuần với thanh khoản thấp, bất ngờ 1 phiên tăng +5% kèm khối lượng gấp 3 lần bình thường -> Dấu hiệu chân sóng lớn.",
    commonMistake: "F0 chỉ nhìn % tăng giá mà bỏ qua Volume. Mua vào những phiên trần ảo (Vol bé tẹo) rất dễ bị úp sọt khi hàng về.",
    tags: ["Volume", "Thanh khoản", "Dòng tiền", "Cá mập"],
  },
  {
    id: "rsi-indicator",
    category: "technicals",
    title: "Chỉ báo RSI (Relative Strength Index - Sức mạnh tương đối)",
    shortDesc: "Nhận biết vùng Quá Mua (>70) và Quá Bán (<30) để không mua đỉnh bán đáy.",
    fullDesc:
      "RSI dao động từ 0 đến 100, đo lường tốc độ và sự thay đổi của biến động giá để xác định vùng mua bán cực đoan.",
    formulaOrRule:
      "• RSI > 70: Vùng Quá Mua (Overbought) - Cổ phiếu đã tăng nóng, không nên mua đuổi, canh chốt lời.\n• RSI < 30: Vùng Quá Bán (Oversold) - Thị trường bi quan tột cùng, cổ phiếu bị bán quá đà, chuẩn bị có nhịp hồi.\n• Phân kỳ âm (Bearish Divergence): Giá tạo đỉnh mới cao hơn nhưng RSI lại tạo đỉnh thấp hơn -> Cảnh báo sụp đổ sắp tới!",
    practicalAction: "Trong thị trường Uptrend mạnh, RSI có thể neo trên 70 rất lâu. Tuyệt đối đừng vội bán khống chỉ vì thấy RSI > 70.",
    example: "Đợt sụp đổ tháng 11/2022, VN-Index rơi về RSI 18 (quá bán lịch sử), sau đó thị trường bật tăng dựng đứng hơn 300 điểm.",
    commonMistake: "F0 thấy RSI < 30 là tất tay bắt đáy ngay phiên đầu tiên. Cổ phiếu rơi tự do có thể đưa RSI từ 30 về 15, bắt đáy sớm dễ đứt tay.",
    tags: ["RSI", "Quá mua", "Quá bán", "Phân kỳ", "Chỉ báo"],
  },
  {
    id: "moving-averages",
    category: "technicals",
    title: "Đường Trung Bình Động (MA20, MA50, MA200)",
    shortDesc: "Thước đo xu hướng: Ngắn hạn, Trung hạn và Dài hạn.",
    fullDesc:
      "Đường MA làm mịn biến động giá hàng ngày để chỉ ra hướng đi chủ đạo của dòng tiền.",
    formulaOrRule:
      "• MA20: Xu hướng ngắn hạn (khoảng 1 tháng giao dịch). Cổ phiếu nằm trên MA20 là đang khỏe.\n• MA50: Xu hướng trung hạn (khoảng 1 quý).\n• MA200: Đường sinh tử dài hạn (khoảng 1 năm).\n• Golden Cross (Điểm giao cắt vàng): MA50 cắt lên MA200 -> Bắt đầu một Siêu chu kỳ Uptrend dài hạn.\n• Death Cross (Điểm giao cắt tử thần): MA50 cắt xuống MA200 -> Báo hiệu Downtrend dài hạn.",
    practicalAction: "Nguyên tắc đánh theo trend: Khi cổ phiếu nằm trên MA20 và MA20 dốc lên -> Chỉ ưu tiên Canh Mua. Khi giá gãy MA20 dốc xuống -> Ưu tiên Canh Bán, giữ tiền mặt.",
    example: "Năm 2020-2021, cổ phiếu HPG liên tục bám trên đường MA20 để đi từ giá 12k lên 56k mà không hề gãy đường xu hướng này.",
    commonMistake: "F0 cố gắng mua gom cổ phiếu đang nằm sâu dưới đường MA200 đang cắm đầu xuống, tưởng mua được giá rẻ nhưng chôn vốn hàng năm trời.",
    tags: ["MA20", "MA50", "MA200", "Golden Cross", "Xu hướng"],
  },

  // --- 4. CHIẾN LƯỢC ĐÁNH & BẮT TREND ---
  {
    id: "trend-following",
    category: "strategies",
    title: "Chiến Lược 'Trend is your Friend' (Đánh Thuận Xu Hướng)",
    shortDesc: "Không đoán đỉnh đoán đáy, chỉ bơi theo chiều dòng chảy thị trường.",
    fullDesc:
      "Phương pháp đầu tư huyền thoại được các phù thủy tài chính áp dụng: Thị trường chỉ có 3 trạng thái: Tăng (Uptrend), Giảm (Downtrend), và Đi ngang (Sideway). Chỉ kiếm được nhiều tiền nhất khi đánh trong Uptrend.",
    formulaOrRule:
      "• Cấu trúc Uptrend: Đáy sau cao hơn đáy trước (Higher Low) VÀ Đỉnh sau cao hơn đỉnh trước (Higher High).\n• Cấu trúc Downtrend: Đỉnh sau thấp hơn đỉnh trước VÀ Đáy sau thấp hơn đáy trước.\n• Điểm mua: Mua ở các nhịp điều chỉnh (Pullback) kiểm định lại hỗ trợ trong một Uptrend rõ ràng.",
    practicalAction: "Đừng bao giờ cố gắng bắt dao rơi trong Downtrend. Hãy kiên nhẫn đợi cổ phiếu tạo xong cấu trúc đáy sau cao hơn đáy trước rồi mới giải ngân.",
    example: "Khi VN-Index vượt mốc 1.200 điểm và duy trì trên MA50, mua bất kỳ cổ phiếu đầu ngành nào cũng có lãi 15 - 30%. Ngược lại khi VN-Index dưới MA200 thì mua gì cũng dễ lỗ.",
    commonMistake: "Tư duy 'thích mua rẻ' thay vì 'mua cổ phiếu mạnh'. Mua cổ phiếu yếu đang rơi vì rẻ, bỏ qua cổ phiếu dẫn dắt (Leader) đang liên tục vượt đỉnh.",
    tags: ["Trend", "Uptrend", "Downtrend", "Pullback", "Bắt trend"],
  },
  {
    id: "breakout-trading",
    category: "strategies",
    title: "Chiến Lược Vượt Đỉnh (Breakout / Mua Điểm Pivot)",
    shortDesc: "Mua cao để bán giá cao hơn nữa - bí quyết của Mark Minervini & O'Neil.",
    fullDesc:
      "Sau một thời gian tích lũy chặt chẽ (vài tuần hoặc vài tháng) tạo các mẫu hình như Cốc tay cầm (Cup & Handle) hoặc Thu hẹp độ biến động (VCP), cổ phiếu bứt phá mạnh mẽ vượt qua vùng kháng cự đỉnh.",
    formulaOrRule:
      "• Điều kiện 1: Nền giá tích lũy siết chặt, thanh khoản cạn kiệt ở cuối nền.\n• Điều kiện 2: Phiên Breakout giá tăng mạnh (> 3%) VÀ Volume nổ lớn (> 150-200% trung bình).\n• Điểm cắt lỗ: Đặt ngay dưới đáy cây nến Breakout hoặc dưới cạnh trên của nền giá (-5% đến -7%).",
    practicalAction: "Mua đúng phiên Breakout (hoặc nhịp retest nhẹ 1-2 phiên sau đó). Không mua khi cổ phiếu đã chạy quá xa nền giá (> 5% từ điểm Pivot).",
    example: "FPT tích lũy vùng 120-125k suốt 2 tháng, bất ngờ nổ phiên tăng trần lên 133k với thanh khoản 10 triệu cổ -> Điểm mua chuẩn mẫu hình Breakout.",
    commonMistake: "Mua phiên Breakout nhưng không để ý Volume (Fake Breakout / Bẫy vượt đỉnh giả). Khi thị trường yếu, Breakout rất dễ thất bại.",
    tags: ["Breakout", "Pivot", "VCP", "Cốc tay cầm", "Vượt đỉnh"],
  },
  {
    id: "canslim-system",
    category: "strategies",
    title: "Hệ Thống Tầm Soát Siêu Cổ Phiếu CANSLIM",
    shortDesc: "Công thức chọn cổ phiếu chiến thắng của William O'Neil.",
    fullDesc:
      "CANSLIM kết hợp hoàn hảo giữa Phân tích Cơ bản (chọn doanh nghiệp tăng trưởng bùng nổ) và Phân tích Kỹ thuật (chọn thời điểm mua vào hoàn hảo).",
    formulaOrRule:
      "• C (Current Earnings): Tăng trưởng EPS quý hiện tại tối thiểu 20-25%.\n• A (Annual Earnings): Tăng trưởng lợi nhuận năm liên tục 3 năm qua > 20%.\n• N (New): Sản phẩm mới, ban lãnh đạo mới, giá cao mới (vượt đỉnh).\n• S (Supply & Demand): Cung cầu cổ phiếu, thanh khoản tốt.\n• L (Leader): Chọn cổ phiếu dẫn đầu ngành, loại bỏ cổ phiếu lẹt đẹt (Laggard).\n• I (Institutional Sponsorship): Có quỹ lớn, tổ chức uy tín bảo trợ gom hàng.\n• M (Market Direction): Xu hướng thị trường chung đang là Uptrend.",
    practicalAction: "Không bao giờ mua cổ phiếu tăng trưởng khi thị trường chung (chữ M) đang trong xu hướng giảm mạnh.",
    example: "MWG giai đoạn mở chuỗi Bách Hóa Xanh và Điện Máy Xanh (2016-2021) hay FPT mảng AI/bán dẫn thỏa mãn trọn vẹn 7 tiêu chí CANSLIM.",
    commonMistake: "Chỉ chú ý chữ C và A mà bỏ quên chữ M (Market Direction). 75% cổ phiếu sẽ rơi theo thị trường chung dù doanh nghiệp có tốt đến đâu.",
    tags: ["CANSLIM", "William O'Neil", "Tăng trưởng", "Siêu cổ phiếu"],
  },

  // --- 5. QUẢN TRỊ RỦI RO & TÂM LÝ THÉP ---
  {
    id: "stop-loss-rule",
    category: "risk_management",
    title: "Quy Tắc Cắt Lỗ Thép: -7% Phải Cắt Không Thắc Mắc!",
    shortDesc: "Vũ khí sống còn duy nhất bảo vệ tài khoản của bạn trên thương trường.",
    fullDesc:
      "Trong đầu tư chứng khoán, bạn không thể kiểm soát giá cổ phiếu sẽ đi đâu, nhưng bạn HOÀN TOÀN kiểm soát được số tiền mình sẵn sàng chấp nhận mất.",
    formulaOrRule:
      "• Lỗ -4% đến -5%: Cắt bỏ 1/2 vị thế ngay lập tức để giảm áp lực tâm lý.\n• Lỗ -7% đến -8%: Cắt sạch 100% vị thế, dứt khoát không ngoại lệ!\n• TUYỆT ĐỐI KHÔNG BAO GIỜ TRUNG BÌNH GIÁ XUỐNG KHI ĐANG LỖ!",
    practicalAction: "Xem khoản lỗ nhỏ (-7%) giống như phí bảo hiểm để bảo toàn vốn. Cắt lỗ sớm giúp bạn giữ lại 93% tiền để làm lại ở thương vụ thắng lớn tiếp theo.",
    example: "Nếu bạn mua 100 triệu, lỗ 7% bạn còn 93 triệu (chỉ cần lãi lại 7.5% là hòa vốn). Nhưng nếu bạn gồng lỗ đến -50% (còn 50 triệu), bạn phải kiếm được một mã lãi +100% (gấp đôi) mới chỉ để về lại vốn gốc!",
    commonMistake: "Biến một khoản lướt sóng ngắn hạn thành 'nhà đầu tư dài hạn bất đắc dĩ' chỉ vì tiếc tiền không chịu cắt lỗ khi mới chớm -7%.",
    tags: ["Cắt lỗ", "Stop Loss", "Kỷ luật", "Bảo toàn vốn"],
  },
  {
    id: "risk-reward-ratio",
    category: "risk_management",
    title: "Tỷ Lệ Lợi Nhuận / Rủi Ro (Risk / Reward >= 2:1)",
    shortDesc: "Chỉ vào lệnh khi miếng bánh tiềm năng lớn gấp đôi rủi ro gánh chịu.",
    fullDesc:
      "Tỷ lệ R:R là chìa khóa giúp bạn dù chỉ đánh trúng 40-50% số lần vẫn có thể kiếm được cả gia tài. Nếu mỗi lần thắng ăn 15-20%, mỗi lần thua chỉ mất 5-7%, bạn là nhà đầu tư bất khả chiến bại về dài hạn.",
    formulaOrRule:
      "Tỷ lệ R:R = (Mục tiêu Chốt Lời - Giá Mua) / (Giá Mua - Mức Cắt Lỗ)\n• R:R chuẩn tối thiểu: 2.0 đến 3.0 (Ví dụ: Chấp nhận mất 1 đồng để có cơ hội ăn 2 đến 3 đồng).",
    practicalAction: "Trước khi bấm nút MUA, hãy lấy bút tính ngay: Điểm cắt lỗ ở đâu? Điểm chốt lời ở đâu? Nếu R:R < 2:1 thì bỏ qua, tìm cơ hội khác.",
    example: "Mua HPG giá 20.000 đ. Điểm cắt lỗ ở 18.800 đ (-1.200 đ, tương đương 6%). Kháng cự mục tiêu chốt lời ở 23.000 đ (+3.000 đ, tương đương 15%). Tỷ lệ R:R = 3.000 / 1.200 = 2.5:1 -> Kèo đáng chơi!",
    commonMistake: "F0 thường có tỷ lệ R:R ngược: Lãi 2-3% đã vội vã chốt non vì sợ mất lãi, nhưng khi lỗ -20% đến -40% vẫn kiên trì ôm gồng đến cùng.",
    tags: ["R:R", "Risk Reward", "Chốt lời", "Tính toán"],
  },
  {
    id: "margin-management",
    category: "risk_management",
    title: "Quản Trị Margin (Đòn Bẩy Tài Chính) & Force Sell",
    shortDesc: "Con dao hai lưỡi: Nhân đôi tài sản lúc thăng hoa, cháy tài khoản lúc sụp đổ.",
    fullDesc:
      "Margin là vay tiền của công ty chứng khoán để mua thêm cổ phiếu (ví dụ có 100 triệu, vay thêm 100 triệu thành 200 triệu, tỷ lệ 1:1).",
    formulaOrRule:
      "• Call Margin (Yêu cầu bổ sung ký quỹ): Khi tài khoản chạm ngưỡng an toàn (thường tỷ lệ Rtt < 0.85), bạn phải nạp thêm tiền hoặc bán bớt cổ phiếu.\n• Force Sell (Bán giải chấp): Nếu không nạp tiền, công ty chứng khoán sẽ tự động mang cổ phiếu của bạn ra bán bằng lệnh MP bất chấp thị trường sàn lơ.",
    practicalAction: "Người mới (F0) tuyệt đối KHÔNG ĐƯỢC DÙNG MARGIN trong 1-2 năm đầu tiên. Chỉ dùng Margin khi thị trường rõ ràng Uptrend và cổ phiếu bạn nắm giữ đang CÓ SẴN LÃI LỚN.",
    example: "Bạn có 100tr, vay 100tr margin mua cổ phiếu. Cổ phiếu giảm -20% (mất 40tr trên tổng 200tr), nghĩa là vốn gốc 100tr của bạn đã bốc hơi mất -40%!",
    commonMistake: "F0 dùng full margin bắt đáy khi cổ phiếu đang rơi, kết quả dính chuỗi phiên giảm sàn liên tiếp dẫn đến bị công ty chứng khoán Call Margin và Force Sell sạch tài sản.",
    tags: ["Margin", "Đòn bẩy", "Call Margin", "Force Sell", "Cháy tài khoản"],
  },
];

export default function AcademyView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>("all");
  const [activeItem, setActiveItem] = useState<TermItem | null>(ACADEMY_ITEMS[0]);
  const [calcLoss, setCalcLoss] = useState<number>(20);

  const categories = [
    { id: "all", label: "Tất Cả", icon: BookOpen, count: ACADEMY_ITEMS.length },
    { id: "market_rules", label: "Bảng Điện & Luật Chơi", icon: Clock, count: ACADEMY_ITEMS.filter((i) => i.category === "market_rules").length },
    { id: "fundamentals", label: "Chỉ Số Tài Chính (FA)", icon: DollarSign, count: ACADEMY_ITEMS.filter((i) => i.category === "fundamentals").length },
    { id: "technicals", label: "Phân Tích Kỹ Thuật (TA)", icon: BarChart2, count: ACADEMY_ITEMS.filter((i) => i.category === "technicals").length },
    { id: "strategies", label: "Chiến Lược & Bắt Trend", icon: Target, count: ACADEMY_ITEMS.filter((i) => i.category === "strategies").length },
    { id: "risk_management", label: "Quản Trị Rủi Ro & Vốn", icon: ShieldAlert, count: ACADEMY_ITEMS.filter((i) => i.category === "risk_management").length },
  ];

  const filteredItems = useMemo(() => {
    return ACADEMY_ITEMS.filter((item) => {
      const matchCategory = selectedCategory === "all" || item.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.shortDesc.toLowerCase().includes(q) ||
        item.fullDesc.toLowerCase().includes(q) ||
        item.tags.some((t) => t.toLowerCase().includes(q));
      return matchCategory && matchSearch;
    });
  }, [selectedCategory, searchQuery]);

  // Gain required to recover from loss
  const gainRequired = useMemo(() => {
    if (calcLoss <= 0) return 0;
    if (calcLoss >= 99) return 9900;
    return Math.round(((calcLoss / (100 - calcLoss)) * 100) * 10) / 10;
  }, [calcLoss]);

  return (
    <div className="space-y-6 pb-12 text-[#EAECEF]">
      {/* 1. HERO BANNER */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#181A20] via-[#12161C] to-[#181A20] border border-[#2B313A] p-6 lg:p-8 shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F0B90B]/10 border border-[#F0B90B]/30 text-[#F0B90B] text-xs font-bold uppercase tracking-wider">
            <Award className="w-3.5 h-3.5" />
            Stock Academy • F0 to Pro Toàn Thư
          </div>
          <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight">
            Cẩm Nang Nhập Môn &amp; Chiến Lược Đầu Tư Thực Chiến
          </h1>
          <p className="text-xs lg:text-sm text-[#848E9C] leading-relaxed">
            Hệ thống kiến thức tinh gọn, thực dụng nhất dành cho nhà đầu tư Việt Nam: Đọc vị bảng điện,
            chỉ số tài chính P/E, P/B, nến Nhật, đường MA, phương pháp bắt trend và nguyên tắc cắt lỗ sống còn.
          </p>

          {/* Search bar */}
          <div className="pt-2">
            <div className="relative max-w-xl">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#848E9C]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm nhanh thuật ngữ (VD: P/E, Nến búa, Cắt lỗ, T+2.5, Margin, RSI...)"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0B0E11]/90 border border-[#2B313A] focus:border-[#F0B90B] focus:outline-none text-xs text-white placeholder-[#848E9C] transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#848E9C] hover:text-white"
                >
                  Xóa
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Decorative backdrop glow */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-[#F0B90B]/5 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 2. CATEGORY FILTER TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id as CategoryType)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? "bg-[#F0B90B] text-[#1E2329] shadow-md shadow-yellow-500/20"
                  : "bg-[#181A20] text-[#848E9C] hover:text-white hover:bg-[#2B313A] border border-[#2B313A]"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isActive ? "bg-black/20 text-[#1E2329]" : "bg-[#2B313A] text-[#848E9C]"
                }`}
              >
                {cat.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. MAIN SPLIT VIEW: LIST + DETAIL VIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column: Topic Card List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1 text-xs text-[#848E9C] font-semibold">
            <span>Danh mục chủ đề ({filteredItems.length})</span>
            <span>Chọn để xem chi tiết</span>
          </div>

          <div className="space-y-2 max-h-[720px] overflow-y-auto pr-1">
            {filteredItems.map((item) => {
              const isSelected = activeItem?.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setActiveItem(item)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer text-left ${
                    isSelected
                      ? "bg-[#181A20] border-[#F0B90B] shadow-md shadow-yellow-500/10"
                      : "bg-[#12161C] border-[#2B313A] hover:border-[#848E9C]/50 hover:bg-[#181A20]/80"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-[#2B313A]/60 text-[#F0B90B]">
                      {item.category === "market_rules"
                        ? "Luật Chơi"
                        : item.category === "fundamentals"
                        ? "Cơ Bản (FA)"
                        : item.category === "technicals"
                        ? "Kỹ Thuật (TA)"
                        : item.category === "strategies"
                        ? "Chiến Lược"
                        : "Quản Trị Rủi Ro"}
                    </span>
                    <ArrowRight
                      className={`w-3.5 h-3.5 transition-transform ${
                        isSelected ? "text-[#F0B90B] translate-x-1" : "text-[#848E9C]"
                      }`}
                    />
                  </div>
                  <h3 className={`text-sm font-bold ${isSelected ? "text-white" : "text-[#EAECEF]"}`}>
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#848E9C] mt-1 line-clamp-2 leading-relaxed">
                    {item.shortDesc}
                  </p>

                  <div className="flex flex-wrap gap-1 mt-2.5">
                    {item.tags.map((t, i) => (
                      <span
                        key={i}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-[#0B0E11] text-[#848E9C] border border-[#2B313A]"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}

            {filteredItems.length === 0 && (
              <div className="p-8 text-center bg-[#12161C] border border-[#2B313A] rounded-xl text-xs text-[#848E9C]">
                Không tìm thấy thuật ngữ nào khớp với từ khóa "{searchQuery}".
              </div>
            )}
          </div>
        </div>

        {/* Right column: Deep-Dive Details (7 cols) */}
        <div className="lg:col-span-7">
          {activeItem ? (
            <div className="p-6 rounded-2xl bg-[#12161C] border border-[#2B313A] space-y-6 shadow-xl sticky top-6">
              {/* Header */}
              <div className="border-b border-[#2B313A] pb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#F0B90B]/15 text-[#F0B90B] border border-[#F0B90B]/30">
                    Chuyên Đề Toàn Diện
                  </span>
                  <span className="text-xs text-[#848E9C] font-mono">ID: {activeItem.id}</span>
                </div>
                <h2 className="text-xl lg:text-2xl font-black text-white">{activeItem.title}</h2>
                <p className="text-xs text-[#F0B90B] font-semibold mt-1">{activeItem.shortDesc}</p>
              </div>

              {/* Full Explanation */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-[#848E9C] uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-[#0ECB81]" /> Giải Thích Chi Tiết
                </h4>
                <p className="text-xs lg:text-sm text-[#EAECEF] leading-relaxed bg-[#181A20] p-4 rounded-xl border border-[#2B313A]">
                  {activeItem.fullDesc}
                </p>
              </div>

              {/* Formula or Rules */}
              {activeItem.formulaOrRule && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-[#848E9C] uppercase tracking-wider flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-[#F0B90B]" /> Công Thức &amp; Quy Tắc Chuẩn
                  </h4>
                  <div className="p-4 rounded-xl bg-[#0B0E11] border border-[#F0B90B]/30 font-mono text-xs text-[#EAECEF] whitespace-pre-line leading-relaxed">
                    {activeItem.formulaOrRule}
                  </div>
                </div>
              )}

              {/* Practical Action (Ứng dụng thực chiến) */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-[#848E9C] uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-[#00F0FF]" /> Ứng Dụng Thực Chiến (F0 Cần Làm Gì?)
                </h4>
                <div className="p-4 rounded-xl bg-[#0ECB81]/10 border border-[#0ECB81]/30 text-xs lg:text-sm text-[#EAECEF] leading-relaxed">
                  {activeItem.practicalAction}
                </div>
              </div>

              {/* Real Vietnam Stock Example */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-[#848E9C] uppercase tracking-wider flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5 text-[#F0B90B]" /> Ví Dụ Thực Tế Thị Trường Việt Nam
                </h4>
                <div className="p-4 rounded-xl bg-[#181A20] border border-[#2B313A] text-xs text-[#EAECEF] leading-relaxed italic">
                  💡 "{activeItem.example}"
                </div>
              </div>

              {/* Common Pitfall (Cạm bẫy F0 hay mắc) */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-[#848E9C] uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-[#F6465D]" /> Cạm Bẫy Phổ Biến Cần Tránh
                </h4>
                <div className="p-4 rounded-xl bg-[#F6465D]/10 border border-[#F6465D]/30 text-xs text-[#F6465D] leading-relaxed font-medium">
                  ⚠️ {activeItem.commonMistake}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center bg-[#12161C] border border-[#2B313A] rounded-2xl text-sm text-[#848E9C]">
              Vui lòng chọn một chủ đề ở cột bên trái để xem nội dung chi tiết.
            </div>
          )}
        </div>
      </div>

      {/* 4. INTERACTIVE TOOL: MÁY TÍNH HÒA VỐN SAU KHI LỖ (LOSS RECOVERY MATRIX) */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-[#181A20] via-[#12161C] to-[#181A20] border border-[#2B313A] shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#2B313A] pb-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-[#F6465D] uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4" /> Bảng Tính Sát Thủ: Sự Tàn Khốc Của Việc Gồng Lỗ
            </div>
            <h3 className="text-lg lg:text-xl font-black text-white mt-1">
              Máy Tính: Lỗ X% Cần Phải Lãi Bao Nhiêu % Để Hòa Vốn?
            </h3>
            <p className="text-xs text-[#848E9C] mt-1">
              Kéo thanh trượt để hiểu tại sao mọi huyền thoại đầu tư đều đặt việc "Cắt lỗ sớm" lên hàng đầu.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-[#0B0E11] p-3 rounded-xl border border-[#2B313A]">
            <div className="text-right">
              <div className="text-[10px] text-[#848E9C] uppercase">Nếu bạn để Lỗ</div>
              <div className="text-lg font-black text-[#F6465D]">-{calcLoss}%</div>
            </div>
            <ArrowRight className="w-4 h-4 text-[#848E9C]" />
            <div className="text-left">
              <div className="text-[10px] text-[#848E9C] uppercase">Cần Lãi Để Hòa Vốn</div>
              <div className="text-lg font-black text-[#0ECB81]">+{gainRequired}%</div>
            </div>
          </div>
        </div>

        {/* Slider */}
        <div className="space-y-4 max-w-2xl mx-auto py-2">
          <input
            type="range"
            min="5"
            max="90"
            step="5"
            value={calcLoss}
            onChange={(e) => setCalcLoss(Number(e.target.value))}
            className="w-full accent-[#F0B90B] cursor-pointer h-2 bg-[#2B313A] rounded-lg"
          />
          <div className="flex justify-between text-[11px] font-mono text-[#848E9C]">
            <span>Lỗ 5% (Cần +5.3%)</span>
            <span>Lỗ 20% (Cần +25%)</span>
            <span>Lỗ 50% (Cần +100%)</span>
            <span>Lỗ 80% (Cần +400%)</span>
          </div>
        </div>

        {/* Matrix comparison table */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 mt-6 pt-6 border-t border-[#2B313A]/50">
          {[
            { loss: 5, gain: 5.3, safe: true },
            { loss: 7, gain: 7.5, safe: true },
            { loss: 10, gain: 11.1, safe: false },
            { loss: 20, gain: 25.0, safe: false },
            { loss: 50, gain: 100.0, safe: false },
            { loss: 75, gain: 300.0, safe: false },
          ].map((item, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-xl border text-center transition-all ${
                item.loss === 7
                  ? "bg-[#F0B90B]/10 border-[#F0B90B] text-white"
                  : "bg-[#0B0E11]/60 border-[#2B313A]"
              }`}
            >
              <div className="text-[11px] text-[#848E9C]">Mất</div>
              <div className="text-sm font-black text-[#F6465D]">-{item.loss}%</div>
              <div className="text-[10px] text-[#848E9C] mt-1">Cần gỡ lại</div>
              <div className="text-xs font-black text-[#0ECB81]">+{item.gain}%</div>
              {item.loss === 7 && (
                <div className="mt-1 text-[9px] font-bold text-[#F0B90B] uppercase">Ngưỡng Thép ⭐</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 5. CHECKLIST 5 BƯỚC VÀO LỆNH THỰC CHIẾN CHO NGƯỜI MỚI */}
      <div className="p-6 rounded-2xl bg-[#12161C] border border-[#2B313A] shadow-xl">
        <h3 className="text-base font-extrabold text-white flex items-center gap-2 mb-4">
          <CheckCircle2 className="w-5 h-5 text-[#0ECB81]" />
          Checklist 5 Bước Sống Còn Trước Khi Bấm Nút "MUA" Bất Kỳ Cổ Phiếu Nào
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {[
            {
              step: "Bước 1",
              title: "Xu Hướng Thị Trường",
              desc: "VN-Index có đang nằm trên MA20/MA50 không? Tuyệt đối không tất tay khi thị trường đang rơi mạnh.",
            },
            {
              step: "Bước 2",
              title: "Sức Khỏe Doanh Nghiệp",
              desc: "Doanh nghiệp có lợi nhuận dương, P/E và ROE hợp lý (>15%), không dính bê bối pháp lý hoặc nợ quá hạn.",
            },
            {
              step: "Bước 3",
              title: "Điểm Mua Kỹ Thuật",
              desc: "Cổ phiếu có nền giá tích lũy hoặc mẫu hình tin cậy (Breakout, VCP) kèm Volume lớn xác nhận không?",
            },
            {
              step: "Bước 4",
              title: "Tỷ Lệ Lợi Nhuận / Rủi Ro",
              desc: "Đo khoảng cách: Mục tiêu chốt lời có cao gấp ít nhất 2 đến 3 lần khoảng cách cắt lỗ (R:R >= 2:1) không?",
            },
            {
              step: "Bước 5",
              title: "Lập Sẵn Kế Hoạch Cắt Lỗ",
              desc: "Xác định rõ con số: Nếu sai chạm ngưỡng -7% sẽ lập tức bấm BÁN, tuyệt đối không gồng lỗ hay hy vọng hão huyền.",
            },
          ].map((item, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-[#181A20] border border-[#2B313A] space-y-1.5">
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-[#F0B90B]/15 text-[#F0B90B] border border-[#F0B90B]/30 uppercase">
                {item.step}
              </span>
              <h4 className="text-xs font-bold text-white pt-1">{item.title}</h4>
              <p className="text-[11px] text-[#848E9C] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
