# AstroAI — tình trạng repository

Bản cập nhật Celestial Tarot theo `newSpec.md` được tích hợp vào codebase React/Vite hiện tại. Không gian Tarot, lịch, hồ sơ, trang chủ và chat dùng hệ giao diện navy/violet/gold/ivory.

Chi tiết chức năng/giới hạn nằm trong [FEATURES.md](./FEATURES.md), kiến trúc trong [ARCHITECTURE.md](./ARCHITECTURE.md), cách chạy trong [README.md](./README.md), triển khai trong [DEPLOYMENT.md](./DEPLOYMENT.md).

Đã có tùy chọn JoJo ref đủ 78 hình (22 Major theo truyện, 56 Minor là liên tưởng mỹ thuật), luận giải tiếng Việt theo bộ quy tắc tại máy và tải toàn bộ ứng dụng để mở lại khi offline. Luận giải kết hợp hướng, chủ đề, vị trí, cặp lá và hành động; không xác lập độ chính xác dự báo tương lai.

Không coi toàn bộ lộ trình P0–P3 là hoàn tất: lịch chuyên sâu, 75 tranh Celestial chi tiết, đồng bộ Supabase, thông báo và Kinh Dịch còn là công việc tiếp theo. Khóa từng xuất hiện trong Git cần được chủ tài khoản thu hồi; bản cập nhật không rewrite lịch sử hoặc thực hiện thao tác tài khoản OpenAI.

Đợt Mystic Fusion nâng giao diện Đông/Tây trên trang chủ, lịch, Tarot, hồ sơ, chat và cài đặt; thêm theme tự động, vector và lựa chọn chuyển động. Chi tiết ở [docs/MYSTIC_FUSION.md](./docs/MYSTIC_FUSION.md). Persona AI cần triển khai lại Edge Function; không có xác nhận hội thoại AI thật trong đợt giao diện này.
