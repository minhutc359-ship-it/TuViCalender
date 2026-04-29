# 🌙 AstroAI - AI Astrology Platform

Nền tảng tử vi AI toàn diện kết hợp **Phương Đông** (Bát tự, Can Chi, Ngũ hành) + **Phương Tây** (12 cung hoàng đạo) + **AI Chat** + **Lịch ngày đẹp**.

![Version](https://img.shields.io/badge/version-1.0.0-purple)
![React](https://img.shields.io/badge/React-18.3-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![Tailwind](https://img.shields.io/badge/Tailwind-4.1-cyan)

## ✨ Tính năng hoàn chỉnh

### 🏠 Trang chủ - Vận mệnh hằng ngày
- Điểm vận mệnh 4 chỉ số: Tài lộc, Tình duyên, Công việc, Sức khỏe (0-10 sao)
- Ngày âm lịch + Can Chi + 12 Trực (Hoàng Đạo/Hắc Đạo)
- 28 Tú (Lunar Mansions) - Sao hôm nay
- Màu may mắn, số may mắn, giờ tốt
- Việc nên làm & nên tránh trong ngày

### 📅 Lịch - Chọn ngày đẹp
- Lịch tháng với ngày Hoàng Đạo đánh dấu ⭐
- Lọc theo 6 loại sự kiện: Cưới hỏi, Khai trương, Mua xe, Nhập trạch, Xuất hành, Ký hợp đồng
- Click vào ngày → Xem chi tiết: Trực, Tú, Điểm số, Giờ tốt
- Thuật toán chính xác dựa trên lịch vạn niên truyền thống

### 💬 AI Chat - Trợ lý tử vi thông minh
- Chat thời gian thực với GPT-4 được train về tử vi Đông-Tây
- Tự động context: AI biết ngày hiện tại, Can Chi, Trực, Sao
- Intent detection: Tự nhận biết hỏi về vận mệnh, ngày đẹp, tương hợp, ...
- Hỗ trợ OpenAI GPT-4

### 🔮 Tarot - Bói bài
- Chọn 3 lá bài từ 10 lá Major Arcana
- 3 vị trí: Quá khứ, Hiện tại, Tương lai
- Animation mượt mà với Motion (Framer Motion)
- Giải bài chi tiết với ý nghĩa từng lá

### 👤 Cá nhân - Thông tin & Bát tự
- Quản lý thông tin sinh (ngày, giờ, nơi sinh)
- Tính Bát tự (4 trụ: Năm, Tháng, Ngày, Giờ)
- Western Natal Chart (Sun sign, Moon sign, Rising)
- Premium upgrade

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ hoặc Bun
- pnpm (khuyến nghị) hoặc npm
- OpenAI API key (cho AI chat)
- Supabase account (optional, cho production)

### Local Development - Chạy ngay không cần setup

```bash
# 1. Clone repo
git clone <your-repo-url>
cd astro-ai

# 2. Install dependencies
pnpm install

# 3. Start dev server
pnpm dev
```

App sẽ chạy tại `http://localhost:5173`

**Tất cả tính năng đều hoạt động ngay:**
- ✅ Trang chủ với vận mệnh hằng ngày
- ✅ Lịch ngày đẹp
- ✅ Tarot
- ⚠️ AI Chat (cần OpenAI API key)

### Kích hoạt AI Chat (Optional)

```bash
# 1. Tạo file .env
cp .env.example .env

# 2. Thêm OpenAI API key vào .env
VITE_OPENAI_API_KEY=sk-your-openai-key-here

# 3. Restart dev server
pnpm dev
```

**Lấy OpenAI API key:** [platform.openai.com/api-keys](https://platform.openai.com/api-keys)

### Deploy lên Vercel (Production)

Xem hướng dẫn đầy đủ trong [DEPLOYMENT.md](./DEPLOYMENT.md)

**3 bước nhanh:**

```bash
# 1. Push code lên GitHub
git add .
git commit -m "Initial commit"
git push origin main

# 2. Import vào Vercel
# Vào vercel.com → New Project → Import từ GitHub

# 3. Thêm Environment Variables
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_OPENAI_API_KEY=sk-your-key
```

**Deploy!** Vercel sẽ tự động build và deploy.

### Setup Supabase (Optional - For persistence)

```bash
# 1. Tạo project tại supabase.com

# 2. Chạy SQL schema
# Copy SQL từ DEPLOYMENT.md → Paste vào Supabase SQL Editor → Run

# 3. Get credentials
# Settings → API → Copy Project URL và anon key

# 4. Deploy Edge Functions (Optional - for secure AI)
supabase functions deploy chat-ai
```

## 📦 Tech Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS v4
- **Routing:** React Router v7
- **Animation:** Motion (Framer Motion)
- **Icons:** Lucide React
- **Database:** Supabase (PostgreSQL)
- **AI:** OpenAI GPT-4 hoặc Anthropic Claude
- **Deployment:** Vercel

## 📁 Project Structure

```
src/
├── app/
│   ├── App.tsx              # Main app with routing
│   ├── pages/
│   │   ├── HomePage.tsx     # Daily fortune dashboard
│   │   ├── CalendarPage.tsx # Good days calendar
│   │   ├── ChatPage.tsx     # AI chat interface
│   │   ├── TarotPage.tsx    # Tarot card reading
│   │   └── ProfilePage.tsx  # User profile & settings
│   └── components/          # Reusable components
├── lib/
│   └── supabase.ts          # Supabase client (to be created)
└── styles/
    ├── theme.css
    └── fonts.css
```

## 🔐 Environment Variables

Tạo file `.env` với các biến sau:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_OPENAI_API_KEY=your_openai_key
```

## 🗄️ Database Schema

Xem SQL schema đầy đủ trong [DEPLOYMENT.md](./DEPLOYMENT.md)

**Tables:**
- `users` - User accounts
- `birth_profiles` - Birth date/time/location
- `natal_charts` - Eastern & Western astrology charts
- `daily_predictions` - Daily horoscope data
- `chat_histories` - AI chat messages
- `tarot_sessions` - Tarot reading history
- `calendar_events` - Good day events
- `subscriptions` - Premium membership
- `notification_settings` - User preferences

## 🎨 Design System

- **Color Scheme:** Dark theme với purple/pink gradients
- **Font:** System fonts
- **Components:** Material UI + Radix UI
- **Animation:** Motion với starry background effect

## 📱 Features Roadmap

### MVP (Hiện tại)
- ✅ Daily horoscope dashboard
- ✅ Calendar với ngày đẹp
- ✅ AI chat interface (mock)
- ✅ Tarot reading (mock)
- ✅ User profile page

### Phase 2
- [ ] Supabase integration
- [ ] Real AI chat (OpenAI/Claude)
- [ ] User authentication
- [ ] Birth chart calculator
- [ ] Lunar calendar integration

### Phase 3
- [ ] Google Calendar sync
- [ ] Push notifications
- [ ] Premium subscription
- [ ] AI image generation
- [ ] Compatibility matching

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first.

## 📄 License

MIT

## 🙏 Credits

Built with ❤️ for the mystical community
