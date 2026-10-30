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
3. Chạy migration [202610290001_ai_quota.sql](./supabase/migrations/202610290001_ai_quota.sql) bằng SQL Editor hoặc `supabase db push` nếu project đã link.
4. Đặt secrets theo [.env.server.example](./.env.server.example):

```bash
supabase secrets set OPENAI_API_KEY=YOUR_NEW_KEY
supabase secrets set OPENAI_MODEL=gpt-4
supabase secrets set ALLOWED_ORIGINS=https://your-app.example,http://localhost:5173
supabase functions deploy chat-ai
```

Không dùng khóa thật trong lịch sử shell; nên nhập secrets qua Supabase Dashboard hoặc một tệp secrets được ignore rồi dùng `--env-file`. Ví dụ lệnh trên chỉ mô tả tên biến và giá trị mẫu.

`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` do môi trường Edge Function cung cấp. Service-role key chỉ dùng phía server để tiêu thụ hạn mức; tuyệt đối không đưa vào cấu hình Vite.

Frontend dùng `supabase.functions.invoke('chat-ai')` với JWT phiên đăng nhập. Function xác minh user bằng `auth.getUser`; chỉ chấp nhận origin được liệt kê chính xác, POST/OPTIONS, body tối đa 64 KiB, tin nhắn 4.000 ký tự và tối đa 10 lượt lịch sử với role user/assistant. Giữ JWT verification mặc định; không triển khai function dưới dạng endpoint AI công khai.

Hạn mức trong PostgreSQL là **20 yêu cầu/người/ngày Việt Nam**, tối thiểu **3 giây giữa hai yêu cầu**. Update quota là atomic và dùng user ID đã xác thực. RPC chỉ cấp quyền execute cho `service_role`; bảng bật RLS, không cấp quyền cho anon/authenticated. Khi quota/migration không hoạt động, function từ chối gọi AI. Lượt upstream lỗi vẫn tiêu thụ hạn mức.

Không cần bảng chat/profile cũ để chạy bản này: hồ sơ, nhật ký, sự kiện và lịch sử chat nằm trên trình duyệt. Function không ghi cuộc hội thoại vào database. Nếu thêm đồng bộ sau này, cần migration/RLS riêng theo `auth.uid()`.

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
