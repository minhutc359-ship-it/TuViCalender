# Triển khai AstroAI

## Frontend

```bash
npm ci
npm run typecheck
npm test
npm run build
```

Đưa thư mục `dist/` lên hosting static hoặc import repository vào Vercel. `vercel.json` dùng npm và fallback các route về `index.html`. Chỉ khai báo các biến công khai:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-anon-key
```

Không cần Supabase để dùng Tarot, hồ sơ hoặc lịch cục bộ. Không có secret AI trong frontend. Mọi khóa OpenAI từng được commit cần được thu hồi trước khi sử dụng ứng dụng công khai; kiểm tra usage và chi phí trong tài khoản OpenAI. Không sử dụng lại khóa cũ.

## Ngoại tuyến

Đưa **toàn bộ** `dist/` lên cùng origin HTTPS, bao gồm `sw.js`, manifest, JS/CSS và các hình. Build tự tạo danh sách tệp và hash; không sửa tệp trong `dist/` sau build. `/sw.js` phải trả JavaScript đúng MIME, không phải HTML fallback. Nên đặt `Cache-Control: no-cache` cho worker và index để nhận bản mới.

Người dùng mở **Cài đặt → Dùng ngoại tuyến → Tải bộ dữ liệu offline** khi còn mạng, chờ trạng thái sẵn sàng rồi mới ngắt mạng. Worker chỉ cache static public trong manifest, không cache API/auth hoặc dữ liệu gửi tới AI. Nhật ký/hồ sơ vẫn lưu LocalStorage tại thiết bị. Sau cập nhật cần mở lại khi có mạng và tải đủ bộ mới.

Kiểm tra production tại máy bằng `npm run build`, `npm run preview`; kiểm thử tự động bằng `npm run test:offline` sau build. Dev server không đăng ký service worker.

## Supabase AI

1. Tạo/link project Supabase bằng CLI của bạn.
2. Bật đăng nhập email trong Authentication. Cấu hình Site URL và Redirect URLs bao gồm `https://your-app.example/chat` và URL local cần dùng.
3. Chạy lần lượt [202610290001_ai_quota.sql](./supabase/migrations/202610290001_ai_quota.sql) và [202610310002_ai_global_quota.sql](./supabase/migrations/202610310002_ai_global_quota.sql) bằng SQL Editor, hoặc `supabase db push` nếu project đã link.
4. Đặt secrets theo [.env.server.example](./.env.server.example):

```bash
supabase secrets set OPENAI_API_KEY=YOUR_NEW_KEY
supabase secrets set OPENAI_MODEL=gpt-4
supabase secrets set AI_DAILY_GLOBAL_LIMIT=500
supabase secrets set ALLOWED_ORIGINS=https://your-app.example,http://localhost:5173
supabase functions deploy chat-ai
```

Không dùng khóa thật trong lịch sử shell; nên nhập secrets qua Supabase Dashboard hoặc một tệp secrets được ignore rồi dùng `--env-file`. Ví dụ lệnh trên chỉ mô tả tên biến và giá trị mẫu.

`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` do môi trường Edge Function cung cấp. Service-role key chỉ dùng phía server để tiêu thụ hạn mức; tuyệt đối không đưa vào cấu hình Vite.

Frontend dùng `supabase.functions.invoke('chat-ai')` với JWT phiên đăng nhập. Function xác minh user bằng `auth.getUser`; chỉ chấp nhận origin được liệt kê chính xác, POST/OPTIONS, body tối đa 64 KiB, tin nhắn 4.000 ký tự và tối đa 10 lượt lịch sử với role user/assistant. Giữ JWT verification mặc định; không triển khai function dưới dạng endpoint AI công khai.

Hạn mức trong PostgreSQL là **20 yêu cầu/người/ngày Việt Nam**, tối thiểu **3 giây giữa hai yêu cầu**. Migration thứ hai thêm trần tổng `AI_DAILY_GLOBAL_LIMIT` (mặc định ví dụ 500 lượt/ngày) để bảo vệ ngân sách nhà phát hành. Update quota là atomic và dùng user ID đã xác thực. RPC chỉ cấp quyền execute cho `service_role`; hai bảng quota bật RLS, không cấp quyền cho anon/authenticated. Khi quota/migration không hoạt động, function từ chối gọi AI. Lượt upstream lỗi vẫn tiêu thụ hạn mức.

Không cần bảng chat/profile cũ để chạy bản này: hồ sơ, nhật ký, sự kiện và lịch sử chat nằm trên trình duyệt. Function không ghi cuộc hội thoại vào database. Nếu thêm đồng bộ sau này, cần migration/RLS riêng theo `auth.uid()`.

### Đăng nhập Google và gói AI miễn phí

1. Trong Supabase Dashboard, mở **Authentication → Providers → Google**, bật provider và nhập OAuth Client ID/Secret từ Google Cloud.
2. Trong Google Cloud, thêm Authorized redirect URI chính xác: `https://<project-ref>.supabase.co/auth/v1/callback`.
3. Trong Supabase **URL Configuration**, đặt Site URL là domain production và thêm `https://your-app.example/chat` cùng URL local cần dùng vào Redirect URLs.
4. Chạy migration quota và deploy `chat-ai` như hướng dẫn trên. UI cấp tối đa 20 lượt AI/ngày/tài khoản; RPC xử lý quota nguyên tử phía server.
5. Kiểm thử cả tài khoản Google mới, đăng xuất/đăng nhập lại, callback production và lỗi provider bị tắt. Không đặt Google Client Secret hoặc OpenAI key trong biến `VITE_*`.

Gói được gọi là miễn phí đối với người dùng cuối trong hạn mức. OpenAI vẫn tính chi phí cho chủ API key; theo dõi usage/budget alert và có thể giảm quota server trước khi quảng bá công khai.

## Kiểm tra sau triển khai

- Truy cập trực tiếp `/tarot`, `/calendar`, `/profile`, `/chat`, `/settings` và tải lại.
- Tải bộ offline, tắt mạng, mở lại `/tarot`, thử ảnh Minor JoJo chưa mở, đọc luận giải và lưu/mở nhật ký.
- Đăng nhập bằng liên kết email với origin đã cấu hình.
- Thử một câu hỏi ngắn; xác nhận không có khóa OpenAI/service-role trong bundle hoặc request từ browser.
- Kiểm tra 401 khi thiếu user, 403 với origin khác, 429 khi đạt hạn mức.
- Xem log function; lỗi trả về không tiết lộ khóa hay nội dung lỗi upstream.

Bộ kiểm thử cục bộ mock dịch vụ AI/auth/quota để xác minh các nhánh này. Không thay thế kiểm tra integration với project Supabase thật. Bản cập nhật source không tự triển khai migration, function hoặc frontend.

## Nguồn kỹ thuật

- [OpenAI — xác thực và giữ secret ở server](https://developers.openai.com/api/reference/overview#authentication)
- [Supabase — xác thực Edge Functions](https://supabase.com/docs/guides/functions/auth)

## Cập nhật persona AI

Bản Mystic Fusion thêm `persona` vào request chatbot. Deploy lại `chat-ai` để dùng hai chỉ dẫn Đông/Tây; schema chỉ nhận `eastern` hoặc `western`, client cũ không gửi vẫn tương thích. Frontend không tự triển khai function hoặc cấu hình secrets. Kiểm thử persona hiện dùng mock, cần kiểm tra hội thoại thật sau đăng nhập trên môi trường đã cấu hình.

## Bản gộp Offline-First hoàn chỉnh trong source

- Build chuẩn đóng gói JoJo ref và hiển thị lựa chọn trong Settings. Chỉ đặt `VITE_ENABLE_REFERENCE_ART=false` khi cần phát hành bản Celestial-only; cờ này loại thư mục JoJo khỏi `dist` và ẩn lựa chọn.
- `npm run build` tự tạo versioned content JSON, manifest bốn pack và chạy `verify-offline.mjs`. Core tự precache; các pack còn lại tải riêng hoặc tải đầy đủ trong Settings. UI có hủy/tiếp tục, xóa pack, dọn cache cũ và lưu trữ bền vững.
- Dữ liệu người dùng dùng IndexedDB, có migration/snapshot/mirror tương thích LocalStorage. Import dùng transaction nguyên tử. Không clear browser data khi cập nhật.
- Không đặt immutable cho URL nội dung/artwork không có hash trong tên. `vercel.json` buộc revalidate `/content/`, `/assets/tarot/`, index và manifest; hashed JS/CSS vẫn được SW quản lý theo version và SHA-256.
- CI chạy 48 logic tests, 17 browser flows và 4 production-offline flows; JoJo ref, Google OAuth URL, anime gallery, Oracle, responsive và cold-offline là một phần của cấu hình chuẩn. Xem báo cáo chi tiết để biết giới hạn kiểm thử.
- Theo yêu cầu chủ dự án, source được gộp thành một commit và đẩy thẳng master. Điều này không tự deploy migration Supabase hay thu hồi khóa ở tài khoản nhà cung cấp.
