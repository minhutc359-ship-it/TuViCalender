# Mystic Fusion · Celestial Feng Shui

Hệ đồ họa Đông/Tây dùng chung cấu trúc, kiểu chữ và hình học. Mọi SVG do dự án dựng mới bằng nét vector; không cần tải phông, ảnh nền hoặc thư viện icon từ mạng.

## Theme và chuyển động

Trong Cài đặt → Không gian thị giác, chọn Fusion (mặc định), Eastern, Western hoặc tự động. Tự động dùng Eastern ở `/calendar`, Western ở `/tarot`, Fusion ở các trang còn lại. Lựa chọn lưu theo trình duyệt, độc lập với bộ bài Celestial/JoJo ref.

| Theme   | Nền       | Sắc thái                 | Thành phần                    |
| ------- | --------- | ------------------------ | ----------------------------- |
| Fusion  | `#0d1625` | Ngọc, vàng cổ, chàm      | Sao và mây mảnh, kính tối     |
| Eastern | `#091c1b` | Jade, son, ngà           | Bát quái, con giáp, thiên can |
| Western | `#11132b` | Chàm tím, bạc, vàng nhạt | Hoàng đạo, hành tinh, quỹ đạo |

`src/styles/mystic-fusion.css` chứa token và các lớp trình bày; `VisualTheme.tsx` quản lý trạng thái. Các cặp nền/chữ cùng đổi bằng CSS variables. Chữ nội dung dùng font hệ thống, heading dùng serif có sẵn, không lệ thuộc CDN.

Chuyển động gồm sao trôi rất chậm, quỹ đạo quay, fade-up, đường nối loader và xào/lật Tarot. Nhãn cung/quái đứng yên để đọc. `prefers-reduced-motion` hoặc Không gian tĩnh tắt animation; lựa chọn tĩnh cũng rút ngắn thời gian xào/lật. Không dùng theo dõi con trỏ hoặc canvas chạy liên tục.

## Bộ vector

`AstroSymbol.tsx`: 12 cung, 5 ngũ hành, 8 quái, 12 con giáp Việt Nam (Mão là mèo), hành tinh, pha trăng biểu tượng và các dấu trang trí. `AstroWheels.tsx`: vòng 12 cung và vòng bát quái. SVG mặc định trang trí, hỗ trợ nhãn truy cập khi truyền `label`. Metadata nằm trong `symbols.ts`; hình dùng `currentColor` và tái sử dụng giữa các màn hình.

Các pha trăng là tài nguyên hình tượng, chưa biểu diễn pha trăng thiên văn hôm nay. Vòng bát quái không dùng cảm biến la bàn. Dữ liệu nét quái đối chiếu [Unicode U2630–U2637](https://www.unicode.org/charts/PDF/U2600.pdf).

## Các màn hình

- Trang chủ: hai tab Đông/Tây, medallion, ngày âm/dương, Can Chi, hành thiên can ngày, vòng chỉ số cảm hứng và cửa vào lịch/Tarot. Điểm vẫn là gợi ý xác định theo ngày/hồ sơ, không phải đo vận mệnh.
- Lịch: tín hiệu hoàng/hắc đạo tách khỏi tính phù hợp sự kiện; các ngày gợi ý được chọn từ bộ lọc thật. Chạm ngày mở bảng lớn có huy hiệu, trực, tú, giờ và lối ghi sự kiện; sidebar giữ khả năng quản lý sự kiện.
- Tarot: vòng đồ họa sau hero, bàn trải có hình học và ánh sáng nhẹ; giữ nguyên đủ 78 hình của mỗi bộ, xác suất, nghĩa và nhật ký.
- Hồ sơ: vòng cung Mặt Trời theo khoảng ngày, huy hiệu con giáp, bốn trụ tham khảo và phân bố thiên can. Không suy ra Moon/Rising hoặc vị trí hành tinh từ dữ liệu chưa tính. Phân bố chỉ đếm các can đã có, chưa gồm tàng can/trọng số mùa; không phải vượng suy Bát tự.
- Chat: lựa chọn AI Đông/Tây, avatar, lời chào, câu hỏi gợi ý và bubble theo persona của từng phản hồi. Lịch sử cũ giữ nguyên; chuyển persona không xóa hội thoại. Nút chuyển khóa trong lúc đang gửi để tránh gắn sai nhãn.

## Backend persona

`chatWithAI()` gửi `persona: eastern | western`. Schema server chỉ nhận hai giá trị; client cũ không gửi vẫn dùng Đông phương. Server chọn chỉ dẫn cố định, không nhận prompt hệ thống tùy ý từ client. Auth, quota và giới hạn dữ liệu giữ nguyên. Cần deploy lại Edge Function theo DEPLOYMENT.md; bản cập nhật giao diện không tự kích hoạt backend hoặc khóa AI. Bộ kiểm thử không gọi AI thật.

## Offline và kiểm tra

Tất cả SVG/nền/theme được build vào chunk cục bộ và nằm trong manifest offline. Sau cập nhật, tải đủ lại bộ trong Cài đặt khi còn mạng. Không cần thêm gói phụ thuộc.

Kiểm tra bằng `npm run typecheck`, `npm test`, `npm run build`, `npm run test:e2e` và `npm run test:offline`. Browser tests kiểm tra theme qua reload/route, không gian tĩnh, bảng ngày/sự kiện, phân bố trụ, persona và cả ba theme ở màn hình 360px.
