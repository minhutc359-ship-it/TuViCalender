# Hướng dẫn Deploy lên Vercel với Supabase

## Bước 1: Chuẩn bị Supabase

### 1.1. Tạo Project Supabase
1. Truy cập [https://supabase.com](https://supabase.com)
2. Đăng ký/Đăng nhập
3. Tạo project mới
4. Lưu lại **Project URL** và **anon/public key**

### 1.2. Tạo Database Schema

Chạy SQL sau trong Supabase SQL Editor:

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Birth profiles table
CREATE TABLE birth_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  birth_date DATE NOT NULL,
  birth_time TIME,
  birth_place TEXT,
  latitude DECIMAL(9, 6),
  longitude DECIMAL(9, 6),
  timezone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Natal charts (Eastern & Western)
CREATE TABLE natal_charts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  birth_profile_id UUID REFERENCES birth_profiles(id) ON DELETE CASCADE,
  chart_type TEXT NOT NULL, -- 'eastern' or 'western'
  chart_data JSONB NOT NULL, -- stores can_chi, ngu_hanh, sun_sign, moon_sign, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily predictions
CREATE TABLE daily_predictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  prediction_date DATE NOT NULL,
  fortune_score INTEGER, -- 0-10
  love_score INTEGER,
  career_score INTEGER,
  health_score INTEGER,
  lucky_color TEXT,
  lucky_numbers TEXT[],
  lucky_direction TEXT,
  lucky_hours TEXT,
  summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, prediction_date)
);

-- Chat histories
CREATE TABLE chat_histories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL, -- 'user' or 'assistant'
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tarot sessions
CREATE TABLE tarot_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  cards_selected INTEGER[] NOT NULL,
  interpretation JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Calendar events (good days)
CREATE TABLE calendar_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'wedding', 'business_opening', 'travel', etc.
  event_date DATE NOT NULL,
  is_good_day BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscriptions
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL, -- 'free', 'premium'
  status TEXT DEFAULT 'active', -- 'active', 'cancelled', 'expired'
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Notifications settings
CREATE TABLE notification_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  daily_horoscope BOOLEAN DEFAULT true,
  hourly_energy BOOLEAN DEFAULT false,
  event_reminders BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE birth_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE natal_charts ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_histories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tarot_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (users can only access their own data)
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own birth profile" ON birth_profiles
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own natal charts" ON natal_charts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM birth_profiles 
      WHERE birth_profiles.id = natal_charts.birth_profile_id 
      AND birth_profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view own predictions" ON daily_predictions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own chat history" ON chat_histories
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own tarot sessions" ON tarot_sessions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own calendar events" ON calendar_events
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own subscription" ON subscriptions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own notification settings" ON notification_settings
  FOR ALL USING (auth.uid() = user_id);
```

## Bước 2: Deploy lên Vercel

### 2.1. Cài đặt Vercel CLI (tùy chọn)
```bash
npm i -g vercel
```

### 2.2. Deploy qua Vercel Dashboard
1. Truy cập [https://vercel.com](https://vercel.com)
2. Đăng nhập và nhấn **Add New Project**
3. Import repository Git của bạn (GitHub/GitLab/Bitbucket)
4. Vercel sẽ tự động nhận diện Vite project

### 2.3. Cấu hình Environment Variables trên Vercel
Trong Vercel Project Settings → Environment Variables, thêm:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_OPENAI_API_KEY=sk-...
```

### 2.4. Deploy
- Nhấn **Deploy**
- Vercel sẽ build và deploy tự động

## Bước 3: Kết nối Frontend với Supabase

### 3.1. Cài đặt Supabase Client
```bash
pnpm add @supabase/supabase-js
```

### 3.2. Tạo Supabase Client
Tạo file `src/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### 3.3. Sử dụng trong Components
```typescript
import { supabase } from '../lib/supabase';

// Lấy daily prediction
const { data, error } = await supabase
  .from('daily_predictions')
  .select('*')
  .eq('user_id', userId)
  .eq('prediction_date', today)
  .single();

// Thêm chat message
await supabase
  .from('chat_histories')
  .insert({ user_id: userId, role: 'user', content: message });
```

## Bước 4: Tích hợp AI (OpenAI hoặc Anthropic)

### 4.1. Với OpenAI
```bash
pnpm add openai
```

```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // chỉ dùng cho demo, production nên dùng backend
});

const response = await openai.chat.completions.create({
  model: 'gpt-4',
  messages: [
    { role: 'system', content: 'Bạn là chuyên gia tử vi và chiêm tinh...' },
    { role: 'user', content: userMessage }
  ]
});
```

### 4.2. Với Anthropic Claude
```bash
pnpm add @anthropic-ai/sdk
```

```typescript
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
  dangerouslyAllowBrowser: true
});

const response = await anthropic.messages.create({
  model: 'claude-3-5-sonnet-20241022',
  max_tokens: 1024,
  messages: [
    { role: 'user', content: userMessage }
  ]
});
```

⚠️ **Lưu ý Bảo mật**: Gọi AI API trực tiếp từ frontend sẽ lộ API key. Trong production, nên:
1. Tạo Supabase Edge Function để gọi AI API
2. Frontend chỉ gọi Edge Function
3. API key chỉ lưu trong Supabase Secrets

## Bước 5: Tối ưu Production

### 5.1. Caching
- Sử dụng React Query hoặc SWR để cache data
- Cache daily predictions

### 5.2. Performance
- Lazy load pages với React.lazy()
- Optimize images
- Minify và compress

### 5.3. SEO
- Thêm meta tags
- Sử dụng React Helmet

### 5.4. Analytics
- Google Analytics
- Vercel Analytics

## Bước 6: Tính năng nâng cao (sau MVP)

### 6.1. Google Calendar Integration
- OAuth2 authentication
- Sync events với lịch đẹp

### 6.2. Push Notifications
- Firebase Cloud Messaging
- Gửi thông báo daily horoscope

### 6.3. Payment Integration (Premium)
- Stripe hoặc PayPal
- Quản lý subscriptions

### 6.4. AI Image Generation
- DALL-E hoặc Stable Diffusion API
- Generate aura/zodiac images

## Troubleshooting

### Build fails trên Vercel
- Kiểm tra Node version trong Vercel settings
- Đảm bảo tất cả dependencies đã được install

### Environment variables không hoạt động
- Phải có prefix `VITE_` cho Vite
- Restart development server sau khi thêm env vars

### CORS errors với Supabase
- Kiểm tra Row Level Security policies
- Xác nhận đã enable authentication nếu cần

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [OpenAI API](https://platform.openai.com/docs)
- [Anthropic API](https://docs.anthropic.com)
