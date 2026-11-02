# AstroAI backend

Backend AI hiện dùng `functions/chat-ai/index.ts`; logic HTTP có thể kiểm thử nằm trong `functions/_shared/chat-handler.ts` và kiểm tra schema trong `chat-validation.ts`.

Đọc [hướng dẫn triển khai](../DEPLOYMENT.md) để cấu hình Google/email Auth, origin, secrets và hai migration hạn mức. Chạy `202610290001_ai_quota.sql` rồi `202610310002_ai_global_quota.sql` trước khi gọi AI. Google OAuth callback do Supabase xử lý; frontend không chứa Google Client Secret.

Các kiểm thử backend dùng dịch vụ giả lập trong `tests/ai-handler.test.ts`, không gọi OpenAI hoặc Supabase thật.

Function `good-days` là code prototype cũ, hiện không được frontend gọi. Lịch mới tính trong `src/lib/goodDays.ts`; không triển khai function cũ như một dịch vụ lịch đã kiểm chứng.
