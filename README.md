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

- Tarot 78 lá: 22 Major + 56 Minor, nghĩa tiếng Việt xuôi/ngược, Fisher–Yates dùng Web Crypto, không rút trùng trong phiên.
- Năm kiểu trải: lá hằng ngày, ba lá thời gian, ba lá tình yêu, năm lá sự nghiệp và Celtic Cross mười lá.
- Luận giải tại máy cho đủ 78 lá: xuôi/ngược, chủ đề, vị trí trải, liên hệ giữa lá, hành động và câu hỏi suy ngẫm. Không cần API AI.
- Cài đặt chọn Celestial hoặc JoJo ref cho đủ 78 lá; tải trọn bộ để mở lại ứng dụng khi mất mạng.
- Xào/xòe bài, chọn bằng chuột hoặc bàn phím, lật 3D tuần tự, phóng to artwork, hỗ trợ giảm chuyển động.
- Thư viện tìm kiếm và lọc theo bộ; nhật ký lưu câu hỏi, hướng lá và ghi chú, xem lại/sửa/xóa. Giữ tối đa 200 phiên.
- Hồ sơ: thêm, sửa, xóa, chuyển nhiều hồ sơ; cung Mặt Trời, Can Chi, con giáp và thuộc tính tham khảo.
- Lịch dương/âm UTC+7, sáu bộ lọc sự kiện, lọc lục xung năm sinh âm và sự kiện cá nhân.
- Chỉ số cảm hứng và lá Tarot hằng ngày ổn định theo ngày Việt Nam và hồ sơ.
- AI qua Supabase Edge Function: đăng nhập bằng email, lịch sử cục bộ theo tài khoản và chuyển câu hỏi từ kết quả Tarot.

Nhật ký, hồ sơ và sự kiện **lưu trên trình duyệt hiện tại**; chưa đồng bộ giữa thiết bị. Xóa dữ liệu trình duyệt sẽ xóa dữ liệu này. Chỉ thông tin bạn gửi trong hội thoại được chuyển tới backend AI; biểu mẫu hồ sơ không tự động được gửi.

## Artwork

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

Asset tải về chạy cục bộ, không hotlink trong giao diện. Nguồn từng ảnh nằm trong `src/features/tarot/data/jojo-stands.json` và `jojo-minor-art.json`; xem [ATTRIBUTIONS.md](./ATTRIBUTIONS.md). Tải lại asset bằng `python3 scripts/fetch-jojo-assets.py` và `python3 scripts/fetch-jojo-minor-assets.py` (cần mạng).

### Mức độ của phần luận giải

Nghĩa xuôi/ngược là nội dung tiếng Việt biên soạn theo hệ Rider–Waite–Smith, hiện đại hóa; không phải bản dịch nguyên văn Waite hay bộ nghĩa duy nhất. [The Pictorial Key to the Tarot](https://sacred-texts.com/tarot/pkt/pkt0303.htm) là nguồn lịch sử để đối chiếu. Bộ quy tắc `rws-vi-2` kết hợp nghĩa lá, hướng, vị trí, chủ đề, chủ đề lặp lại và các cặp lá. Dữ liệu có 624 nội dung riêng về tình cảm/công việc/tài chính và hành động cho 78 lá xuôi/ngược, kèm câu hỏi suy ngẫm theo vai trò vị trí.

Chủ đề tự động chỉ nhận diện bằng từ khóa; bạn có thể chọn chủ đề trước khi rút. Phần tổng hợp là hướng dẫn do ứng dụng biên soạn, không hiểu ngôn ngữ như AI và không có tỷ lệ dự báo tương lai được xác lập. Các vị trí tương lai/kết quả đọc như khả năng có điều kiện. Hình JoJo chỉ đổi minh họa; tính cách, phe phái và năng lực nhân vật không thay nghĩa Tarot.

## Dùng offline

Khi còn mạng, mở **Cài đặt → Dùng ngoại tuyến → Tải bộ dữ liệu offline** và chờ **Đã sẵn sàng dùng offline**. Sau đó có thể tắt mạng, mở lại web, rút bài, đọc luận giải, xem đủ hình của cả hai bộ và lưu nhật ký. Dung lượng khoảng 23 MiB. Mỗi tệp được kiểm tra kích thước và SHA-256 trước khi lưu; tải lỗi có thể thử lại.

Chế độ này chạy trên bản production qua HTTPS hoặc localhost. Để thử tại máy:

```bash
npm run build
npm run preview
```

`npm run dev` vẫn luận giải tại máy nhưng không bật bộ lưu ngoại tuyến. Chat AI và liên kết nguồn bên ngoài cần mạng. Dữ liệu thuộc trình duyệt hiện tại, có thể mất khi xóa dữ liệu hoặc trình duyệt thu hồi bộ nhớ. Khi có bản cập nhật, mở lại Cài đặt lúc có mạng để tải đủ phiên bản mới.
