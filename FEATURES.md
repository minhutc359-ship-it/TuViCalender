# Tình trạng chức năng AstroAI 2.0

| Phần        | Đã triển khai                                                                                                                 | Giới hạn / công việc sau                                                                                |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Giao diện   | Navy/violet/gold/ivory theo concept, desktop/mobile, trạng thái rỗng/lỗi, giảm chuyển động                                    | Chưa có âm thanh hoặc đồ họa nền nặng                                                                   |
| Tarot       | Dữ liệu 78 lá, nghĩa riêng xuôi/ngược, Web Crypto + Fisher–Yates, rút không trùng                                             | Artwork mới là biểu tượng/pip; ba lá đầu giữ minh họa concept                                           |
| Luận giải   | Bộ quy tắc RWS tiếng Việt tại máy, chủ đề tự động hoặc chọn, vị trí, xuôi/ngược, liên hệ lá, hành động                        | Diễn giải hiện đại do ứng dụng biên soạn; không hiểu ngôn ngữ như AI, không xác lập độ chính xác dự báo |
| JoJo ref    | Đủ 78 hình Stand cục bộ, lựa chọn lưu cho mọi nơi hiển thị                                                                    | 22 Major đối ứng trong truyện; 56 Minor là liên tưởng mỹ thuật, không phải canon                        |
| Ngoại tuyến | Manifest, service worker, tải trọn bộ có kiểm tra hash, mở lại web/rút bài/nhật ký khi tắt mạng                               | Cần tải một lần trên bản production HTTPS/localhost; chat AI và nguồn ngoài cần mạng                    |
| Kiểu trải   | Hằng ngày 1, thời gian 3, tình yêu 3, sự nghiệp 5, Celtic Cross 10                                                            | Celtic Cross hiển thị theo vị trí có nhãn, chưa có editor tự tạo trải                                   |
| Nhật ký     | Lưu câu hỏi/lá/hướng/ghi chú, xem/sửa/xóa, tối đa 200 phiên                                                                   | LocalStorage, chưa đồng bộ giữa thiết bị                                                                |
| Thư viện    | 78 lá, tìm tên/từ khóa, lọc chất, phóng to nghĩa xuôi/ngược                                                                   | SVG hiện tải nguyên bản vector                                                                          |
| Trang chủ   | Chỉ số theo ngày/hồ sơ, lịch âm, Can Chi, lá hằng ngày                                                                        | Chỉ số là hàm băm giải trí, không phải phép luận vận mệnh                                               |
| Hồ sơ       | Nhiều hồ sơ, thêm/sửa/xóa/chuyển, cung Mặt Trời, Can Chi                                                                      | Tháng âm thay tiết khí; chưa có natal chart đầy đủ                                                      |
| Lịch        | Âm dương UTC+7, ngày/giờ hoàng đạo, 6 bộ lọc, xung tuổi, lễ phổ biến, lưu sự kiện                                             | 28 Tú/điểm ngày giản lược; chưa tính tiết khí, thông báo hoặc lịch định kỳ                              |
| AI          | Email login, gọi Edge Function, bounded input, CORS, quota atomic, lịch sử theo tài khoản trên thiết bị, chuyển câu hỏi Tarot | Cần cấu hình/deploy Supabase; chưa chạy integration thật trong đợt cập nhật                             |
| Bảo mật     | Bỏ browser OpenAI SDK/secret, ignore env, migration RLS, dependency được vá                                                   | Chủ tài khoản phải revoke khóa đã lộ; lịch sử Git chưa được rewrite                                     |

Chưa triển khai: đồng bộ dữ liệu người dùng qua Supabase, thông báo, cung Mọc/Mặt Trăng, Kinh Dịch 64 quẻ và 75 tranh Celestial nhân vật chi tiết. Đây là các giai đoạn tiếp theo của `newSpec.md`, không phải chức năng đang có.

Trang `/settings` chọn bộ hình và tải dữ liệu offline; thư viện tìm được tên Stand và nhân vật. Nghĩa Tarot và bản ghi nhật ký không thay đổi khi đổi minh họa. Phần giải nghĩa nêu nguồn, phiên bản, phương pháp và giới hạn của bộ quy tắc cục bộ.

## Mystic Fusion

Đã nâng hệ thị giác trên các màn hình chính, thêm ba theme và tự động theo route, bộ vector Đông/Tây, tùy chọn không gian tĩnh, bảng ngày chi tiết, hồ sơ hai truyền thống và persona AI có kiểm tra ở server. Xem [đặc tả triển khai](./docs/MYSTIC_FUSION.md). Natal chart thiên văn, Moon/Rising, quẻ Oracle và Bát tự đầy đủ vẫn chưa được tính trong bản này.
