import { useState, type CSSProperties } from 'react';

const GROUPS = {
  eastern: {
    label: 'Ngũ hành',
    note: 'Năm hình tượng để ghi nhớ quan hệ sinh–khắc; không dùng màu hay nhân vật để suy mệnh.',
    fallback: '/assets/illustrations/eastern-knowledge.webp',
    items: [
      ['Mộc', 'Nuôi dưỡng · phát triển', '/assets/anime/eastern/element-wood.webp'],
      ['Hỏa', 'Sáng rõ · chuyển hóa', '/assets/anime/eastern/element-fire.webp'],
      ['Thổ', 'Ổn định · nâng đỡ', '/assets/anime/eastern/element-earth.webp'],
      ['Kim', 'Cấu trúc · chọn lọc', '/assets/anime/eastern/element-metal.webp'],
      ['Thủy', 'Thích nghi · chiều sâu', '/assets/anime/eastern/element-water.webp'],
    ],
  },
  western: {
    label: 'Bốn nguyên tố',
    note: 'Nhóm biểu tượng phổ biến trong chiêm tinh Tây phương; không xác định tính cách của một người.',
    fallback: '/assets/illustrations/western-atlas.webp',
    items: [
      ['Lửa', 'Bạch Dương · Sư Tử · Nhân Mã', '/assets/anime/western/zodiac-fire.webp'],
      ['Đất', 'Kim Ngưu · Xử Nữ · Ma Kết', '/assets/anime/western/zodiac-earth.webp'],
      ['Khí', 'Song Tử · Thiên Bình · Bảo Bình', '/assets/anime/western/zodiac-air.webp'],
      ['Nước', 'Cự Giải · Bọ Cạp · Song Ngư', '/assets/anime/western/zodiac-water.webp'],
    ],
  },
  tarot: {
    label: 'Tarot ứng dụng',
    note: 'Ba ngữ cảnh để đặt câu hỏi có thể hành động; hình ảnh không thay đổi nghĩa của bộ bài.',
    fallback: '/assets/illustrations/fusion-home.webp',
    items: [
      ['Tự soi chiếu', 'Điều gì đang cần được nhìn rõ?', '/assets/anime/tarot/self-reflection.webp'],
      ['Tình cảm', 'Ranh giới và đối thoại nào cần thiết?', '/assets/anime/tarot/love-reflection.webp'],
      ['Công việc', 'Bước nhỏ nào tạo phản hồi thật?', '/assets/anime/tarot/career-reflection.webp'],
    ],
  },
} as const;

type Group = keyof typeof GROUPS;

export function AnimeLoreGallery() {
  const [group, setGroup] = useState<Group>('eastern');
  const current = GROUPS[group];
  return (
    <section className="anime-lore panel" aria-labelledby="anime-lore-title">
      <div className="section-heading">
        <div>
          <span className="eyebrow">MINH HOẠ NHÂN VẬT · ORIGINAL ANIME</span>
          <h2 id="anime-lore-title">Đọc biểu tượng bằng câu chuyện</h2>
        </div>
        <div className="anime-lore-tabs" role="tablist" aria-label="Nhóm minh hoạ">
          {(Object.keys(GROUPS) as Group[]).map((id) => (
            <button
              key={id}
              role="tab"
              aria-selected={group === id}
              onClick={() => setGroup(id)}
            >
              {GROUPS[id].label}
            </button>
          ))}
        </div>
      </div>
      <p className="muted anime-lore-note">{current.note}</p>
      <div className="anime-lore-grid" key={group}>
        {current.items.map(([title, caption, src], index) => (
          <figure className="anime-lore-card" key={src} style={{ '--reveal-index': index } as CSSProperties}>
            <img
              src={src}
              alt={`${title} — ${caption}`}
              loading="lazy"
              decoding="async"
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = current.fallback;
              }}
            />
            <figcaption>
              <strong>{title}</strong>
              <span>{caption}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
