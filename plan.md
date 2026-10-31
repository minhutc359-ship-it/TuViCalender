# AstroAI 2.0 — Offline-First, Tarot, Đông–Tây và Visual/Motion

- **Dự án:** [TuViCalender](https://github.com/minhutc359-ship-it/TuViCalender), tên ứng dụng AstroAI.
- **Ngày:** 31/10/2026.
- **Mốc đối chiếu:** `a843eb1` trên `master`.
- **Trạng thái:** MVP đã triển khai trong source và đã kiểm thử. Tích hợp một commit trên master theo yêu cầu chủ dự án ngày 31/10/2026; không đồng nghĩa backend đã deploy hoặc khóa cũ đã được thu hồi.
- **Mục tiêu:** PWA offline cho lịch, Tarot, tra cứu, hồ sơ và nhật ký; AI chỉ là tùy chọn. Tổng tải tài nguyên cốt lõi và nội dung đầy đủ ≤50 MiB theo định nghĩa mục 9.

## 1. Nguyên tắc

1. Offline là mặc định cho nghiệp vụ cốt lõi sau khi tải dữ liệu.
2. Chat local là tra cứu intent/thực thể/quy tắc/template; không giả vờ hội thoại tự do.
3. AI online chỉ dùng khi được bật, local chưa trả lời và có kết nối; lỗi/timeout phải fallback.
4. Tách calculation/rule, interpretation/text, presentation/motion; phân biệt `local-rule`, `local-knowledge`, `online-ai`, `guided-fallback`.
5. Giữ art direction Celestial Feng Shui / Mystic Fusion, có Eastern, Western, Fusion.
6. Giảm motion theo người dùng/OS; tránh blur nặng, video và animation khóa tương tác.
7. Nội dung truyền thống/chiêm nghiệm/giải trí; không cam kết dự báo khoa học, không thay thế tư vấn chuyên môn.
8. Thứ tự: **Security → Correctness → Offline → Content → Visual/Motion → Advanced AI**.

## 2. Hiện trạng mốc ban đầu a843eb1 (trước nâng cấp)

Bản ghi trước đây về 10 lá, browser OpenAI SDK và chưa có PWA đã cũ. Mốc a843eb1 đã có:

| Phần | Đã có tại HEAD | Khoảng thiếu so với mục tiêu |
| --- | --- | --- |
| Stack | React, TypeScript, Vite, Tailwind, motion/react; lazy routes | Không cần thay framework |
| Security | AI qua Edge Function; bỏ browser secret; ignore env; quota atomic | Cần chủ tài khoản xác nhận đã revoke khóa cũ; audit cloud/RLS thực tế |
| PWA | Manifest, SW, hash từng file, tải đủ asset, retry phần thiếu | Chưa quản lý 4 pack độc lập; cập nhật cưỡng bức cần sửa |
| Tarot | 78 lá, nghĩa xuôi/ngược, chủ đề, 1/3/5/10 lá, nhật ký | Celestial chủ yếu biểu tượng/pip; cần artwork riêng có quyền sử dụng |
| Hồ sơ | CRUD nhiều người tại máy | LocalStorage; chưa IndexedDB/sync; timezone/consent chưa đủ |
| Chat | Persona Đông/Tây, AI có đăng nhập | Trước đợt này chưa có chat local |
| Visual | Ba theme, vector Đông–Tây, reduced motion | Cần đo thiết bị thật, gesture và a11y toàn diện |
| Tests | Unit, browser, production-offline | Cần bổ sung chat/backup/update/budget và chạy CI |

## 3. Kiến trúc và hợp đồng dữ liệu

React PWA → application services → calendar/tarot/knowledge/profile engines → local storage/cache. Hybrid chat ưu tiên local; gateway AI có xác thực chỉ là tầng tùy chọn.

- Giữ stack hiện có; SW thủ công hiện tại có thể tiếp tục nếu đạt nghiệm thu, không bắt buộc đổi sang Workbox chỉ vì thư viện được đề xuất.
- Mục tiêu IndexedDB qua adapter có migration cho hồ sơ, nhật ký, chat, bookmark, trạng thái pack.
- Asset dùng Cache Storage, phiên bản/hashes; không cache API/auth/AI như public asset.
- Metadata nội dung cần `id`, `locale`, `version`, `source`, `updatedAt`, `schemaVersion`.
- Dữ liệu cá nhân có export/import JSON, schema validation, xem trước conflict, không silently overwrite.
- ChatResponse gồm content/source/intent/confidence/references/actions. Confidence local là tín hiệu định tuyến, không phải độ đúng dự báo.

## 4. P0 — Bảo mật và độ chính xác

- [x] Frontend không dùng `VITE_OPENAI_API_KEY`, `dangerouslyAllowBrowser` hoặc gọi OpenAI trực tiếp.
- [x] Có Edge Function, secret server, auth, CORS allowlist, input/token/quota/timeout bounds.
- [x] Env thật được ignore; chỉ giữ `.env.example`, `.env.server.example` chứa placeholder.
- [ ] Chủ tài khoản xác nhận revoke/rotate mọi khóa có thể đã lộ, kiểm tra usage/billing; xóa file khỏi HEAD không thu hồi khóa và không xóa lịch sử Git.
- [x] Có migration quota và source migration owner-only RLS cho birth_profiles/chat_histories/tarot_sessions nếu tồn tại.
- [ ] Deploy và kiểm thử RLS bằng 2 tài khoản thật; không suy ra trạng thái DB chỉ từ SQL trong repo.
- [x] Fixture Tết, tháng nhuận, Can Chi ngày và giờ truyền thống cơ bản.
- [x] Điểm daily ổn định theo ngày/hồ sơ; ghi rõ hàm băm giải trí.
- [ ] Kiểm định đầy đủ Trực, 28 Tú, tiết khí, Bát tự, timezone và DST; hiện chỉ lịch Việt Nam UTC+7.
- [x] Chỉ công bố bảng bốn trụ xấp xỉ UTC+7 khi đủ giờ, kèm quy ước/giới hạn; không gắn nhãn natal chart thiên văn hoặc Bát tự chuyên sâu.

**DoD P0:** Source không secret client và các fixture hiện có đạt. Việc xác nhận thu hồi khóa, kiểm RLS thật và đối chiếu phương pháp còn là gate bên ngoài; không suy ra từ kết quả build.

## 5. P1 — Nền tảng offline

- [x] Manifest, icon PNG 192/512, apple-touch-icon, shortcuts Lịch/Tarot/Thư viện trong source.
- [x] Precache shell; full download kiểm hash và retry file còn thiếu.
- [x] SW chờ người dùng chấp nhận update; tải/kiểm tra bản mới trước activation; giữ cache cũ cho tab đang mở.
- [x] Có backup JSON allowlist, giới hạn 8 MiB, preview, gộp ID và giữ dữ liệu hiện tại; rollback nếu ghi lỗi.
- [x] Bốn pack `core`, `eastern`, `western`, `tarot` có metadata/schema/locale/version/size/files/SHA-256/dependencies; asset chỉ thuộc một pack.
- [x] Tiến độ, kiểm hash/readability, hủy/tiếp tục, retry phần thiếu, xóa/tải lại từng pack; giữ dữ liệu cá nhân.
- [x] IndexedDB v1, chuyển dữ liệu cũ, snapshot trước chuyển/import, mirror tương thích và fallback; import transaction nguyên tử, có test quota/failure/reopen.
- [x] Storage estimate/version/persist, thông báo thiếu pack/eviction, kiểm tra/tải lại và dọn cache cũ có bảo vệ nhiều tab.
- [x] Hồ sơ có timezone/consent/góc nhìn; IndexedDB có outbox local-only. Cloud sync/conflict vẫn thuộc sau MVP và chưa tự gửi dữ liệu.

**DoD P1:** Tải đủ, tắt mạng, mở lại route chưa truy cập; lịch/Tarot/thư viện hoạt động; hồ sơ/nhật ký giữ sau đóng/mở; thử Android Chrome và iOS PWA.

## 6. P2 — Knowledge và Hybrid Chat

- [x] Catalog 229 mục: 156 nghĩa lá theo 2 hướng, 12 cung, 8 quẻ, 5 hành, 12 chi, 10 can, 12 Trực, 14 bài hướng dẫn/phương pháp.
- [x] Chuẩn hóa tiếng Việt có/không dấu; ưu tiên dấu khi phân biệt Càn/Cấn; alias theo từ, không substring tùy tiện.
- [x] Rule date/entity cho âm lịch, giờ truyền thống, năm Can Chi, cung Mặt Trời; từ chối ngày không hợp lệ và không tính Moon/Rising.
- [x] Local-first router; AI opt-in mặc định tắt, auth có sẵn; timeout/401/429/5xx/empty trả fallback.
- [x] UI source badge, nguồn nội bộ và điều hướng chi tiết; chat local không yêu cầu đăng nhập.
- [x] `/knowledge`: tìm kiếm, lọc Đông/Tây/Tarot/hướng dẫn, bookmark, hiển thị tăng dần.
- [x] Lịch sử local có tùy chọn không lưu; tách guest/account, không xuất token hoặc account AI history.
- [x] Golden corpus 128 câu độc lập; không gọi AI khi local có câu trả lời.
- [x] Registry 229 nhóm tra cứu có ID/alias/ví dụ, nguồn nội bộ và entity/rule riêng; không giả lập hội thoại tự do. Kiểm thử câu chuẩn cho mọi nhóm cùng corpus độc lập 128 câu.
- [x] Chuẩn hóa có/không dấu, dấu câu/kiểu chữ, hn/ko, alias và câu dẫn; hỗ trợ nguồn/giới hạn, ngày thiếu/sai và câu ngoài phạm vi. Fuzzy/từ lóng ngoài registry không được tự đoán.
- [x] Nội dung/index/registry là versioned JSON theo pack, đọc cache-only khi browser báo offline; không đưa toàn bộ tri thức vào entry JS.

**DoD P2:** Đạt trong unit và production-offline E2E: local có nguồn, ngoài phạm vi có giới hạn/gợi ý, no-key/offline/API lỗi không crash.

## 7. P3 — Tarot offline

- [x] 78 IDs duy nhất, 22 Major/56 Minor; tên, chất, hình, keywords, nghĩa xuôi/ngược.
- [x] Rút bằng Web Crypto + Fisher–Yates, không trùng trong phiên; lưu orientation/danh sách đầy đủ.
- [x] Trải 1/3/5/10 lá có nhãn vị trí, luận giải local theo chủ đề và liên hệ lá; AI chỉ mở rộng.
- [x] Nhật ký lưu/mở/sửa/xóa; thư viện lọc/tìm/zoom.
- [x] Motion rút/lật, reduced motion/không gian tĩnh.
- [x] 78 cảnh SVG Celestial gốc, có script tái tạo và attribution. Build chuẩn loại ảnh JoJo chưa xác minh quyền; cấu hình opt-in giữ khả năng tham chiếu riêng.
- [x] Nhật ký lưu snapshot nội dung/version; reopen giữ nguyên giải nghĩa khi nguồn thay đổi; snapshot nhập sai bị chặn.
- [x] Swipe lịch phân biệt trục/scroll và chặn click ngày cũ; skip Tarot, reduced-motion, keyboard/modal và 320–1280 px đã qua browser tests. FPS thiết bị thật vẫn cần kiểm chứng.

**DoD P3:** Rút/đọc/lưu/mở lại offline; không trùng; đủ ảnh/nghĩa hai hướng; không crop/che chữ; ngân sách đạt.

## 8. P4 — Visual/Motion

| Theme | Motif | Màu |
| --- | --- | --- |
| Fusion | Sacred geometry, sao, viền cổ | Midnight, indigo, gold, ivory |
| Eastern | Mây, ngọc, ấn triện, Bát quái | Jade, cinnabar, gold, charcoal |
| Western | Zodiac, celestial map, Tarot | Midnight, violet, silver, rose gold |

- [x] Theme/motion preference và vector Đông–Tây hiện có được giữ.
- [x] Giữ design/motion tokens hiện có, thống nhất thao tác button/page/flip; reduced-motion và không gian tĩnh có hiệu lực trong tests.
- [x] Font hệ thống hỗ trợ tiếng Việt, vùng chạm chính, form labels, keyboard/focus/screen-reader và phương án không chỉ mã hóa bằng màu; đã kiểm tra bằng browser, còn audit thiết bị thật.
- [x] Motion mục tiêu trong source: tap 140 ms, page 240 ms, flip 600 ms; không animate height/filter nặng trong luồng mới. Skip và giảm motion luôn hoàn thành được tác vụ.
- [x] Home giải thích chỉ số; Calendar sheet/gesture; Tarot trọn phiên local; Chat source; Profile minh bạch giới hạn; Knowledge có wheel tương tác và thông báo pack thiếu.
- [ ] Đo 60 FPS, INP/LCP/CLS và 320/375/390/768/1280 px; không dùng màu làm tín hiệu duy nhất.

## 9. Dung lượng ≤50 MiB

Định nghĩa là tổng tài nguyên cần tải để cache đầy đủ, gồm app, toàn nội dung và artwork. Không gồm dữ liệu cá nhân, browser metadata hoặc cache bản cũ trong cập nhật. Transfer bytes khác storage bytes.

| Nhóm | Mục tiêu |
| --- | ---: |
| Shell/JS/CSS/runtime | 8 MiB |
| Tri thức Đông/Tây | 5 MiB |
| Tarot text/index | 2 MiB |
| 78 artwork Tarot | 15 MiB |
| Zodiac/con giáp/ngũ hành/Bát quái/hành tinh | 8 MiB |
| Motion/trang trí | 3 MiB |
| Font subset | 2 MiB |
| Dự phòng | 5 MiB |
| **Tổng** | **48 MiB** |

- [x] Build tạo `reports/offline-size.json`: từng file, raw/storage và ước tính gzip transfer; tính cả worker và manifest.
- [x] Fail build khi raw hoặc gzip estimate >50 MiB. Gate raw chặt hơn để vẫn đạt khi host không nén text.
- [x] Worker source tham gia version hash; đổi worker không vô tình dùng cùng phiên bản cache.
- [x] Có CI typecheck/unit/build/browser/offline và upload báo cáo.
- [ ] Đo transfer thực tế trên hosting cuối; không gọi gzip estimate là số network đã đo.
- [x] Artwork SVG giữ sắc nét theo kích thước, không MP4/GIF, thư viện lazy-load; toàn deck nằm dưới ngân sách mà không cần pack HD.
- [x] Verifier kiểm asset không trùng giữa pack, core ≤8 MiB và full ≤50 MiB; nội dung/source/license tách khỏi tính toán.

## 10. Chia PR

1. **Security + Offline Foundation:** khóa client/server, RLS, PWA, backup, update an toàn, pack/DB foundation. Giữ gate xác minh tài khoản/production; chủ dự án cho phép tích hợp source thẳng master.
2. **Local Knowledge + Hybrid Chat:** local intent/entity/search, nguồn và fallback; ≥100 câu; pack content.
3. **Tarot Offline 2.0:** nội dung đầy đủ, artwork có quyền, spreads/reading/journal, motion.
4. **Eastern/Western Visual + Release:** đồng bộ UI, gestures/a11y/perf, E2E thiết bị, changelog/deployment.

Chủ dự án đã cho phép gộp toàn bộ thay đổi MVP vào một commit và push trực tiếp master. Phạm vi bốn PR trong kế hoạch được tích hợp cùng nhau; vẫn giữ screenshot, kiểm thử, size report và rollback. Các gate cần tài khoản nhà cung cấp/thiết bị thật được ghi rõ thay vì đánh dấu đã làm.

Sau MVP: ephemeris/natal chart và license dữ liệu; cloud sync/conflict; Eastern Oracle/Kinh Dịch độc lập; themes/decks/ngôn ngữ, iCalendar và nhắc lịch khi kết nối.

## 11. Nghiệm thu

Unit/integration: ngày biên/Tết/nhuận/UTC+7, đầu vào thiếu/sai; chat online/no-key/offline/timeout/401/429/5xx; deck/meaning/draw/orientation/journal; content ID/asset/hash/schema; backup conflict/quota/recovery; SW update và tab cũ.

E2E bắt buộc:

1. Online tải đủ → báo ready.
2. Offline/airplane → đóng/mở lại, route chưa mở vẫn chạy.
3. Xem lịch/âm lịch/ngày/đổi tháng; thử swipe khi đã triển khai.
4. Hỏi 10 câu local + 1 ngoài phạm vi; badge/nguồn đúng.
5. Tarot 3 lá → lật → tổng kết → lưu → reload/mở nhật ký, đúng hình/nghĩa.
6. Hồ sơ/theme/bookmark/chat → reload, dữ liệu còn; export/import preview không ghi trước xác nhận.
7. Reduced-motion không chặn hoàn thành tác vụ.
8. Online lại/update pack/SW, không mất dữ liệu và không dùng cache public cho AI/auth.

Thiết bị: iPhone Safari/Add to Home Screen; Android Chrome tầm trung; desktop Chrome/Firefox/Edge; portrait/landscape, keyboard, 320–1280 px.

**Release gate:** không secret client, offline hoàn chỉnh, chat trong phạm vi không bịa, đủ Tarot, phương pháp minh bạch, mobile/motion đạt, ≤50 MiB, backend/RLS/khóa cũ và artwork license được xác minh. Không ghi “100% production-ready” khi còn gate chưa đạt.

## 12. Tổ chức mã

Giữ các thư mục hiện tại để giảm thay đổi không cần thiết. Bổ sung `src/features/chatbot`, `src/features/knowledge`, `src/offline`; tiếp tục tách `calendar`, `profile`, engines, motion và `public/content/{eastern,western,tarot,chatbot}` theo từng PR khi thực sự chuyển dữ liệu. Chưa dựng thư mục rỗng để coi là đã triển khai.

## 13. Duy trì

- PR nhỏ, giữ save và mode hiện có; có rollback.
- Artwork có tên chuẩn, kích thước, tối ưu và quyền/nguồn.
- Local truy vết nguồn, AI phân biệt rõ, không ghi đè nội dung gốc.
- Trước mở rộng: cập nhật plan/FEATURES/tests/size report.
- Rollback đợt này: revert commit source và redeploy; không clear LocalStorage. SW cũ vẫn cần được thay qua cơ chế cập nhật. JSON backup schema v1 còn đọc được.

Xem [báo cáo nghiệm thu](docs/OFFLINE_FIRST_VERIFICATION.md) để biết lệnh nào đã chạy và giới hạn môi trường.

## Kết quả bản gộp

- 45 unit/integration tests pass; 13 browser flows pass (2 bộ hình tham chiếu opt-in được bỏ qua); 4 production-offline flows pass.
- Tải đủ → tắt mạng → đóng tab/mở tab mới → chat, lịch, 78 hình, luận giải, nhật ký và hồ sơ vẫn hoạt động.
- Không còn hạng mục code nền IndexedDB/content pack/backup/chat/Tarot/visual đang được mô tả như chưa triển khai. Các mục chưa đánh dấu ở trên là kiểm chứng tài khoản, phương pháp/thiết bị thật hoặc phát triển sau MVP.
- 28 Tú được hiển thị chưa kiểm định và loại khỏi điểm; không dùng thuật toán reset theo tháng để công bố kết quả.
