# Kiến trúc AstroAI 2.0

`src/app/App.tsx` quản lý routing và shell responsive. Mỗi page được lazy import; `src/styles/celestial.css` chứa hệ thiết kế theo concept.

```text
src/features/tarot/
  data/cards.ts                # ID, tên, chất, asset và Major meanings
  data/card-meanings.vi.ts      # Nghĩa riêng của 56 Minor xuôi/ngược
  data/card-guidance.vi.ts      # 624 đoạn theo chủ đề và hành động cho 78 lá
  data/reading-topics.ts        # Chủ đề, nhận diện từ khóa, nguồn và phiên bản
  data/position-guidance.ts     # Vai trò và câu hỏi suy ngẫm của từng vị trí
  data/spreads.ts              # Vị trí cho 5 kiểu trải
  engine/shuffle.ts            # Fisher–Yates + Web Crypto
  engine/draw.ts               # Bộ bài, draw, lá hằng ngày xác định
  engine/reading.ts            # Schema nhật ký, validation, tương thích bản ghi cũ
  engine/interpretation.ts     # Tổng hợp xác định: lá/hướng/chủ đề/vị trí/cặp lá
  hooks/useTarotSession.ts     # idle → shuffling → picking → revealing → complete
  components/                 # Deck, card 3D, result
public/assets/tarot/celestial-v1/
  major/                       # 22 SVG
  minor/                       # 56 SVG
  card-back.svg / .webp
```

Artwork tách khỏi ID/ý nghĩa; thay `imagePath` không thay engine. Hook hủy timer khi unmount/đổi phase; không lật hay chọn trong phase không hợp lệ. Bộ bài xáo trộn không mutate source; card được loại khỏi bộ sau khi chọn. Lá hằng ngày và các chỉ số dùng ngày Việt Nam UTC+7, không dùng `Math.random()` khi render.

`src/lib/storage.ts` đọc/ghi LocalStorage có xử lý lỗi. Profiles, journal, events và chat có schema validation trước khi phục hồi. Trạng thái quota/khóa lưu ở server, không dựa vào browser.

```text
ChatPage → src/lib/openai.ts → Supabase functions.invoke + user JWT
  → chat-ai entry → shared handler
    → origin/method/size/auth/schema validation
    → atomic PostgreSQL quota (service-role only)
    → OpenAI HTTP API (server secret)
    → { reply } hoặc lỗi đã làm sạch
```

Chat không tự gửi toàn bộ hồ sơ. Ngữ cảnh ngày phía client được đánh dấu là dữ liệu tham khảo chưa kiểm chứng trong prompt. History chỉ nhận role user/assistant và có giới hạn. UI giữ history theo user ID trên thiết bị; đăng xuất đổi lại welcome và bỏ lịch sử cũ khỏi màn hình.

`src/lib/lunar.ts` tính lịch âm UTC+7; `goodDays.ts` tính ngày/giờ hoàng đạo và bộ lọc; `astrology.ts` cung cấp thuộc tính hồ sơ. Các quy tắc giản lược được trình bày trong UI và README.

Kiểm thử: unit tests cho engine, lịch, validation và HTTP handler; Playwright cho luồng người dùng. Không chạy migration hoặc gọi dịch vụ AI thật trong test.

`TarotAppearanceProvider` quản lý lựa chọn minh họa toàn ứng dụng, lưu ở `astroai.tarot-appearance.v1`. `data/appearance.ts` giải quyết đường dẫn theo ID lá và theme; `jojo-stands.json` chứa 22 đối ứng canonical, `jojo-minor-art.json` chứa 56 liên tưởng editorial và nguồn asset. `TarotArtwork` là lớp trình bày chung cho card flip, hero, library, settings preview và journal. Theme không tác động engine hoặc schema `deckId`/hướng lá đã lưu. `ReadingMethod` giải thích nguồn/giới hạn của nội dung, phân biệt bộ quy tắc với AI.

`interpretReading()` là hàm thuần, không gọi mạng. `Reading.topic` tùy chọn giữ tương thích nhật ký cũ; chủ đề rõ ràng được ưu tiên hơn từ khóa và kiểu trải. Nghĩa theo hướng kết hợp dữ liệu chủ đề riêng, lăng kính vị trí, chủ đề lặp, các cặp lá có biên soạn hoặc liên hệ theo chất, tối đa ba hành động. Các vị trí kết quả dùng diễn giải có điều kiện. Kiểm thử duyệt đủ 780 tổ hợp lá/hướng/chủ đề và các vai trò trải.

`scripts/build-offline.mjs` chạy sau Vite, tạo manifest các tệp static với size/SHA-256 và chèn vào `dist/sw.js`. Worker cài shell (gồm các chunk lazy), tải trọn bộ theo yêu cầu, chỉ lưu tệp thuộc manifest sau khi kiểm tra. Navigation có fallback index; API/auth và nguồn bên ngoài không lưu. Cache cũ chỉ dọn sau khi bộ mới đầy đủ. `src/lib/offline.ts` trao đổi qua MessageChannel và cung cấp trạng thái cho `OfflineSettings`. Chỉ bật trong production trên secure context. Playwright cấu hình riêng kiểm tra mở lại app khi offline, ảnh chưa mở trước đó, luận giải/nhật ký, tải lỗi và thử lại.
