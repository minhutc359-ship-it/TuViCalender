# 🏗️ Kiến trúc & Cơ chế hoạt động của AstroAI

## 📋 Mục lục

1. [Tổng quan hệ thống](#tổng-quan-hệ-thống)
2. [Kiến trúc Frontend](#kiến-trúc-frontend)
3. [Kiến trúc Backend](#kiến-trúc-backend)
4. [Cơ chế tính toán Tử vi](#cơ-chế-tính-toán-tử-vi)
5. [Cơ chế AI Chat](#cơ-chế-ai-chat)
6. [Cơ chế chọn ngày đẹp](#cơ-chế-chọn-ngày-đẹp)
7. [Data Flow](#data-flow)
8. [Security & Authentication](#security--authentication)

---

## 1. Tổng quan hệ thống

### Sơ đồ kiến trúc

```
┌─────────────────────────────────────────────────────────────┐
│                        USER INTERFACE                        │
│  (React + TypeScript + Tailwind + Motion)                   │
│                                                              │
│  ┌─────────┐  ┌─────────┐  ┌──────┐  ┌───────┐  ┌────────┐│
│  │  Home   │  │Calendar │  │ Chat │  │Tarot  │  │Profile ││
│  └─────────┘  └─────────┘  └──────┘  └───────┘  └────────┘│
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                   APPLICATION LAYER                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Supabase     │  │ AI Service   │  │ Lunar        │     │
│  │ Client       │  │ (OpenAI)     │  │ Calculator   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                      DATA LAYER                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Supabase PostgreSQL                      │  │
│  │  - Users                - Daily Predictions           │  │
│  │  - Birth Profiles       - Chat Histories              │  │
│  │  - Natal Charts         - Tarot Sessions              │  │
│  │  - Calendar Events      - Subscriptions               │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Supabase Edge Functions                  │  │
│  │  - AI Chat Handler                                    │  │
│  │  - Lunar Calendar Calculator                          │  │
│  │  - Good Days Finder                                   │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Kiến trúc Frontend

### 2.1. Component Structure

```
src/
├── app/
│   ├── App.tsx                 # Root component với routing
│   ├── pages/                  # Page components
│   │   ├── HomePage.tsx        # Daily horoscope dashboard
│   │   ├── CalendarPage.tsx    # Good days calendar
│   │   ├── ChatPage.tsx        # AI chat interface
│   │   ├── TarotPage.tsx       # Tarot reading
│   │   └── ProfilePage.tsx     # User profile
│   └── components/             # Reusable components
│       ├── auth/
│       │   ├── LoginForm.tsx
│       │   └── SignUpForm.tsx
│       ├── calendar/
│       │   ├── CalendarGrid.tsx
│       │   └── EventSelector.tsx
│       └── chat/
│           ├── MessageBubble.tsx
│           └── QuickQuestions.tsx
├── lib/
│   ├── supabase.ts            # Supabase client & helpers
│   ├── openai.ts              # OpenAI client & prompts
│   ├── lunar.ts               # Lunar calendar calculations
│   ├── astrology.ts           # Astrology calculations
│   └── goodDays.ts            # Good days algorithm
└── utils/
    ├── date.ts                # Date utilities
    └── constants.ts           # App constants
```

### 2.2. Routing Strategy

Sử dụng **React Router v7** với client-side routing:

```typescript
<BrowserRouter>
  <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/calendar" element={<CalendarPage />} />
    <Route path="/chat" element={<ChatPage />} />
    <Route path="/tarot" element={<TarotPage />} />
    <Route path="/profile" element={<ProfilePage />} />
  </Routes>
</BrowserRouter>
```

**Bottom Navigation** sticky để dễ dàng chuyển đổi giữa các pages.

### 2.3. State Management

- **Local State**: `useState` cho UI state
- **Server State**: Supabase Realtime + React hooks
- **Auth State**: Supabase Auth listener

```typescript
// Example: Subscribe to daily prediction updates
useEffect(() => {
  const subscription = supabase
    .channel('daily_predictions')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'daily_predictions' },
      (payload) => {
        // Update UI khi có prediction mới
      }
    )
    .subscribe();

  return () => subscription.unsubscribe();
}, []);
```

---

## 3. Kiến trúc Backend

### 3.1. Supabase Services

#### PostgreSQL Database
- **Row Level Security (RLS)**: Mỗi user chỉ thấy data của mình
- **Foreign Keys**: Đảm bảo data integrity
- **Indexes**: Optimize query performance

#### Supabase Auth
- Email/Password authentication
- Session management
- JWT tokens

#### Supabase Edge Functions (Deno)
Chạy server-side logic:

```typescript
// supabase/functions/chat-ai/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { OpenAI } from 'https://esm.sh/openai@4.20.1'

serve(async (req) => {
  const { message, userId } = await req.json()
  
  const openai = new OpenAI({
    apiKey: Deno.env.get('OPENAI_API_KEY')
  })
  
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: ASTROLOGY_SYSTEM_PROMPT },
      { role: 'user', content: message }
    ]
  })
  
  return new Response(JSON.stringify({ reply: response.choices[0].message.content }))
})
```

### 3.2. Database Schema Deep Dive

#### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  subscription_tier TEXT DEFAULT 'free', -- 'free', 'premium'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Birth Profiles Table
Lưu thông tin sinh để tính toán:

```sql
CREATE TABLE birth_profiles (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  birth_date DATE NOT NULL,        -- Ngày sinh dương lịch
  birth_time TIME,                 -- Giờ sinh
  birth_place TEXT,                -- Nơi sinh (text)
  latitude DECIMAL(9, 6),          -- Vĩ độ (cho astrology)
  longitude DECIMAL(9, 6),         -- Kinh độ
  timezone TEXT,                   -- Timezone (Asia/Ho_Chi_Minh)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Natal Charts Table
Lưu kết quả tính toán (cache):

```sql
CREATE TABLE natal_charts (
  id UUID PRIMARY KEY,
  birth_profile_id UUID REFERENCES birth_profiles(id),
  chart_type TEXT NOT NULL,        -- 'eastern' hoặc 'western'
  chart_data JSONB NOT NULL,       -- JSON chứa kết quả
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Eastern chart_data structure:**
```json
{
  "can_chi": {
    "nam": "Canh Thìn",
    "thang": "Mậu Dần",
    "ngay": "Quý Hợi",
    "gio": "Giáp Tý"
  },
  "ngu_hanh": "Kim",
  "cung_menh": "Càn",
  "bat_tu": {
    "year_pillar": { "stem": "Canh", "branch": "Thìn" },
    "month_pillar": { "stem": "Mậu", "branch": "Dần" },
    "day_pillar": { "stem": "Quý", "branch": "Hợi" },
    "hour_pillar": { "stem": "Giáp", "branch": "Tý" }
  }
}
```

**Western chart_data structure:**
```json
{
  "sun_sign": "Aries",
  "moon_sign": "Taurus",
  "rising_sign": "Gemini",
  "planets": {
    "mercury": { "sign": "Aries", "degree": 15.3 },
    "venus": { "sign": "Pisces", "degree": 28.7 }
  }
}
```

---

## 4. Cơ chế tính toán Tử vi

### 4.1. Lunar Calendar Conversion

**Thuật toán chuyển đổi Dương lịch → Âm lịch:**

```typescript
export function solarToLunar(
  day: number, 
  month: number, 
  year: number
): LunarDate {
  // 1. Tính Julian Day Number
  const jd = getJulianDayNumber(day, month, year)
  
  // 2. Tìm new moon (sóc) gần nhất
  const k = Math.floor((jd - 2415021.076998695) / 29.530588853 + 0.5)
  const newMoon = getNewMoonDay(k, 7) // timezone UTC+7
  
  // 3. Tính tháng âm lịch
  let lunarMonth = Math.floor((k + 0.5) % 12) + 1
  
  // 4. Tính năm âm lịch (có xử lý tháng nhuận)
  // ... logic phức tạp
  
  return { day: lunarDay, month: lunarMonth, year: lunarYear, isLeap }
}
```

**Công thức New Moon:**
- Sử dụng **Meeus algorithm** (Jean Meeus - Astronomical Algorithms)
- Độ chính xác: ±0.5 ngày

### 4.2. Can Chi Calculation

**10 Thiên Can:**
```
Giáp, Ất, Bính, Đinh, Mậu, Kỷ, Canh, Tân, Nhâm, Quý
```

**12 Địa Chi:**
```
Tý, Sửu, Dần, Mão, Thìn, Tị, Ngọ, Mùi, Thân, Dậu, Tuất, Hợi
```

**Công thức:**
```typescript
export function getCanChi(lunarYear: number): string {
  const can = THIEN_CAN[(lunarYear + 6) % 10]
  const chi = DIA_CHI[(lunarYear + 8) % 12]
  return `${can} ${chi}`
}

// Ví dụ: 2000 → (2000 + 6) % 10 = 6 → Canh
//        2000 → (2000 + 8) % 12 = 0 → Thìn
//        → "Canh Thìn"
```

### 4.3. Ngũ Hành (Five Elements)

**Mapping Can → Ngũ Hành:**
```typescript
const NGU_HANH_MAP = {
  'Giáp': 'Mộc',  'Ất': 'Mộc',
  'Bính': 'Hỏa',  'Đinh': 'Hỏa',
  'Mậu': 'Thổ',   'Kỷ': 'Thổ',
  'Canh': 'Kim',  'Tân': 'Kim',
  'Nhâm': 'Thủy', 'Quý': 'Thủy'
}
```

**Sinh Khắc:**
```
Sinh: Mộc → Hỏa → Thổ → Kim → Thủy → Mộc
Khắc: Mộc → Thổ → Thủy → Hỏa → Kim → Mộc
```

### 4.4. Western Astrology Calculation

**Sun Sign (Cung Hoàng Đạo):**
```typescript
export function getSunSign(day: number, month: number): ZodiacSign {
  const dateKey = month * 100 + day
  
  if (dateKey >= 321 && dateKey <= 419) return 'Aries'
  if (dateKey >= 420 && dateKey <= 520) return 'Taurus'
  // ... 12 cung
}
```

**Moon Sign & Rising Sign:**
- Cần **birth time** chính xác
- Sử dụng **Swiss Ephemeris** library hoặc API
- Tính toán vị trí thiên thể tại thời điểm sinh

---

## 5. Cơ chế AI Chat

### 5.1. System Prompt Engineering

```typescript
const SYSTEM_PROMPT = `
Bạn là chuyên gia tử vi và chiêm tinh, kết hợp kiến thức phương Đông và phương Tây.

Kiến thức của bạn:
- Tử vi Phương Đông: Bát tự, Can Chi, Ngũ hành, Tử vi đẩu số
- Chiêm tinh Phương Tây: 12 cung hoàng đạo, hành tinh, aspects
- Phong thủy: Hướng nhà, màu sắc, số may mắn
- Lịch vạn niên: Ngày hoàng đạo, giờ đẹp

Cách trả lời:
1. Ngắn gọn, dễ hiểu, tránh thuật ngữ khó
2. Chia thành các mục rõ ràng
3. Đưa ra lời khuyên cụ thể, có thể áp dụng
4. Kết hợp cả Đông và Tây nếu phù hợp

Ví dụ câu trả lời tốt:
"Hôm nay là ngày Canh Thìn, thuộc Kim. Đây là ngày tốt cho:
✓ Ký hợp đồng kinh doanh
✓ Mua sắm vàng bạc
✗ Tránh động thổ, khai trương

Giờ đẹp: 9-11h (giờ Tỵ) - giờ Hỏa sinh Kim
Màu may mắn: Trắng, Vàng kim
Hướng tốt: Tây, Tây Bắc"
`
```

### 5.2. RAG (Retrieval Augmented Generation)

**Optional enhancement:**

```typescript
// 1. Embed văn bản tử vi vào vector DB (Supabase pgvector)
const embedding = await openai.embeddings.create({
  model: 'text-embedding-3-small',
  input: astroText
})

await supabase.from('astro_knowledge').insert({
  content: astroText,
  embedding: embedding.data[0].embedding
})

// 2. Khi user hỏi, tìm kiếm context liên quan
const queryEmbedding = await openai.embeddings.create({
  input: userQuestion
})

const { data } = await supabase.rpc('match_astro_knowledge', {
  query_embedding: queryEmbedding,
  match_threshold: 0.7,
  match_count: 3
})

// 3. Thêm context vào prompt
const contextPrompt = `
Kiến thức tham khảo:
${data.map(d => d.content).join('\n\n')}

Câu hỏi: ${userQuestion}
`
```

### 5.3. Intent Detection

**Phân loại intent để routing:**

```typescript
enum UserIntent {
  DAILY_FORTUNE = 'daily_fortune',        // "Hôm nay vận mệnh thế nào?"
  GOOD_DAY_FINDER = 'good_day_finder',    // "Tháng này cưới ngày nào đẹp?"
  COMPATIBILITY = 'compatibility',         // "Tôi hợp với tuổi nào?"
  CAREER_ADVICE = 'career_advice',        // "Công việc có thuận lợi không?"
  LOVE_READING = 'love_reading',          // "Tình duyên ra sao?"
  GENERAL_QUESTION = 'general'
}

async function detectIntent(message: string): Promise<UserIntent> {
  // Simple keyword matching
  if (/hôm nay|ngày nay/i.test(message)) {
    return UserIntent.DAILY_FORTUNE
  }
  
  if (/ngày đẹp|ngày tốt|cưới|khai trương/i.test(message)) {
    return UserIntent.GOOD_DAY_FINDER
  }
  
  // Hoặc dùng AI classification
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{
      role: 'system',
      content: 'Classify user intent into: daily_fortune, good_day_finder, ...'
    }, {
      role: 'user',
      content: message
    }]
  })
  
  return response.choices[0].message.content as UserIntent
}
```

---

## 6. Cơ chế chọn ngày đẹp

### 6.1. Ngày Hoàng Đạo vs Hắc Đạo

**12 Trực (12 Day Officers):**
```typescript
const TRUC = [
  'Kiến',   // +++  Rất tốt
  'Trừ',    // +    Tốt
  'Mãn',    // ++   Rất tốt
  'Bình',   // +    Trung bình
  'Định',   // +++  Rất tốt
  'Chấp',   // +    Tốt
  'Phá',    // ---  Rất xấu (Hắc Đạo)
  'Nguy',   // --   Xấu (Hắc Đạo)
  'Thành',  // +++  Rất tốt
  'Thâu',   // +    Tốt
  'Khai',   // ++   Rất tốt
  'Bế'      // --   Xấu (Hắc Đạo)
]

const HOANG_DAO = ['Kiến', 'Trừ', 'Mãn', 'Định', 'Chấp', 'Thành', 'Khai']
const HAC_DAO = ['Phá', 'Nguy', 'Bế']
```

**Công thức tính Trực:**
```typescript
function getTruc(lunarDay: number, lunarMonth: number): string {
  const index = (lunarMonth + lunarDay - 2) % 12
  return TRUC[index]
}
```

### 6.2. 28 Tú (Lunar Mansions)

**28 Sao:**
```
Giác, Càng, Đê, Phòng, Tâm, Vĩ, Kỉ (Đông - Thanh Long)
Đấu, Ngưu, Nữ, Hư, Nguy, Thất, Bích (Bắc - Huyền Vũ)
Khuê, Lâu, Vị, Mão, Tất, Chủy, Sâm (Tây - Bạch Hổ)
Tỉnh, Quỷ, Liễu, Tinh, Trương, Dực, Chẩn (Nam - Chu Tước)
```

**Tốt xấu:**
```typescript
const TU_TOT = ['Giác', 'Đê', 'Phòng', 'Tâm', 'Vĩ', ...]
const TU_XAU = ['Càng', 'Kỉ', 'Nguy', 'Thất', ...]
```

### 6.3. Sao Tốt / Sao Xấu trong ngày

**Tính toán:**
```typescript
interface DayAnalysis {
  truc: string
  isHoangDao: boolean
  tu: string
  saoTot: string[]      // ["Thiên Đức", "Nguyệt Đức", ...]
  saoXau: string[]      // ["Thần Thất", "Tử Khí", ...]
  viecNenLam: string[]  // ["Cưới hỏi", "Khai trương", ...]
  viecNenTranh: string[]// ["Động thổ", "An táng", ...]
}

function analyzeLunarDay(lunarDate: LunarDate): DayAnalysis {
  const truc = getTruc(lunarDate.day, lunarDate.month)
  const tu = getTu(lunarDate)
  const saoTot = getGoodStars(lunarDate)
  const saoXau = getBadStars(lunarDate)
  
  return {
    truc,
    isHoangDao: HOANG_DAO.includes(truc),
    tu,
    saoTot,
    saoXau,
    viecNenLam: getGoodActivities(truc, tu, saoTot),
    viecNenTranh: getBadActivities(truc, tu, saoXau)
  }
}
```

### 6.4. Chọn ngày theo tuổi

**Kim Lâu, Hoang Ốc, Tam Tai:**
```typescript
function isGoodDayForAge(
  lunarDate: LunarDate,
  birthYear: number
): { isGood: boolean, reason: string } {
  
  const age = getCurrentLunarYear() - birthYear + 1
  const chi = getDiaChi(birthYear)
  
  // Kiểm tra Kim Lâu
  if (isKimLau(lunarDate, chi)) {
    return { isGood: false, reason: 'Phạm Kim Lâu' }
  }
  
  // Kiểm tra Hoang Ốc
  if (isHoangOc(lunarDate, chi)) {
    return { isGood: false, reason: 'Phạm Hoang Ốc' }
  }
  
  // Kiểm tra Tam Tai
  if (isTamTai(age)) {
    // Trong Tam Tai thì tránh những ngày nhất định
    if (isBadDayInTamTai(lunarDate, chi)) {
      return { isGood: false, reason: 'Trong Tam Tai' }
    }
  }
  
  return { isGood: true, reason: 'Ngày tốt' }
}
```

### 6.5. Algorithm chọn ngày cưới

```typescript
async function findBestWeddingDays(
  birthYear: number,
  month: string,      // "2027-05"
  limit: number = 5
): Promise<WeddingDay[]> {
  
  const days = getDaysInMonth(month)
  const results: WeddingDay[] = []
  
  for (const day of days) {
    const lunar = solarToLunar(day.day, day.month, day.year)
    const analysis = analyzeLunarDay(lunar)
    const ageCheck = isGoodDayForAge(lunar, birthYear)
    
    // Scoring system
    let score = 0
    
    // +50 nếu là Hoàng Đạo
    if (analysis.isHoangDao) score += 50
    
    // +30 nếu có Sao tốt
    score += analysis.saoTot.length * 10
    
    // -40 nếu có Sao xấu
    score -= analysis.saoXau.length * 10
    
    // +20 nếu "Cưới hỏi" trong việc nên làm
    if (analysis.viecNenLam.includes('Cưới hỏi')) score += 20
    
    // -100 nếu phạm Kim Lâu, Hoang Ốc
    if (!ageCheck.isGood) score -= 100
    
    // Chỉ lấy ngày score > 50
    if (score > 50) {
      results.push({ ...day, lunar, analysis, score })
    }
  }
  
  // Sort by score và return top N
  return results.sort((a, b) => b.score - a.score).slice(0, limit)
}
```

---

## 7. Data Flow

### 7.1. User Registration Flow

```
User Input (email, password, birth info)
    ↓
Frontend validates
    ↓
Supabase Auth.signUp()
    ↓
Create user record in `users` table (trigger)
    ↓
Create birth_profile record
    ↓
Trigger Edge Function to calculate natal chart
    ↓
Store result in `natal_charts` table
    ↓
Return to frontend → Redirect to Home
```

### 7.2. Daily Prediction Flow

```
Cron Job (every day 00:00 UTC+7)
    ↓
Supabase Edge Function triggered
    ↓
For each user:
  - Get birth_profile
  - Get current date lunar data
  - Calculate compatibility
  - Call AI to generate prediction
  - Insert into daily_predictions
    ↓
Push notification to user (optional)
    ↓
User opens app → Fetch today's prediction
```

### 7.3. Chat Flow

```
User types message
    ↓
Frontend sends to Supabase Edge Function
    ↓
Edge Function:
  - Detect intent
  - Get user context (birth info, natal chart)
  - Construct prompt with context
  - Call OpenAI API
  - Parse response
    ↓
Save chat to chat_histories
    ↓
Return to frontend → Display
```

---

## 8. Security & Authentication

### 8.1. Row Level Security (RLS) Policies

```sql
-- Users can only see their own data
CREATE POLICY "Users own data" ON users
  FOR ALL USING (auth.uid() = id);

-- Birth profiles
CREATE POLICY "Users own birth profiles" ON birth_profiles
  FOR ALL USING (auth.uid() = user_id);

-- Chat histories  
CREATE POLICY "Users own chat" ON chat_histories
  FOR ALL USING (auth.uid() = user_id);
```

### 8.2. API Key Protection

**❌ BAD (exposes key):**
```typescript
// Frontend code
const openai = new OpenAI({
  apiKey: 'sk-xxx',
  dangerouslyAllowBrowser: true
})
```

**✅ GOOD (hidden in Edge Function):**
```typescript
// Frontend
const response = await supabase.functions.invoke('chat-ai', {
  body: { message: userMessage }
})

// Supabase Edge Function
const openai = new OpenAI({
  apiKey: Deno.env.get('OPENAI_API_KEY') // Server-side only
})
```

### 8.3. Rate Limiting

```typescript
// Supabase Edge Function
const userId = req.headers.get('user-id')
const rateLimit = await checkRateLimit(userId, 'chat', {
  free: 10,      // 10 messages/day for free tier
  premium: 100   // 100 messages/day for premium
})

if (!rateLimit.allowed) {
  return new Response('Rate limit exceeded', { status: 429 })
}
```

---

## 9. Performance Optimization

### 9.1. Caching Strategy

```typescript
// Cache daily predictions (valid for 24h)
const cacheKey = `prediction:${userId}:${today}`
let prediction = await redis.get(cacheKey)

if (!prediction) {
  prediction = await generatePrediction(userId, today)
  await redis.set(cacheKey, prediction, { ex: 86400 }) // 24h
}
```

### 9.2. Lazy Loading

```typescript
// Code splitting
const TarotPage = lazy(() => import('./pages/TarotPage'))
const ChatPage = lazy(() => import('./pages/ChatPage'))

<Suspense fallback={<Loading />}>
  <Routes>
    <Route path="/tarot" element={<TarotPage />} />
    <Route path="/chat" element={<ChatPage />} />
  </Routes>
</Suspense>
```

---

## 10. Testing Strategy

### 10.1. Unit Tests

```typescript
// lunar.test.ts
describe('Lunar Calendar', () => {
  it('should convert solar to lunar correctly', () => {
    const result = solarToLunar(1, 1, 2000)
    expect(result).toEqual({ day: 25, month: 11, year: 1999 })
  })
})
```

### 10.2. Integration Tests

```typescript
// supabase.test.ts
describe('Supabase Integration', () => {
  it('should save and retrieve chat history', async () => {
    await saveChatMessage(userId, 'user', 'Hello')
    const history = await getChatHistory(userId)
    expect(history).toHaveLength(1)
  })
})
```

---

## 11. Deployment Pipeline

```
Code Push to GitHub
    ↓
Vercel detects change
    ↓
Install dependencies (pnpm install)
    ↓
Build (pnpm build)
    ↓
Deploy to CDN
    ↓
Invalidate cache
    ↓
Live! 🎉
```

**Environment Variables** trong Vercel:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_OPENAI_API_KEY` (nếu call direct, không khuyến khích)

**Supabase Edge Functions** deploy riêng:
```bash
supabase functions deploy chat-ai
```

---

## 12. Monitoring & Analytics

### 12.1. Error Tracking

```typescript
// Sentry integration
import * as Sentry from '@sentry/react'

Sentry.init({
  dsn: 'your-sentry-dsn',
  integrations: [new Sentry.BrowserTracing()],
  tracesSampleRate: 1.0
})
```

### 12.2. Analytics

```typescript
// Vercel Analytics
import { Analytics } from '@vercel/analytics/react'

function App() {
  return (
    <>
      <YourApp />
      <Analytics />
    </>
  )
}
```

---

## 13. Future Enhancements

1. **Real-time Notifications**
   - Firebase Cloud Messaging
   - Web Push API

2. **Offline Support**
   - Service Workers
   - IndexedDB cache

3. **Multi-language**
   - i18n support
   - English, Vietnamese, Chinese

4. **AI Image Generation**
   - DALL-E integration
   - Generate zodiac artwork

5. **Voice Chat**
   - Whisper API for speech-to-text
   - Text-to-speech for responses

6. **Social Features**
   - Share predictions
   - Friend compatibility
   - Community forum

---

## 📚 References

- [Vietnamese Lunar Calendar Algorithm](https://www.informatik.uni-leipzig.de/~duc/amlich/)
- [Swiss Ephemeris](https://www.astro.com/swisseph/)
- [OpenAI API Docs](https://platform.openai.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [React Router](https://reactrouter.com)
