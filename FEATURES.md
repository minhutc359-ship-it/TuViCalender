# AstroAI 2.0 — Tình trạng triển khai

| Phần | Hành vi hiện tại | Giới hạn |
| --- | --- | --- |
| PWA | Shell tự precache; icons 192/512/apple-touch; shortcuts Lịch/Tarot/Thư viện | Cần HTTPS/localhost và tải trước khi mất mạng |
| Content packs | `core`, `eastern`, `western`, `tarot`: metadata/version/dependencies/checksum, tiến độ, hủy/tiếp tục, xóa/tải lại và integrity | Browser có thể dọn cache; có nút kiểm tra/tải lại và storage estimate/persist |
| Dữ liệu | IndexedDB v1; chuyển LocalStorage cũ, snapshot, mirror tương thích, trạng thái lỗi; outbox local-only | Cloud sync chưa bật; không giả lập đồng bộ |
| Backup | Export/import JSON, allowlist, preview, giữ ID/settings cũ, import transaction nguyên tử | Tệp chứa dữ liệu cá nhân, giới hạn 8 MiB; không xuất auth/account AI history |
| Chat local | Không cần đăng nhập/key; rule/entity + 230 nhóm tra cứu có alias/ví dụ; nguồn và hành động điều hướng | Không phải hội thoại tự do; không đủ dữ liệu trả guided fallback |
| AI | Opt-in mặc định tắt, local-first, auth Edge Function; timeout/401/429/5xx fallback | Cần cấu hình/deploy Supabase; không tự gửi hồ sơ sinh |
| Knowledge | Versioned JSON theo pack; search/filter/bookmark; vòng Ngũ hành/Bát quái/Zodiac tương tác | Chỉ đọc các pack đã tải khi offline; không âm thầm tải lại pack đã xóa |
| Tarot | 78 lá, nghĩa xuôi/ngược và ngữ cảnh, 1/3/5/10 lá, Web Crypto không trùng | Nội dung biên soạn để chiêm nghiệm, không dự báo chắc chắn |
| Artwork | 78 cảnh SVG Celestial gốc, source tái tạo và attribution | JoJo ref bật mặc định: 78 Stand, 22 chân dung và mặt lưng; có nguồn/attribution riêng |
| Editorial art | 6 cảnh WebP 1200×800 cho Home/Lịch/Hồ sơ/Chat, portal và atlas Đông–Tây; reveal, quỹ đạo và hover nhẹ | Lazy-load; cả sáu thuộc core offline pack; hiệu ứng tắt theo Reduce Motion |
| Anime lore | 12 cảnh WebP 768×768: Ngũ hành, nguyên tố Zodiac và bối cảnh Tarot | Ảnh minh hoạ nguyên bản; không dùng làm nguồn hoặc thay nghĩa lá |
| Gieo quẻ | Sáu hào Web Crypto, hai quái, hào động, lịch sử/backup offline | Chưa gán 64 quẻ King Wen hoặc dịch 384 hào; lời khuyên là biên tập tự soi chiếu |
| AI miễn phí | Google OAuth hoặc email magic link; tối đa 20 lượt/ngày/tài khoản, local không giới hạn | Chủ dự án cần bật Google provider, deploy quota/function và thanh toán API upstream |
| Nhật ký | Lưu/sửa/xóa, orientation, snapshot nghĩa/version; reopen nhất quán | Tối đa 200 phiên; chưa sync giữa thiết bị |
| Hồ sơ | CRUD nhiều người, timezone IANA, consent, góc nhìn ưu tiên, lưu offline | Bốn trụ xấp xỉ UTC+7 khi đủ giờ; natal chart thiên văn chưa có |
| Lịch | Âm dương UTC+7, Can Chi, 6 giờ dân gian, Hoàng đạo theo tháng/chi ngày, filter/sự kiện, swipe tháng | Trực theo tháng tiết khí xấp xỉ; 28 Tú chưa kiểm định và không dùng cho điểm |
| Visual/motion | Fusion/Eastern/Western, vector đồng bộ, editorial reveal/orbit, atlas tương tác, lật bài, skip, keyboard | Reduced motion/không gian tĩnh có hiệu lực; chưa xác nhận FPS/Web Vitals trên máy thật |
| Security | Không client OpenAI secret; Edge auth/CORS/input/quota; migration owner-only RLS; env ignore | Chủ tài khoản cần revoke khóa cũ; deploy/kiểm thử RLS thật riêng |
| Budget/CI | Gate raw và gzip estimate ≤50 MiB; checksum/schema/assets/icons; typecheck/unit/browser/offline | Gzip là ước tính, không phải traffic production đã đo |

Xem [Source of Truth](docs/ASTROAI_VISUAL_MOTION_INTERPRETATION_SOURCE_OF_TRUTH.md), [plan.md](plan.md), [nghiệm thu](docs/OFFLINE_FIRST_VERIFICATION.md) và [triển khai](DEPLOYMENT.md). Không gắn nhãn “100% production-ready” khi chưa hoàn tất các bước tài khoản/thiết bị thật và đối chiếu phương pháp nêu trên.
