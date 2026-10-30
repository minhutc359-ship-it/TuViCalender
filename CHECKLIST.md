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

Đợt cập nhật chỉ thay đổi source cục bộ; chưa xác nhận triển khai backend/frontend hoặc đồng bộ dữ liệu giữa thiết bị.
