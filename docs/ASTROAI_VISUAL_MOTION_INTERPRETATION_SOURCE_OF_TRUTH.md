# AstroAI 2.0 — Visual, Motion & Interpretation Source of Truth

> **Phiên bản:** 1.0.0
>
> **Ngày hiệu lực:** 02/11/2026
>
> **Phạm vi:** giao diện anime, motion, nội dung Đông–Tây, Tarot, gieo quẻ, AI và nguồn tham chiếu
>
> **Trạng thái:** tài liệu chuẩn của repository; khi code, nội dung hoặc artwork mâu thuẫn với tài liệu này thì phải cập nhật cả hai trong cùng PR
> **Chủ sở hữu sản phẩm:** AstroAI / TuViCalender

## 1. Mục đích

Tài liệu này là điểm tham chiếu duy nhất để quyết định:

- hình ảnh nào được đưa vào ứng dụng và thuộc pack offline nào;
- phong cách anime được phép dùng, cách ghi nguồn và quyền sử dụng;
- chuyển động nào giúp hiểu thao tác, chuyển động nào chỉ là trang trí;
- câu nào là kết quả tính toán, câu nào là diễn giải truyền thống, câu nào do AstroAI biên tập;
- cách trình bày nguồn, giới hạn và lời khuyên tham khảo;
- tiêu chí để xuất bản nội dung Đông phương, Tây phương, Tarot và gieo quẻ;
- ranh giới giữa chatbot local, AI online và dữ liệu người dùng;
- ngân sách tải xuống, khả năng offline, accessibility và nghiệm thu.

Tài liệu không xác nhận tử vi, chiêm tinh, Tarot hoặc Kinh Dịch là phương pháp dự báo khoa học. Ứng dụng dùng các hệ biểu tượng như công cụ học tập, tra cứu truyền thống và tự suy ngẫm.

## 2. Thứ tự ưu tiên khi có xung đột

1. Bảo mật và quyền riêng tư.
2. Độ đúng của phép tính và tính trung thực của nhãn nội dung.
3. Hoàn thành tác vụ offline và accessibility.
4. Khả năng đọc và hiểu kết quả.
5. Tính nhất quán của hình ảnh và motion.
6. Mức độ trang trí hoặc hiệu ứng gây ấn tượng.

Không hy sinh 1–4 để tăng hiệu ứng ở 5–6.

## 3. Ngôn ngữ nội dung chuẩn

Mỗi kết quả cần tuân theo thứ tự đọc sau:

1. **Tóm tắt:** một đến ba câu, trả lời “điều gì đáng chú ý?”.
2. **Điểm tựa:** dữ kiện, biểu tượng hoặc năng lực người dùng có thể chủ động.
3. **Điều cần kiểm chứng:** giả định, giới hạn, rủi ro hoặc dữ liệu còn thiếu.
4. **Bước nhỏ:** hành động cụ thể, an toàn, có thể hoàn tác.
5. **Khi nhìn lại:** thời điểm hoặc tín hiệu để đánh giá lại.
6. **Nguồn/phương pháp:** ID nguồn và nhãn loại nội dung.
7. **Giới hạn:** không dự báo chắc chắn, không thay tư vấn chuyên môn.

### 3.1. Từ ngữ được dùng

- “gợi ý”, “có thể”, “thường được diễn giải”, “một góc nhìn”, “hãy đối chiếu”;
- “theo bảng/quy tắc của ứng dụng” khi mô tả calculation;
- “theo truyền thống” khi mô tả hệ biểu tượng;
- “AstroAI biên tập” khi nội dung là câu hỏi tự soi chiếu hoặc kế hoạch hành động.

### 3.2. Từ ngữ không được dùng

- “chắc chắn sẽ”, “định mệnh”, “bảo đảm”, “100% đúng”;
- xác suất hoặc điểm phần trăm thành công không có mô hình kiểm định;
- chẩn đoán bệnh, chỉ định đầu tư, kết luận pháp lý;
- khẳng định Moon/Rising/12 nhà khi chỉ có ngày sinh;
- gắn “Hoàng đạo” chỉ dựa trên Trực;
- gọi nội dung local là “AI đã phân tích”.

## 4. Taxonomy nguồn và nhãn hiển thị

| Loại | ID | Ý nghĩa | Nhãn UI |
| --- | --- | --- | --- |
| Calculated | `CALC` | Kết quả do engine tính từ input và quy tắc định danh | `Đã tính tại thiết bị` |
| Traditional | `TRAD` | Bảng/khái niệm truyền thống có nguồn tham chiếu | `Diễn giải truyền thống` |
| Editorial | `EDIT` | Câu chữ, lời khuyên và câu hỏi do AstroAI biên tập | `Gợi ý tự soi chiếu` |
| AI generated | `AI` | Nội dung phát sinh qua gateway online | `Trả lời bằng AI` |
| Unknown/limited | `LIMIT` | Chưa đủ dữ liệu hoặc chưa có engine đáng tin cậy | `Chưa hỗ trợ / cần kiểm chứng` |

Một đoạn có thể dùng nhiều loại, nhưng phải nêu loại nào tạo ra phần nào. Ví dụ: ngày âm là `CALC`; giải thích ý nghĩa Trực là `TRAD`; ba bước hành động là `EDIT`.

## 5. Registry nguồn chuẩn

Các link dưới đây là nguồn đối chiếu, không phải tuyên bố mọi nội dung của AstroAI là bản dịch của nguồn.

| ID | Chủ đề | Nguồn | Cách dùng trong AstroAI |
| --- | --- | --- | --- |
| `SRC-EAST-01` | Âm lịch Việt Nam | [Hồ Ngọc Đức — Âm lịch Việt Nam](https://xemamlich.uhm.vn/vncal.html) và [thư viện JavaScript](https://www.xemamlich.uhm.vn/JavaScript/) | Fixture ngày âm, tháng nhuận, Can Chi; luôn dùng timezone UTC+7 trong engine Việt Nam |
| `SRC-EAST-02` | Tiết khí | [Hong Kong Observatory — 24 Solar Terms](https://www.hko.gov.hk/en/gts/time/24solarterms.htm) | Đối chiếu khái niệm 24 đoạn kinh độ 15°; giờ HKO là UTC+8 nên không chép thời điểm trực tiếp sang Việt Nam |
| `SRC-EAST-03` | Can Chi/lịch truyền thống | [Hong Kong Observatory — Calendar](https://www.hko.gov.hk/en/gts/time/Calendar.htm) | Đối chiếu thuật ngữ Thiên can, Địa chi, chu kỳ con giáp |
| `SRC-EAST-04` | Kinh Dịch | [Chinese Text Project — Book of Changes](https://ctext.org/book-of-changes) | Đối chiếu cấu trúc quẻ và thứ tự King Wen; bản hiện tại chưa dịch/phát hành 64 Quái từ hoặc 384 Hào từ |
| `SRC-TAROT-01` | Rider–Waite–Smith | [A. E. Waite — The Pictorial Key to the Tarot](https://en.wikisource.org/wiki/The_Pictorial_Key_to_the_Tarot) | Nguồn lịch sử để đối chiếu biểu tượng và nghĩa cổ; nội dung tiếng Việt là biên soạn hiện đại, không phải bản dịch nguyên văn |
| `SRC-WEST-01` | Chòm sao thiên văn | [International Astronomical Union — The Constellations](https://www.iau.org/IAU/Astronomy-FAQs/Constellations.aspx) | Phân biệt chòm sao thiên văn với 12 cung chiêm tinh đều 30° |
| `SRC-WEST-02` | Ephemeris | [Swiss Ephemeris documentation](https://www.astro.com/swisseph/swisseph.htm) | Ứng viên cho natal chart sau MVP; phải kiểm tra license và dữ liệu trước khi tích hợp |
| `SRC-AUTH-01` | Google OAuth | [Supabase — Sign in with Google](https://supabase.com/docs/guides/auth/social-sign-in/auth-google) | Cấu hình provider/callback; Google Client Secret và OpenAI key chỉ ở server |
| `SRC-AUTH-02` | OAuth frontend | [Supabase JS — signInWithOAuth](https://supabase.com/docs/reference/javascript/auth-signinwithoauth) | Luồng đăng nhập qua SDK; AI vẫn là opt-in và có quota server |

### 5.1. Quy tắc thêm nguồn

- Ưu tiên tài liệu gốc, tài liệu cơ quan chuyên môn, sách public-domain hoặc documentation chính thức.
- Ghi ngày truy cập trong PR khi nguồn thay đổi theo thời gian.
- Không sao chép đoạn dài; ghi tóm tắt và liên kết.
- Nội dung truyền thống có nhiều trường phái phải nói rõ bảng nào được chọn.
- Nếu không truy vết được, gắn `LIMIT` và không dùng làm kết luận.

## 6. Phương pháp Đông phương

### 6.1. Lịch âm Việt Nam

- Timezone chuẩn: UTC+7.
- Input: ngày dương lịch hợp lệ.
- Output: ngày/tháng/năm âm, cờ tháng nhuận, Can Chi.
- Test bắt buộc: Tết, ngày trước/sau Tết, bắt đầu/kết thúc tháng, tháng nhuận, mốc năm và ít nhất một fixture mỗi thập niên được hỗ trợ.
- UI phải hiển thị rõ “tháng nhuận” thay vì chỉ số tháng.
- Không dùng kết quả theo timezone máy để thay cho UTC+7.

### 6.2. Tiết khí và Bát tự

- 24 tiết khí được hiểu theo kinh độ biểu kiến của Mặt Trời, cách nhau 15° (`SRC-EAST-02`).
- Engine hiện tại chỉ công bố kết quả xấp xỉ, không công bố thời điểm chuyển tiết chính xác đến phút.
- Bốn trụ chỉ hiển thị khi có ngày và giờ; gần ranh giới tiết khí phải có cảnh báo.
- Chưa luận mệnh Bát tự chuyên sâu, chưa tính đại vận hoặc dụng thần.

### 6.3. Ngũ hành và Bát quái

- Ngũ hành là mô hình biểu tượng, không phải định luật vật lý.
- Màu sắc dùng như ký hiệu thị giác, không được bảo đảm “may mắn”.
- Bát quái dùng thứ tự ba hào từ dưới lên.
- Pattern chuẩn trong oracle: Càn `111`, Đoài `110`, Ly `101`, Chấn `100`, Tốn `011`, Khảm `010`, Cấn `001`, Khôn `000`.
- Hình tượng, hành và hướng phải nhất quán giữa Knowledge, Profile và Oracle.

### 6.4. Gieo quẻ offline

Phiên bản hiện tại cố ý không gán tên/số 64 quẻ King Wen và không phát hành bản dịch Quái từ/Hào từ. Nó chỉ:

1. dùng Web Crypto tạo sáu kết quả;
2. ánh xạ xác suất ba đồng xu thành 6/7/8/9 theo tỷ lệ 1/8, 3/8, 3/8, 1/8;
3. đọc hào từ dưới lên;
4. ghép ba hào dưới và ba hào trên thành hai quái;
5. đổi hào 6/9 để hiển thị cấu trúc sau biến đổi;
6. đưa câu hỏi và bước hành động `EDIT`.

Vì chưa có bộ dịch được rà soát cho 64/384 đoạn, UI không được nói đây là “lời phán Kinh Dịch”. Khi bổ sung 64 quẻ phải có schema `hexagramId`, bản quyền, người biên tập, reviewer và fixture King Wen.

## 7. Phương pháp Tây phương

### 7.1. Cung Mặt Trời

- Bản hiện tại dùng khoảng ngày phổ biến theo lịch dân dụng để tra Sun Sign.
- Đây là `TRAD`, không phải vị trí thiên văn tính bằng ephemeris.
- Người sinh gần ngày chuyển cung phải được báo rằng thời điểm chuyển có thể thay đổi theo năm/timezone.
- 12 cung chia đều 30° trong hệ chiêm tinh; không đồng nhất với ranh giới chòm sao IAU (`SRC-WEST-01`).

### 7.2. Moon, Rising và natal chart

- Không suy Moon/Rising từ Sun Sign.
- Muốn tính phải có ngày, giờ, timezone và tọa độ nơi sinh.
- Engine tương lai phải dùng ephemeris đã kiểm tra license (`SRC-WEST-02`), có fixture so sánh và ghi house system.
- Trước khi engine đó tồn tại, UI chỉ giải thích thuật ngữ và gắn `LIMIT`.

### 7.3. Diễn giải dễ đọc

Mỗi cung/nguyên tố cần có: biểu tượng, ba cung trong nhóm, câu giải thích ngắn, điều không nên suy ra. Không gán tính cách cố định hoặc kết luận tương hợp quan hệ chỉ từ hai Sun Sign.

## 8. Phương pháp Tarot

### 8.1. Dữ liệu lá

- 78 ID duy nhất: 22 Major, 14 lá cho mỗi chất Wands/Cups/Swords/Pentacles.
- Mỗi lá có nghĩa xuôi/ngược, keywords và ngữ cảnh general/love/career/finance/advice.
- `SRC-TAROT-01` là nguồn lịch sử để đối chiếu; câu chữ tiếng Việt là `EDIT`.
- JoJo ref chỉ đổi artwork; không đổi nghĩa lá. 22 Major có đối ứng chính thức trong tác phẩm, 56 Minor là liên tưởng biên tập và phải gắn nhãn.
- Chủ repository chịu trách nhiệm quyền phân phối artwork JoJo trước khi phát hành công khai.

### 8.2. Luận giải nhiều lá `rws-vi-3`

Input: spread, vị trí, card ID, orientation, chủ đề, câu hỏi tùy chọn. Output theo thứ tự:

1. tổng quan có điều kiện;
2. từng lá: nghĩa, ngữ cảnh, vai trò vị trí;
3. mô-típ và liên hệ cặp;
4. điểm tựa;
5. điều cần kiểm chứng;
6. bước nhỏ;
7. thời điểm nhìn lại;
8. câu hỏi tự soi chiếu;
9. giới hạn.

Kết quả lưu snapshot để nhật ký không tự thay đổi khi phiên bản nội dung nâng cấp. Snapshot cũ thiếu trường mới phải có fallback và vẫn mở được.

### 8.3. Lời khuyên an toàn

- Tình cảm: ưu tiên đồng thuận, ranh giới và hành vi nhất quán; không khuyến khích theo dõi/kiểm soát.
- Công việc: đề xuất thử nghiệm nhỏ và phản hồi thật; không bảo đảm thăng chức.
- Tài chính: không đưa mã chứng khoán, tỷ lệ lợi nhuận hoặc chỉ định giao dịch.
- Sức khỏe: chỉ gợi ý chăm sóc chung; khuyên tìm chuyên gia khi có dấu hiệu cần thiết.
- Tương lai/kết quả: diễn đạt như xu hướng có điều kiện, không phải sự kiện chắc chắn.

## 9. Chat local và AI online

### 9.1. Local-first

- Chuẩn hóa tiếng Việt có/không dấu, tách intent/entity và tìm knowledge trước.
- Câu trả lời local phải có source/method và route hành động.
- Ngoài phạm vi phải nói rõ giới hạn, không bịa.
- Lịch sử local là tùy chọn và nằm trên thiết bị.

### 9.2. AI miễn phí cho người dùng cuối

- Đăng nhập Google/email qua Supabase; không thu OpenAI key của khách.
- UI cho phép người dùng chủ động bật AI.
- Quota hiện tại: 20 lượt/người/ngày Việt Nam; trần tổng server cấu hình bằng `AI_DAILY_GLOBAL_LIMIT`.
- “Miễn phí” chỉ có nghĩa người dùng cuối không trả phí trong hạn mức; chủ API key vẫn chịu chi phí upstream.
- Nếu chưa deploy provider/migration/Edge Function, local engine vẫn phải hoàn thành tác vụ.
- Frontend không có OpenAI secret, Google Client Secret hoặc `dangerouslyAllowBrowser`.

## 10. Art direction — Celestial Feng Shui Anime

### 10.1. Nguyên tắc

- Nhân vật nguyên bản, trưởng thành, biểu cảm tĩnh và có chủ ý.
- Chất liệu: hand-painted animation-inspired fantasy, ánh sáng điện ảnh, chiều sâu không gian.
- Đông phương: jade, cinnabar, ochre, silver, cloud ribbon, đài quan sát, la bàn.
- Tây phương: midnight blue, violet, rose gold, observatory, constellation, astrolabe.
- Tarot: bàn đọc, lá bài nguyên bản, hành động suy ngẫm, không kinh dị hóa.
- Không dùng chữ AI sinh trong ảnh; mọi text là HTML để dịch và accessibility.
- Không sao chép trang phục, gương mặt hoặc pose nhận diện của nhân vật có bản quyền.
- Không dùng hình anime như bằng chứng về truyền thống; caption luôn nêu vai trò minh họa.

### 10.2. Asset hiện tại

| Nhóm | Số lượng | Đường dẫn | Pack |
| --- | ---: | --- | --- |
| Editorial Celestial không nhân vật | 6 | `public/assets/illustrations/` | core |
| Ngũ hành anime | 5 | `public/assets/anime/eastern/` | eastern |
| Bốn nguyên tố Zodiac anime | 4 | `public/assets/anime/western/` | western |
| Bối cảnh Tarot anime | 3 | `public/assets/anime/tarot/` | tarot |
| Celestial Tarot gốc | 78 mặt + mặt lưng | `public/assets/tarot/celestial-v1/` | tarot |
| JoJo reference | 78 mapping + portrait/back/source | `public/assets/tarot/jojo-ref/` | tarot |

12 ảnh anime mới là WebP 768×768, khoảng 100–150 KiB/ảnh. PNG master không nằm trong production repository. Prompt đầy đủ nằm ở `docs/ILLUSTRATION_PROMPTS.md`; attribution ở `ATTRIBUTIONS.md`.

### 10.3. Alt text

Alt mô tả nhân vật, hành động và biểu tượng có ích. Không ghi “ảnh đẹp”, không nhồi keywords, không dùng caption trang trí làm alt. Ảnh chỉ trang trí phải `aria-hidden`/alt rỗng; ảnh giải thích nội dung phải có alt.

## 11. Motion system

| Tương tác | Motion | Mục tiêu | Reduced motion |
| --- | --- | ---: | --- |
| Button click | scale `.97 → 1` | 100–180 ms | bỏ scale |
| Tab đổi nhóm | fade + translateY nhỏ | 180–260 ms | đổi tức thời |
| Gallery reveal | stagger opacity/translate | 380 ms | bỏ animation |
| Hover artwork | zoom ≤1.05 + light sweep | 550–650 ms | bỏ transition |
| Tarot shuffle | deck offset/rotate, không khóa nút | ≤900 ms | reveal trực tiếp |
| Tarot flip | `rotateY` front/back | 500–700 ms | crossfade/tức thời |
| Oracle cast | icon coin spin + từng hào reveal | ≤700 ms | kết quả tức thời |
| Page enter | opacity + translate nhỏ | 200–300 ms | bỏ animation |

Chỉ animate `transform` và `opacity` cho chuyển động thường xuyên. Không dùng blur/filter nhiều lớp trên toàn màn. Mọi task phải hoàn thành khi motion bị tắt bằng `prefers-reduced-motion` hoặc setting `calm`.

## 12. Cấu trúc gallery anime trong UI

- Knowledge hiển thị ba tab Ngũ hành/Bốn nguyên tố/Tarot.
- Desktop dùng grid; mobile dùng horizontal scroll có snap.
- Caption luôn thấy, không phụ thuộc hover.
- Ảnh lazy-load trừ hình chính của Oracle.
- Tarot Result chọn ảnh theo chủ đề nhưng ghi rõ ảnh không đổi kết quả.
- Home portal giữ cảnh editorial thuộc core để không vỡ ảnh khi người dùng chưa tải pack; nhân vật anime xuất hiện trong gallery/Oracle/Tarot và luôn có fallback core. Icon vector vẫn được giữ cho thao tác và sơ đồ chính xác.

## 13. Offline packs và ngân sách

Giới hạn phát hành vẫn là **50 MiB tải xuống** vì 12 ảnh mới đã tối ưu, chưa cần dùng quyền nâng budget của chủ dự án.

| Pack | Nội dung hình mới | Quy tắc |
| --- | --- | --- |
| core | 6 editorial WebP | tự cài cùng app shell |
| eastern | 5 Ngũ hành anime | tải tùy chọn hoặc Full Offline |
| western | 4 nguyên tố Zodiac anime | tải tùy chọn hoặc Full Offline |
| tarot | 3 bối cảnh anime + deck | tải tùy chọn hoặc Full Offline |

Build phải đo raw và gzip estimate, kiểm SHA-256, ownership, trùng asset và size từng ảnh. Core ≤8 MiB; tổng raw và transfer estimate ≤50 MiB. Chỉ nâng trần nếu báo cáo thực tế vượt giới hạn sau khi đã thử WebP/AVIF, resize, lazy-load và loại asset trùng.

## 14. Quyền riêng tư và lưu trữ

- Oracle lưu tối đa 30 lần gieo trong `astroai.oracle.v1`.
- Backup JSON allowlist có Oracle, Tarot, hồ sơ, sự kiện, bookmark và chat local.
- Import gộp theo ID, không silently overwrite record cùng ID.
- Nội dung AI tài khoản không được đưa vào backup local chung.
- Câu hỏi Oracle không rời thiết bị.
- Tarot journal lưu snapshot; profile và lịch sử vẫn hoạt động khi offline.

## 15. Accessibility

- Target chính ít nhất 44×44 CSS px.
- Tab dùng role/aria-selected; kết quả Oracle có `aria-live`.
- Màu không phải tín hiệu duy nhất cho âm/dương, xuôi/ngược, tốt/xấu.
- Caption ảnh có contrast đủ; text không vẽ trực tiếp lên bitmap.
- Keyboard hoàn thành được tab, xào/chọn/lật bài, modal, gallery và gieo quẻ.
- Screen reader đọc hào theo thứ tự UI từ trên xuống nhưng label nêu số hào gốc và câu “hào 1 ở dưới”.

## 16. Kiểm thử bắt buộc

### 16.1. Logic

- 78 Tarot ID/asset/meaning đầy đủ và không trùng.
- Tarot snapshot mới/cũ hợp lệ.
- Oracle có đủ 8 pattern; xác suất byte mapping đúng 1/8–3/8–3/8–1/8; thứ tự hào từ dưới lên.
- Backup nhận Oracle hợp lệ và từ chối record hỏng.
- Source registry và version xuất hiện đúng trong content build.

### 16.2. Browser

- Knowledge đổi 5 → 4 card khi đổi tab.
- Oracle gieo đủ 6 hào, reload vẫn mở lần gần nhất.
- Google OAuth tạo URL provider đúng trong môi trường test.
- Tarot hiển thị lời khuyên, điểm tựa, cảnh báo, bước và ảnh chủ đề.
- 320/375/390/768/1280 không overflow; bottom nav không che nút.

### 16.3. Offline

- Tải đủ pack, chuyển offline, cold reload.
- Mở Gallery, Oracle, Calendar, local Chat và Tarot.
- Lưu/reopen Oracle và Tarot không mất kết quả.
- Reduced motion hoàn thành được mọi task.

## 17. Definition of Done cho nội dung mới

Một mục chỉ được coi là hoàn thành khi:

- có ID, version, locale, category và source/method;
- nhãn `CALC/TRAD/EDIT/AI/LIMIT` không gây hiểu nhầm;
- câu tóm tắt dễ đọc trước chi tiết;
- có giới hạn và lời khuyên không vượt thẩm quyền;
- test schema và fixture pass;
- asset tồn tại, tối ưu, có alt và attribution;
- pack ownership đúng và build không vượt budget;
- hoạt động offline/reduced-motion/keyboard;
- tài liệu này được cập nhật nếu phương pháp thay đổi.

## 18. Gate chưa được phép quảng bá là hoàn tất

- Natal chart đầy đủ, Moon/Rising và 12 houses từ ephemeris.
- Bản dịch/diễn giải 64 quẻ và 384 hào đã được chuyên gia rà soát.
- Kiểm định mọi trường phái xem ngày hoặc Bát tự.
- Chứng minh khoa học cho dự báo Tarot/tử vi/chiêm tinh.
- Google OAuth production trước khi chủ dự án bật provider, callback và deploy backend.
- Quyền phân phối công khai đối với JoJo ref trước khi chủ dự án xác nhận.

Ứng dụng có thể phát hành các phần đã kiểm thử mà không tuyên bố các gate trên đã hoàn tất.

## 19. Quy tắc thay đổi

Mọi PR thay đổi calculation, nội dung, nguồn, prompt, asset hoặc motion phải ghi:

1. phần nào trong tài liệu này thay đổi;
2. test nào bảo vệ thay đổi;
3. delta dung lượng từng pack;
4. ảnh hưởng offline/reduced-motion;
5. migration/rollback nếu schema thay đổi;
6. người rà soát nội dung nếu thêm bản dịch hoặc lời giải chuyên sâu.

## 20. Tóm tắt phát hành hiện tại

Bản hiện tại có 6 cảnh editorial, 12 cảnh nhân vật anime, 78 lá Celestial gốc, JoJo reference bật theo yêu cầu chủ dự án, gallery học biểu tượng, Oracle sáu hào offline, Tarot `rws-vi-3`, lời khuyên có cấu trúc và Google/email login cho AI có quota. Các chức năng tính toán cốt lõi vẫn local-first; AI là tầng tùy chọn và không được mô tả như nguồn chân lý.
