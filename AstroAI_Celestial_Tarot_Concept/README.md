# AstroAI — Celestial Tarot (bản concept đồ họa)

Đây là **bộ mẫu đồ họa gốc** để thử nghiệm định hướng hình ảnh, không phải bộ Tarot hoàn chỉnh và **chưa được commit vào repository**.

## Thành phần

- `assets/00_the_fool.svg` và `.png`: The Fool / Khởi đầu
- `assets/01_the_magician.svg` và `.png`: The Magician / Kiến tạo
- `assets/02_the_high_priestess.svg` và `.png`: The High Priestess / Trực giác
- `assets/card_back.svg` và `.png`: mặt sau bộ bài
- `tarot_animation_demo.html`: mở trực tiếp bằng trình duyệt để thử `flip 3D`, hiệu ứng xào bài mang tính minh họa, và lật tuần tự
- `AstroAI_Tarot_Concept_Preview.png`: hình xem trước

## Định hướng triển khai production

- Bộ Tarot chuẩn cần **78 lá**: 22 Major Arcana và 56 Minor Arcana, cả ý nghĩa xuôi/ngược.
- Duy trì mã ID ổn định và tách dữ liệu trải bài khỏi assets: `cardId`, `deckId`, `uprightKeywords`, `reversedKeywords`, `imagePath`.
- Xuất WebP/AVIF cho production, ảnh responsive và lazy load; SVG trong concept chỉ nhằm kiểm tra hệ thống thiết kế.
- Animation dùng `motion/react` hiện đã có trong repo, kèm `prefers-reduced-motion` và tắt âm mặc định.
- Xào bài trong bản demo **không đảo bộ bài**; bản sản phẩm cần RNG thực sự và Fisher–Yates để chống rút trùng.

## Màu sắc

- Dark ink: `#080F23`
- Celestial navy: `#20204A`
- Imperial gold: `#DEBD81`
- Mist violet: `#776084`
- Soft ivory: `#F3E5C9`

## License

Đây là minh họa SVG tạo mới theo hướng dẫn, không sao chép nội dung từ những nguồn ảnh tham khảo; không sử dụng hình thương mại bên ngoài. Thẩm định pháp lý cuối cùng vẫn cần thiết trước khi phát hành thương mại.
