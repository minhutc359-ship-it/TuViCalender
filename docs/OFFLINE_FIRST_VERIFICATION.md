# Kiểm chứng AstroAI 2.0 — 02/11/2026

Base `ff12c07`. Bản anime/Oracle được tích hợp thành một commit trên master mới nhất theo yêu cầu chủ dự án. Báo cáo mô tả source và kiểm thử, không xác nhận backend đã deploy hoặc khóa lịch sử đã thu hồi.

## Kết quả đã chạy

| Kiểm tra | Kết quả |
| --- | --- |
| `npm run typecheck` | Pass |
| `npm test` | **48 tests pass**: core 11, Tarot 7, Oracle 3, AI handler 6, local chat 5, backup 4, service worker 6, IndexedDB 4, solar/snapshot 2 |
| Local corpus | 129 câu mẫu độc lập và câu chuẩn cho cả 230 nhóm tra cứu đều đúng intent |
| `npm run build` | Pass, kèm kiểm chứng 4 pack, SHA-256, sizes, ownership, icons và gate dung lượng |
| Browser E2E | **17 pass trên CI**, gồm JoJo ref, Google OAuth, anime gallery và Oracle reload |
| Production offline E2E | **4 flows configured**, gồm cold reload Oracle/Tarot; CI là bằng chứng phát hành sau push |
| Responsive | 8 route được kiểm ở 320, 375, 390, 768, 1280 px; ba theme ở 360 px |
| Motion/keyboard | OS reduced-motion, không gian tĩnh, modal Escape, swipe lịch không click nhầm ngày |
| `git diff --check` | Pass |

Workspace hiện tại đã kiểm tra thủ công Home, gallery Đông–Tây và gieo/reload sáu hào trên trình duyệt preview. Không có binary Playwright cục bộ cho bản này; CI cài browser trên runner. Lượt CI đầu qua 17 browser flows và 3/4 offline flows; test xóa pack còn cố định số file cũ đã được đổi sang số file trong manifest để hỗ trợ artwork bổ sung. Kết quả toàn bộ offline sau sửa được đối chiếu ở GitHub Actions.

## Hành vi đã xác nhận

- Tải đủ tài nguyên, ngắt mạng, đóng tab và mở tab mới; lịch, tra cứu, 78 hình, luận giải và nhật ký vẫn dùng được.
- Hỏi 10 câu local và một câu ngoài phạm vi khi offline; nguồn được phân biệt, không giả lập hội thoại AI.
- File hỏng/503 không báo ready; thử lại chỉ hoàn thiện phần thiếu. Hủy giữ phần đã tải; từng pack có trạng thái riêng và có thể xóa/tải lại.
- Xóa pack Đông phương không xóa hồ sơ IndexedDB; nội dung chưa tải được thông báo; trở lại online có thể tải lại.
- Cache-only reads khi browser báo offline không âm thầm tải lại pack vừa xóa.
- IndexedDB chuyển dữ liệu LocalStorage cũ, chụp snapshot trước chuyển; không nhập Supabase auth token. Ghi được khi LocalStorage bị chặn; transaction import bị lỗi không ghi dở.
- Backup JSON có preview, giữ ID/cài đặt hiện có, giới hạn 8 MiB và allowlist. Không xuất token hay lịch sử AI theo tài khoản.
- Snapshot Tarot giữ nguyên luận giải qua cập nhật nội dung; dữ liệu snapshot hỏng bị từ chối.
- SW chờ người dùng chấp nhận, kiểm đủ bản mới trước activation và giữ cache cho tab cũ. Dọn cache cũ từ chối khi còn tab khác.

## Dung lượng đo từ build

Manifest `a503aa4ec8001e94`; tổng gồm worker/manifest:

| Chỉ số | MiB |
| --- | ---: |
| Raw assets | 25.784 |
| Ước tính gzip transfer | 24.164 |
| Core raw | 1.961 |
| Giới hạn raw và gzip estimate | 50 |

| Pack | Files | Raw MiB |
| --- | ---: | ---: |
| core | 40 | 1.961 |
| eastern | 6 | 0.633 |
| western | 5 | 0.542 |
| tarot | 185 | 22.552 |

SVG được nén rất hiệu quả; gzip là ước tính từ file build, không phải số traffic đã đo trên hosting. Không cộng dữ liệu cá nhân, metadata của browser hoặc cache phiên bản trước. `reports/offline-size.json` là báo cáo từng file do build/CI tạo.

## Nguồn và giới hạn

Bộ Celestial gồm 78 cảnh SVG gốc, có source tái tạo. JoJo ref được bật mặc định và đóng gói trong Tarot offline pack, gồm 78 Stand, 22 chân dung và mặt lưng riêng. Nghĩa Tarot không đổi khi chọn bộ hình; trách nhiệm xác minh quyền phân phối hình tham chiếu vẫn thuộc nhà phát hành.

Lịch Việt Nam dùng UTC+7. Trực theo tháng tiết khí ở 12:00 UTC+7; mô hình Mặt Trời và bốn trụ là xấp xỉ, đổi ngày lúc 00:00. Năm Bát tự theo Lập Xuân có thể khác năm âm theo Tết. Cung Mặt Trời dùng khoảng ngày; chưa có Moon/Rising/natal chart ephemeris.

Không tiếp tục dùng công thức 28 Tú reset theo tháng âm: mục này hiển thị “Chưa kiểm định” và không tham gia điểm ngày, cho đến khi có mốc chu kỳ được đối chiếu. Không cam kết mọi trường phái cho cùng kết quả.

Còn cần thao tác/tài nguyên bên ngoài: thu hồi khóa lịch sử và kiểm tra usage nhà cung cấp; bật Google provider, đặt OAuth callback, deploy Edge Function/hai migration quota và kiểm chứng Supabase bằng tài khoản thật; thử iPhone/Android/PWA thật, Lighthouse/Web Vitals/FPS trên thiết bị. CI xác nhận URL OAuth được tạo đúng nhưng không thể thay thế đăng nhập Google production. Cloud sync/conflict và natal chart đầy đủ là sau MVP.

## Minh họa và rollback

![Mười hai minh họa nhân vật anime nguyên bản](astroai-anime-illustrations.jpg)

![Sáu minh họa editorial Celestial Feng Shui](astroai-editorial-illustrations.jpg)

![Bốn pack ngoại tuyến](astroai-offline-packs.png)

![Bộ Celestial gốc](astroai-tarot-deck.jpg)

Rollback bằng revert commit và deploy lại toàn bộ dist, giữ IndexedDB/LocalStorage. Không chỉ định clear browser data. Các bản ghi cũ vẫn tương thích; snapshot luận giải là trường bổ sung tùy chọn. Chỉ dùng nút xóa pack để dọn asset, và nút dọn phiên bản cũ khi đã đóng tab khác.
