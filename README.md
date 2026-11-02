# AstroAI · Celestial Tarot

Ứng dụng React + TypeScript + Vite kết hợp lịch Việt Nam, hồ sơ chiêm tinh và Tarot theo concept Huyền Tinh: midnight navy, violet, antique gold, ivory.

## Chạy trên máy

Yêu cầu Node.js 22.12+ và npm.

```bash
npm ci
npm run dev
```

Mở địa chỉ Vite in trong terminal. Trang chủ, lịch, hồ sơ và Tarot hoạt động không cần backend.

```bash
npm run typecheck
npm test
npm run build
```

Kiểm thử trình duyệt:

```bash
npx playwright install chromium
npm run test:e2e
npm run build
npm run test:offline
```

Nếu máy đã có Chrome, đặt `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` thành đường dẫn executable. Các bài kiểm thử chặn dịch vụ Supabase bên ngoài, không gửi email hoặc gọi AI thật.

## Chức năng hiện có

- Mystic Fusion: theme Fusion/Đông/Tây hoặc tự đổi theo màn hình; nền sao, mây, vòng đồ họa và bộ SVG riêng. Có tùy chọn không gian tĩnh và hỗ trợ giảm chuyển động của thiết bị.
- Trang chủ có hai góc nhìn Đông/Tây; lịch có huy hiệu ngày, bảng chi tiết lớn và ngày gợi ý theo bộ lọc; hồ sơ chia hai truyền thống, đếm thiên can theo ngũ hành từ dữ liệu thật của hồ sơ.
- Chat có persona Đông/Tây, câu hỏi gợi ý và nhãn từng phản hồi; gửi lựa chọn được kiểm tra tới backend. Cần triển khai lại `chat-ai` để dùng chỉ dẫn persona mới.
- Tarot 78 lá: 22 Major + 56 Minor, nghĩa tiếng Việt xuôi/ngược, Fisher–Yates dùng Web Crypto, không rút trùng trong phiên.
- Năm kiểu trải: lá hằng ngày, ba lá thời gian, ba lá tình yêu, năm lá sự nghiệp và Celtic Cross mười lá.
- Luận giải tại máy cho đủ 78 lá: xuôi/ngược, chủ đề, vị trí trải, liên hệ giữa lá, hành động và câu hỏi suy ngẫm. Không cần API AI.
- Cài đặt chọn Celestial hoặc JoJo ref cho đủ 78 lá; tải trọn bộ để mở lại ứng dụng khi mất mạng.
- Sáu minh họa editorial Celestial Feng Shui cho Home, Đông phương, Tây phương, Lịch, Hồ sơ và Chat; WebP lazy-load và được kiểm tra trong core offline pack.
- Xào/xòe bài, chọn bằng chuột hoặc bàn phím, lật 3D tuần tự, phóng to artwork, hỗ trợ giảm chuyển động.
- Thư viện tìm kiếm và lọc theo bộ; nhật ký lưu câu hỏi, hướng lá và ghi chú, xem lại/sửa/xóa. Giữ tối đa 200 phiên.
- Hồ sơ: thêm, sửa, xóa, chuyển nhiều hồ sơ; cung Mặt Trời, Can Chi, con giáp và thuộc tính tham khảo.
- Lịch dương/âm UTC+7, sáu bộ lọc sự kiện, lọc lục xung năm sinh âm và sự kiện cá nhân.
- Chỉ số cảm hứng và lá Tarot hằng ngày ổn định theo ngày Việt Nam và hồ sơ.
- AI qua Supabase Edge Function: đăng nhập bằng email, lịch sử cục bộ theo tài khoản và chuyển câu hỏi từ kết quả Tarot.

Nhật ký, hồ sơ và sự kiện **lưu trên trình duyệt hiện tại**; chưa đồng bộ giữa thiết bị. Xóa dữ liệu trình duyệt sẽ xóa dữ liệu này. Chỉ thông tin bạn gửi trong hội thoại được chuyển tới backend AI; biểu mẫu hồ sơ không tự động được gửi.

## Artwork

Bộ biểu tượng/vector của hệ thị giác được mô tả trong [docs/MYSTIC_FUSION.md](./docs/MYSTIC_FUSION.md). Vòng hoàng đạo chỉ đánh dấu cung Mặt Trời theo khoảng ngày; không phải biểu đồ vị trí hành tinh. Phân bố ngũ hành chỉ đếm thiên can đã có, không đánh giá vượng suy Bát tự.

Ba lá đầu và mặt lưng giữ nguyên SVG trong `AstroAI_Celestial_Tarot_Concept`. Mười chín Major còn lại là artwork biểu tượng; Minor dùng hệ hình pip theo chất và cấp bậc, không phải 75 tranh nhân vật hoàn chỉnh. Không dùng hình thương mại từ các đường dẫn tham khảo trong spec. Xem [ATTRIBUTIONS.md](./ATTRIBUTIONS.md).

Asset vector được tải theo trang và ảnh thư viện dùng lazy loading; mặt lưng có thêm WebP. Công cụ tái tạo artwork cần Python + Pillow:

```bash
python3 scripts/generate-tarot-assets.py
```

## Kích hoạt AI an toàn

Frontend chỉ cần hai biến công khai trong [.env.example](./.env.example). Khóa OpenAI chỉ đặt ở Supabase Secrets. Xem [DEPLOYMENT.md](./DEPLOYMENT.md) để chạy migration hạn mức, cấu hình email/origin và triển khai function.

Tệp `.env` trước đây đã được loại khỏi bản cập nhật; **khóa từng xuất hiện trong Git vẫn cần được chủ tài khoản thu hồi** và kiểm tra sử dụng. Thay tệp hiện tại không xóa lịch sử Git. Không đưa secret vào biến bắt đầu bằng `VITE_`.

## Phương pháp và giới hạn

Âm lịch kế thừa thuật toán thiên văn Hồ Ngọc Đức; đã sửa việc xác định năm âm tại ranh giới năm. Can Chi ngày dùng Julian day number, giờ hoàng đạo dùng bảng địa chi ngày (sáu khung giờ), ngày hoàng đạo dùng bảng tháng âm–địa chi. Trực dùng quy ước tháng âm, chưa hiệu chỉnh theo tiết khí; 28 Tú và điểm ngày vẫn giản lược. Bộ lọc tuổi chỉ xét lục xung năm âm.

Hồ sơ chưa phải lá số Bát tự/natal chart đầy đủ: trụ tháng dựa tháng âm, cung Mặt Trời dùng khoảng ngày, chưa tính cung Mọc hoặc Mặt Trăng. Chỉ số cảm hứng là hàm băm xác định phục vụ giải trí, không đo sức khỏe hay dự báo kết quả thực tế.

Các phần tiếp theo của lộ trình như 75 tranh Celestial chi tiết, đồng bộ Supabase, lá số thiên văn đầy đủ, thông báo và Kinh Dịch chưa được triển khai. Bản này có manifest và service worker cho ngoại tuyến. Xem [FEATURES.md](./FEATURES.md).

## Cài đặt minh họa Tarot · JoJo ref

Mở **Cài đặt → Minh họa thẻ bài Tarot → JoJo ref** (`/settings`). Lựa chọn lưu trên trình duyệt và áp dụng cho lật bài, thư viện, trang chủ và nhật ký. 22 Major Arcana dùng Stand/người sử dụng đúng theo Stardust Crusaders (ví dụ The Star → Star Platinum / Jotaro; The World → The World / DIO). 56 Minor dùng hình Stand từ các phần JoJo khác, được ghi rõ là **liên tưởng mỹ thuật do ứng dụng chọn**, không phải đối ứng Tarot trong truyện. Có thể tìm theo tên Stand hoặc nhân vật trong thư viện khi bật JoJo ref.

JoJo ref được đóng gói và hiển thị mặc định trong production. Nhà phát hành có thể tạo bản chỉ dùng Celestial bằng `VITE_ENABLE_REFERENCE_ART=false npm run build`.

Asset tải về chạy cục bộ, không hotlink trong giao diện. Nguồn từng ảnh nằm trong `src/features/tarot/data/jojo-stands.json` và `jojo-minor-art.json`; xem [ATTRIBUTIONS.md](./ATTRIBUTIONS.md). Tải lại asset bằng `python3 scripts/fetch-jojo-assets.py` và `python3 scripts/fetch-jojo-minor-assets.py` (cần mạng).

### Mức độ của phần luận giải

Nghĩa xuôi/ngược là nội dung tiếng Việt biên soạn theo hệ Rider–Waite–Smith, hiện đại hóa; không phải bản dịch nguyên văn Waite hay bộ nghĩa duy nhất. [The Pictorial Key to the Tarot](https://sacred-texts.com/tarot/pkt/pkt0303.htm) là nguồn lịch sử để đối chiếu. Bộ quy tắc `rws-vi-3` kết hợp nghĩa lá, hướng, vị trí, chủ đề, mô-típ và các cặp lá; đồng thời tách điểm tựa, điều cần kiểm chứng, bước hành động, thời điểm nhìn lại và câu hỏi tự soi chiếu. Dữ liệu có 624 nội dung riêng về tình cảm/công việc/tài chính và hành động cho 78 lá xuôi/ngược.

## AI miễn phí qua Google

Khi Supabase và Edge Function đã được cấu hình, khách có thể đăng nhập Google tại trang Chat và chủ động bật AI online. Mỗi tài khoản có tối đa 20 lượt AI/ngày theo giờ Việt Nam; thư viện local vẫn miễn phí, không cần tài khoản và không giới hạn lượt. “Miễn phí” ở đây là miễn phí cho người dùng cuối trong hạn mức; chi phí API vẫn thuộc tài khoản OpenAI của nhà phát hành.

Chủ đề tự động chỉ nhận diện bằng từ khóa; bạn có thể chọn chủ đề trước khi rút. Phần tổng hợp là hướng dẫn do ứng dụng biên soạn, không hiểu ngôn ngữ như AI và không có tỷ lệ dự báo tương lai được xác lập. Các vị trí tương lai/kết quả đọc như khả năng có điều kiện. Hình JoJo chỉ đổi minh họa; tính cách, phe phái và năng lực nhân vật không thay nghĩa Tarot.

## Dùng offline

Khi còn mạng, mở **Cài đặt → Dùng ngoại tuyến → Tải bộ dữ liệu offline** và chờ **Đã sẵn sàng dùng offline**. Sau đó có thể tắt mạng, mở lại web, rút bài, đọc luận giải, xem đủ hình của cả hai bộ và lưu nhật ký. Dung lượng khoảng 23 MiB. Mỗi tệp được kiểm tra kích thước và SHA-256 trước khi lưu; tải lỗi có thể thử lại.

Chế độ này chạy trên bản production qua HTTPS hoặc localhost. Để thử tại máy:

```bash
npm run build
npm run preview
```

`npm run dev` vẫn luận giải tại máy nhưng không bật bộ lưu ngoại tuyến. Chat AI và liên kết nguồn bên ngoài cần mạng. Dữ liệu thuộc trình duyệt hiện tại, có thể mất khi xóa dữ liệu hoặc trình duyệt thu hồi bộ nhớ. Khi có bản cập nhật, mở lại Cài đặt lúc có mạng để tải đủ phiên bản mới.

### AstroAI 2.0 Offline-First — 31/10/2026

Bản chuẩn có bốn content pack độc lập, IndexedDB và chuyển dữ liệu cũ, backup JSON có preview/transaction, chatbot local không cần đăng nhập, thư viện 229 nhóm tra cứu và 78 cảnh Tarot Celestial gốc. AI online là opt-in; thiếu mạng/key/API lỗi vẫn có local fallback. Nhật ký lưu snapshot để giữ nguyên luận giải qua cập nhật.

Chạy `npm ci`, `npm run typecheck`, `npm test`, `npm run build`, `npm run test:e2e`, `npm run test:offline`. Build kiểm SHA-256, pack ownership và gate 50 MiB. Nội dung tính lịch/chiêm tinh là truyền thống hoặc xấp xỉ có giới hạn công khai.

Chi tiết: [plan.md](plan.md), [FEATURES.md](FEATURES.md), [kiểm chứng](docs/OFFLINE_FIRST_VERIFICATION.md), [triển khai](DEPLOYMENT.md). Các bước thu hồi khóa/deploy RLS/kiểm thiết bị thật cần thực hiện ngoài source; cloud sync và natal chart đầy đủ là sau MVP.
