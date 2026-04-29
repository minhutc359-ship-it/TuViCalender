# 🌟 Hướng dẫn sử dụng các tính năng AstroAI

## 📱 Tổng quan

AstroAI là nền tảng tử vi AI kết hợp giữa **Phương Đông** (Bát tự, Can Chi, Ngũ hành) và **Phương Tây** (12 cung hoàng đạo). Ứng dụng có 5 trang chính:

1. **Trang chủ** - Vận mệnh hằng ngày
2. **Lịch** - Chọn ngày đẹp
3. **AI Chat** - Hỏi đáp với trợ lý AI
4. **Tarot** - Bói bài Tarot
5. **Cá nhân** - Thông tin & bát tự của bạn

---

## 1️⃣ Trang chủ - Vận mệnh hằng ngày

### Tính năng:

- **Ngày âm lịch hiện tại**: Hiển thị ngày, tháng, năm âm lịch và Can Chi
- **Trực trong ngày**: Cho biết hôm nay là Hoàng Đạo hay Hắc Đạo
- **Điểm vận mệnh**: 4 chỉ số (Tài lộc, Tình duyên, Công việc, Sức khỏe) từ 0-10 sao
- **Màu may mắn**: Dựa trên 28 Tú của ngày
- **Số may mắn**: Dựa trên ngày âm lịch
- **Sao hôm nay**: 1 trong 28 sao (Giác, Càng, Đê, Phòng, ...)
- **Giờ tốt**: Giờ Hoàng Đạo để làm việc quan trọng
- **Lời khuyên**: Những việc nên làm và nên tránh trong ngày

### Cách sử dụng:

1. Mở app → Trang chủ tự động load
2. Xem điểm vận mệnh (số sao càng nhiều càng tốt)
3. Đọc phần "Lời khuyên hôm nay"
4. Check "Nên làm" và "Nên tránh"
5. Ghi nhớ giờ tốt để sắp xếp công việc

### Cơ chế hoạt động:

```typescript
// 1. Lấy ngày hiện tại
const now = new Date();

// 2. Chuyển đổi sang âm lịch
const lunar = solarToLunar(day, month, year);

// 3. Tính Trực (12 Day Officers)
const truc = getTruc(lunar.day, lunar.month);
// Công thức: (lunar.month + lunar.day - 2) % 12

// 4. Kiểm tra Hoàng Đạo hay Hắc Đạo
const isHoangDao = ['Kiến', 'Trừ', 'Mãn', 'Định', 'Chấp', 'Thành', 'Khai'].includes(truc);

// 5. Tính 28 Tú (Lunar Mansions)
const tu = getTu(lunar);
// Công thức: ((lunar.month - 1) * 30 + lunar.day - 1) % 28

// 6. Tính điểm số (0-100)
let score = 50;
if (isHoangDao) score += 30;
if (tu.good) score += 10;

// 7. Map score → sao (0-10)
const stars = Math.floor(score / 10);
```

---

## 2️⃣ Lịch - Chọn ngày đẹp

### Tính năng:

- **Lịch tháng**: Hiển thị toàn bộ ngày trong tháng
- **Ngày Hoàng Đạo**: Đánh dấu bằng sao ⭐
- **Lọc theo sự kiện**: Cưới hỏi, Khai trương, Mua xe, Nhập trạch, Xuất hành, Ký hợp đồng
- **Chi tiết ngày**: Click vào ngày bất kỳ để xem phân tích đầy đủ
- **Âm lịch**: Hiển thị ngày âm lịch tương ứng
- **Việc nên làm/tránh**: Dựa trên 12 Trực

### Cách sử dụng:

#### Tìm ngày đẹp tổng quát:

1. Vào trang Lịch
2. Dùng mũi tên < > để chuyển tháng
3. Các ngày có sao ⭐ = Hoàng Đạo (ngày tốt)
4. Click vào ngày để xem chi tiết

#### Tìm ngày đẹp cho sự kiện cụ thể:

1. Chọn loại sự kiện (ví dụ: "Cưới hỏi")
2. App sẽ filter chỉ hiển thị ngày phù hợp với sự kiện đó
3. Click vào ngày để xem:
   - Điểm số (càng cao càng tốt, tối đa 100)
   - Âm lịch
   - Sao hôm đó
   - Giờ tốt
   - Lý do tại sao ngày này tốt

### Thuật toán chọn ngày cưới:

```typescript
function findBestWeddingDays(year, month) {
  const results = [];

  for (let day = 1; day <= 31; day++) {
    const analysis = analyzeDay(day, month, year);

    // Điều kiện:
    // 1. Phải là Hoàng Đạo
    if (!analysis.isHoangDao) continue;

    // 2. Phải có "Cưới hỏi" trong việc nên làm
    if (!analysis.goodFor.includes('Cưới hỏi')) continue;

    // 3. Không có "Tang sự" trong việc nên tránh
    if (analysis.badFor.includes('Tang sự')) continue;

    // 4. Score >= 70
    if (analysis.score < 70) continue;

    results.push(analysis);
  }

  // Sort theo điểm cao xuống thấp
  return results.sort((a, b) => b.score - a.score);
}
```

### 12 Trực và việc nên làm:

| Trực | Loại | Nên làm | Nên tránh |
|------|------|---------|-----------|
| Kiến | Hoàng Đạo | Cưới hỏi, Khai trương, Xuất hành | Tang sự |
| Trừ | Hoàng Đạo | Trừ bệnh, Dọn dẹp, Sửa chữa | Cưới hỏi, Nhập trạch |
| Mãn | Hoàng Đạo | Cưới hỏi, Khai trương, An táng | Xuất hành |
| Định | Hoàng Đạo | Cưới hỏi, Nhập trạch, Khai trương | Tang sự, Kiện tụng |
| Chấp | Hoàng Đạo | Nhập trạch, An táng, Sửa chữa | Cưới hỏi, Xuất hành |
| Phá | Hắc Đạo | - | Mọi việc quan trọng |
| Nguy | Hắc Đạo | Săn bắt, Đánh cá | Cưới hỏi, Khai trương |
| Thành | Hoàng Đạo | Cưới hỏi, Khai trương, Xuất hành | - |
| Thâu | Hoàng Đạo | Thu hoạch, Giao dịch | Xuất hành |
| Khai | Hoàng Đạo | Khai trương, Xuất hành | Tang sự, An táng |
| Bế | Hắc Đạo | Nghỉ ngơi, Tu dưỡng | Cưới hỏi, Khai trương |

---

## 3️⃣ AI Chat - Hỏi đáp tử vi

### Tính năng:

- **Chat thời gian thực** với AI được train về tử vi Đông-Tây
- **Tự động context**: AI biết ngày hiện tại, Can Chi, Trực, Sao
- **Multi-turn**: Nhớ lịch sử chat (10 tin nhắn gần nhất)
- **Intent detection**: Tự động phát hiện ý định người dùng
- **Câu hỏi gợi ý**: 4 câu hỏi mẫu cho người mới

### Cách sử dụng:

#### Hỏi về vận mệnh:

```
User: "Hôm nay có may mắn không?"

AI: ✨ Vận mệnh tổng quan: 8/10

🎯 Nên làm:
- Ký hợp đồng kinh doanh (giờ Tỵ 9-11h)
- Giao dịch tài chính

⚠️ Nên tránh:
- Động thổ, xây dựng

🍀 Phong thủy:
- Màu: Xanh
- Số: 3, 7, 12
- Hướng: Đông Nam

💡 Lời khuyên: Hôm nay là ngày Kiến (Hoàng Đạo), tốt cho công việc...
```

#### Hỏi về ngày đẹp:

```
User: "Tuổi Canh Thìn năm 2027 cưới tháng mấy đẹp?"

AI: Phân tích tuổi Canh Thìn (2000) cho năm 2027:

✅ Top 3 tháng đẹp:
1. Tháng 3 (Âm lịch) - Tránh Kim Lâu
2. Tháng 6 - Tháng may mắn
3. Tháng 9 - Tháng hợp tuổi

📅 Ngày cụ thể tháng 3:
- Ngày 5/3 (âm lịch) - Ngày Kiến, Hoàng Đạo
- Ngày 12/3 - Ngày Thành, điểm 95/100
- Ngày 21/3 - Ngày Mãn, tốt cho hôn lễ

⚠️ Lưu ý: Tránh tháng 7 (Hoang Ốc)
```

#### Hỏi về tương hợp:

```
User: "Bạch Dương và Sư Tử có hợp không?"

AI: 💕 Độ hợp: 90/100 - Rất hợp!

**Lý do:**
Cả hai đều là cung Hỏa, năng lượng tương đồng:
- Bạch Dương: Chủ động, đam mê
- Sư Tử: Tự tin, hào phóng

**Ưu điểm:**
✓ Cùng yêu phiêu lưu
✓ Hiểu và tôn trọng nhau
✓ Hỗ trợ tham vọng của nhau

**Lưu ý:**
⚠️ Đều mạnh mẽ → có thể xung đột về quyền lãnh đạo
💡 Giải pháp: Học cách chia sẻ spotlight
```

### System Prompt:

AI được cấu hình với prompt sau:

```
Bạn là chuyên gia tử vi AI kết hợp Đông-Tây.

Kiến thức:
- Phương Đông: Bát tự, Can Chi, Ngũ hành, Tử vi
- Phương Tây: 12 cung hoàng đạo, hành tinh
- Phong thủy: Hướng, màu sắc, số

Cách trả lời:
1. Ngắn gọn, dễ hiểu
2. Dùng emoji, bullet points
3. Lời khuyên cụ thể, có thể áp dụng
4. Tích cực, động viên

Context ngày hiện tại:
- Dương lịch: {currentDate}
- Âm lịch: {lunarDate}
- Can Chi: {canChi}
- Ngày {truc} ({Hoàng Đạo/Hắc Đạo})
- Điểm: {score}/100
- Giờ tốt: {luckyHours}
```

### Kích hoạt AI:

**Hiện tại:** App sẽ có warning nếu chưa config OpenAI API key.

**Để kích hoạt:**

1. Tạo file `.env` trong root directory
2. Thêm:
   ```
   VITE_OPENAI_API_KEY=sk-your-openai-key-here
   ```
3. Restart dev server: `pnpm dev`

**Lưu ý:** Để bảo mật trong production, nên dùng Supabase Edge Function thay vì call trực tiếp từ frontend.

---

## 4️⃣ Tarot - Bói bài

### Tính năng:

- **Chọn 3 lá bài** từ 10 lá Major Arcana
- **3 vị trí**: Quá khứ, Hiện tại, Tương lai
- **Animation mượt**: Card flip effect với Motion
- **Giải bài**: Ý nghĩa từng lá và lời khuyên

### Cách sử dụng:

1. Vào trang Tarot
2. Tập trung vào câu hỏi của bạn
3. Click chọn 3 lá bài (bất kỳ)
4. Nhấn "Giải Bài"
5. Đọc kết quả:
   - **Quá khứ**: Gốc rễ vấn đề
   - **Hiện tại**: Tình trạng hiện tại
   - **Tương lai**: Xu hướng phát triển

### 10 lá Tarot chính:

| Lá | Ý nghĩa | Lời khuyên |
|----|---------|------------|
| The Fool | Khởi đầu mới, phiêu lưu | Dũng cảm bước ra khỏi vùng an toàn |
| The Magician | Sức mạnh, kỹ năng | Sử dụng tài năng của bạn |
| The High Priestess | Trực giác, bí ẩn | Tin vào giác quan thứ sáu |
| The Empress | Sáng tạo, nuôi dưỡng | Chăm sóc bản thân và người khác |
| The Emperor | Quyền lực, ổn định | Thiết lập ranh giới rõ ràng |
| The Lovers | Tình yêu, lựa chọn | Lắng nghe trái tim |
| The Chariot | Ý chí, chiến thắng | Tiến lên với quyết tâm |
| Strength | Can đảm, kiên nhẫn | Dùng lòng tốt thay vì sức mạnh |
| The Hermit | Tự soi, cô độc | Dành thời gian cho nội tâm |
| Wheel of Fortune | Vận may, thay đổi | Chấp nhận sự thay đổi |

### Trong tương lai:

- **AI Tarot**: Giải bài chi tiết bằng AI
- **More cards**: 22 lá Major Arcana đầy đủ + 56 lá Minor Arcana
- **Spreads**: Celtic Cross, Relationship, Career
- **Save history**: Lưu lại các lần bói

---

## 5️⃣ Cá nhân - Thông tin & Bát tự

### Tính năng (Hiện tại):

- **Thông tin cơ bản**: Tên, ngày sinh, giờ sinh, nơi sinh
- **Bát tự & Horoscope**: Cung mệnh, Ngũ hành, Sun/Moon sign
- **Premium upgrade**: Các tính năng cao cấp

### Tính năng (Sau khi nhập thông tin):

#### Bát tự (Tử vi Phương Đông):

```
Ngày sinh: 15/3/2000, 10:30 AM

Can Chi:
- Năm: Canh Thìn (Kim)
- Tháng: Mậu Dần (Thổ)
- Ngày: Quý Hợi (Thủy)
- Giờ: Đinh Tị (Hỏa)

Ngũ hành: Kim (Mệnh Kim)
Cung mệnh: Càn
Con giáp: Thìn (Rồng)
```

#### Natal Chart (Phương Tây):

```
Sun Sign: Pisces (Song Ngư)
Moon Sign: (cần giờ sinh chính xác)
Rising Sign: (cần giờ sinh + nơi sinh)

Element: Water
Quality: Mutable
Ruler: Neptune

Tính cách:
- Nhạy cảm, trực giác
- Nghệ thuật, sáng tạo
- Đồng cảm, từ bi
```

### Cách tính Bát tự:

1. **Năm Can Chi**:
   ```
   Can = THIEN_CAN[(year + 6) % 10]
   Chi = DIA_CHI[(year + 8) % 12]

   Ví dụ: 2000
   Can = THIEN_CAN[(2000 + 6) % 10] = THIEN_CAN[6] = "Canh"
   Chi = DIA_CHI[(2000 + 8) % 12] = DIA_CHI[0] = "Thìn"
   → "Canh Thìn"
   ```

2. **Ngũ hành từ Can**:
   ```
   Giáp, Ất → Mộc
   Bính, Đinh → Hỏa
   Mậu, Kỷ → Thổ
   Canh, Tân → Kim
   Nhâm, Quý → Thủy

   "Canh" → Kim
   ```

3. **Cung mệnh từ năm sinh**:
   ```
   Khảm, Khôn, Chấn, Tốn, Càn, Đoài, Cấn, Ly
   (rotate dựa trên year % 12)
   ```

---

## 🔄 Data Flow - Làm sao app hoạt động?

### 1. User mở app (HomePage):

```
[User] → [HomePage.tsx]
  ↓
[getCurrentLunarDate()] → Chuyển đổi dương → âm
  ↓
[analyzeDay()] → Tính Trực, Tú, Score
  ↓
[Render UI] → Hiển thị vận mệnh
```

### 2. User chọn ngày (CalendarPage):

```
[User clicks day] → [setSelectedDay(day)]
  ↓
[analyzeDay(day)] → Phân tích ngày đó
  ↓
[Display details] → Hiển thị chi tiết
```

### 3. User chat (ChatPage):

```
[User types message] → [handleSend()]
  ↓
[getCurrentContext()] → Lấy ngày, Can Chi, Trực
  ↓
[chatWithAI(message, context)] → Call OpenAI API
  ↓
Build messages array:
  - System prompt + context
  - Chat history (last 10 msgs)
  - Current message
  ↓
[OpenAI API] → GPT-4 response
  ↓
[Display AI reply]
```

### 4. Với Supabase (Production):

```
[Frontend] → [Supabase Edge Function]
  ↓
Edge Function:
  - Get user context
  - Call OpenAI (server-side, API key hidden)
  - Save chat to database
  ↓
[Return response] → [Frontend displays]
```

---

## 🧪 Testing các tính năng

### Test Lunar Calendar:

```bash
# Console trong browser (F12)
import { solarToLunar } from './lib/lunar'

// Test ngày Tết 2000
solarToLunar(5, 2, 2000)
// Expected: { day: 1, month: 1, year: 2000, isLeap: false }

// Test ngày bình thường
solarToLunar(15, 3, 2025)
// Expected: lunar date tương ứng
```

### Test Good Days:

```bash
import { analyzeDay, getGoodDaysInMonth } from './lib/goodDays'

// Phân tích hôm nay
const analysis = analyzeDay(15, 3, 2025)
console.log(analysis.isHoangDao) // true/false
console.log(analysis.goodFor) // ['Cưới hỏi', ...]

// Lấy tất cả ngày đẹp tháng 3/2025
const goodDays = getGoodDaysInMonth(2025, 3)
console.log(goodDays) // [3, 7, 12, ...]
```

### Test AI Chat:

1. Thêm `VITE_OPENAI_API_KEY` vào `.env`
2. Restart: `pnpm dev`
3. Vào trang Chat
4. Hỏi: "Hôm nay có may mắn không?"
5. Kiểm tra response có context ngày hiện tại

---

## 💡 Tips & Tricks

### 1. Hiểu điểm số (Score):

- **90-100**: Ngày cực tốt, làm gì cũng thuận
- **70-89**: Ngày tốt, phù hợp hầu hết việc
- **50-69**: Ngày bình thường, cân nhắc kỹ
- **30-49**: Ngày xấu, tránh việc quan trọng
- **0-29**: Ngày rất xấu, chỉ nên nghỉ ngơi

### 2. Khi nào nên xem Tử vi Đông vs Tây?

- **Phương Đông**: Tốt cho chọn ngày, giờ, hướng, màu sắc cụ thể
- **Phương Tây**: Tốt cho hiểu tính cách, tương hợp tình cảm

### 3. Độ chính xác:

- **Lịch âm**: 100% chính xác (thuật toán chuẩn)
- **12 Trực, 28 Tú**: 100% theo lịch vạn niên truyền thống
- **Bát tự**: Cần giờ sinh chính xác (±15 phút)
- **Horoscope**: Cần giờ + địa điểm sinh cho Rising sign

### 4. Giới hạn hiện tại:

- AI chat cần OpenAI API key (cost $)
- Chưa có authentication (mọi người dùng chung data)
- Chưa lưu lịch sử chat
- Tarot chưa có AI interpret

---

## 📚 Tài liệu tham khảo

- **Lunar Calendar**: [Vietnamese Lunar Calendar Algorithm](https://www.informatik.uni-leipzig.de/~duc/amlich/)
- **12 Trực**: Tra cứu lịch vạn niên truyền thống
- **28 Tú**: Sách "Thiên văn học phương Đông"
- **Astrology**: [Astro.com](https://www.astro.com)
- **OpenAI**: [Platform Docs](https://platform.openai.com/docs)

---

## 🆘 Troubleshooting

**Q: Tại sao AI không trả lời?**  
A: Kiểm tra:
1. Đã thêm `VITE_OPENAI_API_KEY` vào `.env` chưa?
2. API key có hợp lệ không? (bắt đầu bằng `sk-`)
3. Tài khoản OpenAI còn credits không?

**Q: Ngày đẹp có chính xác không?**  
A: Thuật toán dựa trên lịch vạn niên truyền thống, nhưng nên kết hợp thêm:
- Tuổi của người làm chủ
- Hướng nhà/công ty
- Tháng sinh

**Q: Làm sao lưu lịch sử?**  
A: Hiện tại chưa có. Trong Phase 2 sẽ có Supabase để lưu chat history, tarot sessions, etc.

---

**Happy Fortune Telling! 🔮✨**
