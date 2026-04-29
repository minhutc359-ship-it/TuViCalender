# ✅ Checklist Deploy Vercel + Supabase

## 🗄️ Supabase Setup

- [ ] Đăng ký/Đăng nhập [Supabase](https://supabase.com)
- [ ] Tạo project mới
- [ ] Copy SQL schema từ `DEPLOYMENT.md` và chạy trong SQL Editor
- [ ] Lấy **Project URL** (Settings → API)
- [ ] Lấy **anon/public key** (Settings → API)
- [ ] (Tùy chọn) Enable Authentication nếu cần đăng nhập user

## 🔑 API Keys

- [ ] Đăng ký OpenAI tại [platform.openai.com](https://platform.openai.com)
  - Tạo API key
  - Nạp credits ($5-10 cho testing)
  
  **HOẶC**
  
- [ ] Đăng ký Anthropic tại [console.anthropic.com](https://console.anthropic.com)
  - Tạo API key
  - Nạp credits

## 🚀 Vercel Deployment

- [ ] Push code lên GitHub/GitLab/Bitbucket
- [ ] Đăng nhập [Vercel](https://vercel.com)
- [ ] Import repository
- [ ] Thêm Environment Variables:
  - `VITE_SUPABASE_URL` = your_project_url
  - `VITE_SUPABASE_ANON_KEY` = your_anon_key
  - `VITE_OPENAI_API_KEY` = sk-... (hoặc)
  - `VITE_ANTHROPIC_API_KEY` = sk-ant-...
- [ ] Deploy!

## 🔧 Post-Deployment

- [ ] Test app trên Vercel URL
- [ ] Kiểm tra Console không có errors
- [ ] Test các tính năng:
  - [ ] Navigation giữa các pages
  - [ ] Responsive trên mobile
  - [ ] Dark theme hiển thị đúng

## 📦 Tích hợp Supabase vào Code

- [ ] Cài đặt Supabase client: `pnpm add @supabase/supabase-js`
- [ ] Uncomment code trong `src/lib/supabase.ts`
- [ ] Update các pages để fetch data từ Supabase
- [ ] Test local trước khi deploy

## 🤖 Tích hợp AI

### OpenAI
- [ ] `pnpm add openai`
- [ ] Import và setup trong `ChatPage.tsx`
- [ ] Test AI responses

### Anthropic
- [ ] `pnpm add @anthropic-ai/sdk`
- [ ] Import và setup trong `ChatPage.tsx`
- [ ] Test AI responses

⚠️ **Lưu ý**: Gọi AI trực tiếp từ frontend sẽ lộ API key. Nên dùng Supabase Edge Functions cho production.

## 🔐 Bảo mật (Production)

- [ ] Tạo Supabase Edge Function cho AI calls
- [ ] Move API keys to Supabase Secrets
- [ ] Enable Row Level Security policies
- [ ] Setup user authentication
- [ ] Rate limiting cho AI requests

## 🎯 Performance Optimization

- [ ] Add React Query/SWR cho data caching
- [ ] Lazy load pages
- [ ] Optimize images
- [ ] Enable Vercel Analytics

## 📱 Next Features

- [ ] Google Calendar sync
- [ ] Push notifications (Firebase)
- [ ] Payment integration (Stripe)
- [ ] AI image generation
- [ ] Lunar calendar calculations

---

## ⚡ Quick Commands

```bash
# Local development
pnpm dev

# Build for production
pnpm build

# Deploy to Vercel (with Vercel CLI)
vercel

# Install Supabase client
pnpm add @supabase/supabase-js

# Install AI SDK
pnpm add openai
# OR
pnpm add @anthropic-ai/sdk
```

## 🆘 Troubleshooting

**Build fails on Vercel?**
- Kiểm tra Node version (Settings → General → Node.js Version)
- Đảm bảo dependencies trong package.json đầy đủ

**Environment variables không hoạt động?**
- Phải có prefix `VITE_`
- Redeploy sau khi add env vars

**Supabase connection error?**
- Kiểm tra URL và key
- Test trong Supabase Dashboard → API Docs

**AI API errors?**
- Kiểm tra API key valid
- Kiểm tra credits balance
- Check rate limits
