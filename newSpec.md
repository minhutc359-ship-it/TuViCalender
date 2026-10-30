# Đánh giá và định hướng nâng cấp TuViCalender – AstroAI

Repository: master

React + TypeScript + Vite

Supabase + OpenAI

Tôi đã truy cập và đọc mã nguồn của [TuViCalender](https://github.com/minhutc359-ship-it/TuViCalender?utm_source=chatgpt.com). App có nền tảng chức năng khá rõ ràng, nhưng hiện vẫn thiên về prototype chức năng hơn là một sản phẩm chiêm tinh có trải nghiệm hình ảnh hoàn chỉnh.

Định hướng tôi đề xuất là nâng cấp AstroAI thành một ứng dụng kết hợp lịch vạn niên Việt Nam, tử vi cá nhân, chiêm tinh và Tarot tương tác, có phong cách huyền bí, đồ họa minh họa riêng và animation mượt.

## 1. Những gì đang có và cần cải thiện

| Phân hệ       | Hiện trạng kiểm tra từ code                    | Hướng nâng cấp                                            |
| ------------- | ---------------------------------------------- | --------------------------------------------------------- |
| Trang chủ     | 4 chỉ số vận mệnh, âm lịch, Can Chi, giờ tốt   | Dashboard cá nhân, đồ họa cung mệnh, chỉ số có giải thích |
| Lịch ngày đẹp | Xem tháng, lọc theo sự kiện, xem chi tiết ngày | Lịch Việt Nam phong phú, chọn ngày hợp tuổi, lưu sự kiện  |
| AI Chat       | Có tích hợp OpenAI và ngữ cảnh lịch            | Đảm bảo an toàn API, lịch sử, giải thích có nguồn dữ liệu |
| Tarot         | 10 lá, trải 3 lá, đồ họa placeholder           | Bộ 78 lá minh họa, xào/rút/lật bài, nhiều kiểu trải       |
| Hồ sơ         | Biểu mẫu sinh, Bát tự, cung hoàng đạo          | Lá số có biểu đồ, hồ sơ lưu bền vững, nhiều hồ sơ         |
| Thiết kế      | Nền tím đậm, gradient, biểu tượng Lucide       | Hệ thống đồ họa đồng bộ, artwork, animation, responsive   |

Vấn đề nổi bật nhất là Tarot: Trong `src/app/pages/TarotPage.tsx`, toàn bộ 10 lá bài hiện là những ô gradient với biểu tượng Sparkles. Kết quả cũng hiển thị một ô màu thay vì ảnh lá bài thật. Animation mới dừng ở phóng to khi hover, nhấn chọn và xuất hiện kết quả; chưa có cảm giác đang thực sự xào bài, rút bài và lật bài.

Ngoài ra, các chỉ số Tình duyên, Công việc, Sức khỏe trong `HomePage.tsx` hiện dùng `Math.random()` để tạo biến thiên. Điều này có thể khiến điểm thay đổi giữa các lần tải trang mà không có thay đổi dữ liệu. Tôi đề xuất thay bằng kết quả xác định theo ngày và hồ sơ, đồng thời giải thích rõ đây là chỉ số tham khảo theo quy tắc nào.

## 2. Phát hiện cần xử lý ngay trước khi nâng cấp giao diện

Rủi ro bảo mật: API key có khả năng đã bị lộ

Repository đang ở chế độ public và có tệp `.env` được commit. Tôi đã kiểm tra: tệp này chứa `VITE_OPENAI_API_KEY` có định dạng giống khóa thật, không phải chuỗi placeholder. Trong `src/lib/openai.ts`, ứng dụng cũng dùng `dangerouslyAllowBrowser: true`, tức khóa được đưa vào mã chạy trên trình duyệt.

Đây là ưu tiên P0, cao hơn cả việc thêm hình ảnh hay animation.

Cần thực hiện ngay:

1. Thu hồi (revoke) khóa OpenAI đã xuất hiện trong repository và tạo khóa mới. Không chỉ xóa `.env` khỏi commit mới, vì lịch sử Git vẫn có thể chứa khóa cũ.
2. Loại bỏ OpenAI API key khỏi frontend và chuyển toàn bộ lời gọi AI sang Supabase Edge Function.
3. Cập nhật `.gitignore`, tạo `.env.example` chỉ chứa giá trị mẫu, kiểm soát CORS, xác thực và rate limit.
4. Kiểm tra mức sử dụng API và những khoản phí bất thường. Supabase anon key có thể là khóa công khai theo thiết kế, nhưng vẫn cần kiểm tra RLS.

Những vấn đề kỹ thuật khác đã xác nhận:

- `ProfilePage.tsx` chưa có biểu mẫu cập nhật hoạt động thực tế; một số nút là placeholder và lá số hiển thị `--`.
- `TarotPage.tsx` chưa hỗ trợ bộ 78 lá, lá xuôi/ngược, lưu phiên bói hay giải bài tổng hợp.
- `getTruc()` và `getTu()` trong `goodDays.ts` dùng công thức giản lược; giờ tốt cũng được chọn bằng phép tính theo ngày âm, chưa phải quy tắc tra giờ hoàng đạo đầy đủ. Vì vậy không nên công bố kết quả là lịch vạn niên chính xác tuyệt đối.
- Chưa có bộ kiểm thử tự động trong cây source, và `package.json` mới có lệnh `dev`/`build`, chưa có `test`/`lint`.

Tôi sẽ coi phần hiện tại là MVP cần hoàn thiện và kiểm chứng, thay vì dựa vào các tuyên bố “100% hoàn thành” trong tài liệu repository.

## 3. Định hướng đồ họa Tarot mới

Tôi đề xuất sử dụng phong cách Celestial Tarot – Huyền Tinh, kết hợp đường nét vàng cổ điển, bầu trời sao, biểu tượng thiên văn và một chút mỹ thuật Á Đông.

BỘ MẪU TÔI ĐÃ TẠO — 3 LÁ BÀI VÀ 1 MẶT LƯNG

Bốn mẫu thiết kế Tarot AstroAI

Midnight Navy · Violet · Antique Gold · Ivory

Bộ asset mẫu

Concept

Tải bộ Tarot SVG + PNG + demo animation

Gồm 4 mẫu asset gốc, README và HTML thử tương tác

Xem ảnh concept độ phân giải cao

Đây là bộ thử nghiệm để xác định phong cách hình ảnh, chưa phải 78 lá hoàn chỉnh. Tôi cũng tạo một trang HTML có thể mở trên trình duyệt để thử hiệu ứng lật 3D, xào bài mô phỏng và lần lượt mở ba lá.

Đối với bản sản phẩm, nên xây dựng đủ 78 lá (22 Major Arcana + 56 Minor Arcana), mỗi lá có artwork riêng, mặt trước/mặt sau, ý nghĩa xuôi/ngược và dữ liệu giải bài.

## 4. Animation và trải nghiệm tương tác cần bổ sung

[Tarot Deck 78 Cards DARK BLUE Gold FOIL, Tarot Deck With Guidebook & Box, Gold Gliding With Holographic Effect - Tarot Deck for Beginners - Etsy](https://images.openai.com/static-rsc-4/8PPP2rSzVIIzRwWavghhCk4wDfQl9JjvRckyYGXlRwhPCI6duz9fA0ZmDAwv4CTBcDGkmoCjjOqq0x5tkM25HNaNC4MmD2Gk4FPZdkBLD1znSuFTBOoK9DNH48_kQzPb1AiNxlVP_538I4K4zaYXvjyimoU2Kxpd13yndbsFpXg?purpose=inline)

Xào và trải bài

Chồng bài xuất hiện giữa màn hình, xào theo nhiều đợt rồi xòe hình cánh quạt. Người dùng có thể chạm hoặc kéo để chọn lá.

Animation gợi ý: 0,8–1,2 giây

[XVIII THE MOON - Cocorrina](https://images.openai.com/static-rsc-4/iY-57NfPvFtfUpQFSgNkHN6Tn-bYy4Pv61h_G_wKOIC75KhhY5euVG5w5TSkQeUt0HvsFJMD5mXA93CJ3li_9QLiytpShI7s__qg-qi0VRf82MVxv8fvQLlzu4PWxn95OGKEVmsGeugXrULmxzkv9D-F2a3KJ6NzqHACo-xEWXI?purpose=inline)

Lật bài 3D

Lá bài được kéo về vị trí trải, xoay theo trục Y, hiển thị hình minh họa cùng ánh sáng nhẹ quanh viền. Tránh hiệu ứng quá chói.

Animation gợi ý: 0,6–0,9 giây/lá

[Cartomanzia e Tarocchi Online - Letture Esoteriche](https://images.openai.com/static-rsc-4/cXQK1BrWI2rrRq58eTQyg_QdT5x7wS8UtTUmDwHUTGFSaPbRmu1b_jvopASrVrYf6jfybLXuKaU4R6YTWqr2apctCS5Pps85ADJaJhqIASfwoCf_W9tWAidVOxDBa2P-J04UDqrtv2YN1NXc3Gc4Qwyy1PwANZC1EVwFnTR8JB4?purpose=inline)

Giải bài tương tác

Hiển thị kết quả từng lá, cho phép phóng to artwork, xem biểu tượng và mở phần diễn giải tổng hợp từ ba lá.

Transition gợi ý: 250–450 ms

Những hình trong phần này là tham khảo phong cách thị giác, không phải asset được cấp phép sử dụng trong ứng dụng. Bộ mẫu tải xuống phía trên là thiết kế riêng.

Về kỹ thuật, có thể tận dụng `motion/react` đang có trong repository cùng CSS `perspective`, `rotateY`, `transform` và `opacity`. Không cần xây dựng hệ thống WebGL nặng chỉ để thực hiện các tương tác cơ bản. Cần hỗ trợ thiết bị yếu và tùy chọn giảm chuyển động.

## 5. Các tính năng mới đáng đầu tư

| Tính năng                | Cách phát triển                                    | Ưu tiên    |
| ------------------------ | -------------------------------------------------- | ---------- |
| Tarot hằng ngày          | Rút 1 lá, giải nghĩa, lưu nhật ký                  | Cao        |
| Trải Tarot nâng cao      | 1, 3, 5 lá, tình yêu, sự nghiệp, Celtic Cross      | Cao        |
| Thư viện Tarot           | Bộ sưu tập 78 lá, biểu tượng, nghĩa xuôi/ngược     | Cao        |
| Nhật ký bói bài          | Lưu câu hỏi, lá bài, cảm nhận, xem lại lịch sử     | Cao        |
| Tử vi cá nhân            | Ngày/giờ sinh, lá số, luận giải tương ứng          | Cao        |
| Lịch Việt Nam mở rộng    | Ngày lễ, tiết khí, ngày âm, sự kiện riêng          | Cao        |
| AI giải bài              | Diễn giải mối liên hệ giữa các lá và câu hỏi       | Trung bình |
| Cung hoàng đạo tương tác | 12 hình minh họa, các thuộc tính và biểu đồ        | Trung bình |
| Gieo quẻ Kinh Dịch       | Bộ 64 quẻ, cách gieo, hào động, nội dung diễn giải | Sau MVP    |

Ví dụ Labyrinthos Tarot đã phát triển các chức năng trải bài tùy chỉnh, nhật ký, học bài, đổi bộ bài và giải nghĩa xuôi/ngược. Đây là những trải nghiệm đáng tham khảo để AstroAI có tính sử dụng lâu dài hơn.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://labyrinthos.co\&sz=32)

App Store+1



## 6. Lộ trình phát triển tôi đề xuất

| Giai đoạn            | Công việc                                                                        | Tiêu chí hoàn thành                                            |
| -------------------- | -------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| P0 — Ổn định         | Khắc phục API key, chuyển AI sang backend, kiểm thử logic ngày và hồ sơ          | Không còn khóa bí mật phía client; thuật toán được kiểm chứng  |
| P1 — Tarot 2.0       | Engine 78 lá, 22 artwork Major đầu tiên, lật/xào bài, ba kiểu trải, nhật ký      | Trải bài hoàn chỉnh và không rút trùng trong cùng lượt         |
| P2 — Visual 2.0      | Hoàn thiện 56 artwork còn lại, nền động, cung hoàng đạo, icon, illustration lịch | Đồng bộ desktop/mobile, asset tải theo nhu cầu                 |
| P3 — Personalization | Hồ sơ thực, lá số, AI giải Tarot, thông báo và PWA                               | Dữ liệu cá nhân lưu an toàn, có thể sử dụng lại giữa các phiên |

Riêng ở logic lịch, tôi cũng đề xuất sửa cách xác định Hoàng Đạo/Hắc Đạo, Can Chi ngày và giờ tốt theo bộ quy tắc đã đối chiếu. Bộ lọc sự kiện hiện chỉ có 5 loại trong code dù README mô tả 6 loại; cần bổ sung Mua xe và rà soát quy tắc Nhập trạch đang có hoạt động An táng trong danh sách phù hợp.

## 7. Kiến trúc code cho Tarot 2.0

```
src/features/tarot/
├── data/
│   ├── cards.ts
│   ├── card-meanings.vi.ts
│   └── spreads.ts
├── engine/
│   ├── shuffle.ts
│   ├── draw.ts
│   └── reading.ts
├── components/
│   ├── TarotCard3D.tsx
│   ├── TarotDeck.tsx
│   ├── TarotSpread.tsx
│   └── TarotResult.tsx
└── hooks/
    └── useTarotSession.ts

public/assets/
├── tarot/
│   └── celestial-v1/
│       ├── major/
│       ├── minor/
│       └── card-back.webp
├── zodiac/
├── vietnamese-zodiac/
└── backgrounds/
```

Tôi đề xuất mỗi ảnh lá bài có bản gốc độ phân giải tối thiểu 768 × 1152, xuất thêm WebP/AVIF tối ưu và lazy load, không tải toàn bộ 78 ảnh ngay khi vào app. Dữ liệu ý nghĩa lá bài phải tách khỏi hình ảnh để có thể thay bộ bài mà không thay logic.

Kết luận: AstroAI có thể tiếp tục phát triển từ codebase hiện tại, chưa cần viết lại toàn bộ. Nhưng thứ tự nên là bảo mật và tính đúng đắn → Tarot hoàn chỉnh → đồ họa/animation → cá nhân hóa và AI nâng cao.

Tôi đã hoàn thành khảo sát mã nguồn và tạo bộ concept Tarot để bạn xem xét. Chưa thay đổi hay push code lên GitHub; các file mẫu đang được cung cấp riêng để thử nghiệm trước khi tích hợp vào repository.