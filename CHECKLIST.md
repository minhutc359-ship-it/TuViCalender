# Kiểm tra bản cập nhật

```bash
npm ci
npm run typecheck
npm test
npm run build
npm run test:e2e
npm run test:offline
npm audit
```

- Tarot: chọn đủ số lá, không trùng, lật xuôi/ngược, mở artwork, lưu/sửa/xóa nhật ký sau reload.
- JoJo ref: đủ 78 ảnh, 22 đối ứng Major và 56 liên tưởng Minor được phân biệt trong UI, lựa chọn phục hồi sau reload.
- Luận giải: dữ liệu riêng cho 780 tổ hợp lá/hướng/chủ đề, vai trò vị trí, cặp lá, hành động, giới hạn và tương lai có điều kiện.
- Offline: chờ tải đủ, ngắt mạng rồi mở lại route, xem ảnh chưa mở, rút/đọc/lưu nhật ký; tải lỗi không báo sẵn sàng, thử lại hoàn tất.
- Daily: lá/ngày/hồ sơ và chỉ số không thay đổi sau reload.
- Hồ sơ: thêm nhiều người, đổi/sửa/xóa và phục hồi sau reload.
- Lịch: qua tháng/năm, sáu bộ lọc, âm lịch/giờ, lưu/xóa sự kiện.
- Responsive: desktop và mobile, điều hướng bàn phím, reduced motion, dữ liệu LocalStorage hỏng/bị chặn.
- AI: unit tests origin/auth/schema/quota/upstream; integration thật thực hiện sau khi cấu hình Supabase.
- Triển khai: theo [DEPLOYMENT.md](./DEPLOYMENT.md); revoke khóa cũ, deploy migration/function, cấu hình email và allowlist origin.

Đợt cập nhật source được gộp một commit để push master theo chỉ định; chưa xác nhận triển khai backend/frontend hoặc đồng bộ dữ liệu giữa thiết bị.

- Mystic Fusion: theme cố định/tự động qua reload và route, giảm chuyển động OS/không gian tĩnh, cả ba theme ở 360px.
- Lịch: bảng ngày mở/đóng bằng bàn phím, chọn ngày để ghi sự kiện, dữ liệu phục hồi sau reload.
- Hồ sơ: vòng biểu tượng không giả lập lá số, tổng đếm thiên can bằng số trụ có dữ liệu.
- Chat: lời chào/câu gợi ý theo persona; enum server từ chối chuỗi chỉ dẫn lạ; auth/quota vẫn được kiểm thử.

- Chat local: 128 golden queries, nguồn/điều hướng, no-login, no-key, online AI opt-in/offline/timeout/401/429/5xx, câu hỏi ngoài phạm vi.
- Knowledge: 229 mục ID unique, Càn/Cấn không trùng, search nhiều từ, bookmark/reload, 156 nghĩa theo hướng.
- Backup: preview trước ghi, giữ ID trùng/settings, JSON sai/8 MiB/ID trùng bị chặn; rollback khi quota/ghi lỗi; không xuất token/account history.
- Update SW: không skipWaiting tự động, bản mới kiểm đủ trước activation, old hashed chunk vẫn đọc từ cache cũ.
- Budget: build fail >50 MiB, gồm worker/manifest, báo raw và gzip estimate riêng.
- Không đánh dấu E2E đã pass nếu Chromium không cài được. Giới hạn môi trường được ghi trong báo cáo kiểm chứng.
