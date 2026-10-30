import { Link } from 'react-router';
import { ArrowUpRight, TrendingUp, Heart, BriefcaseBusiness, Leaf } from 'lucide-react';
import type { CSSProperties } from 'react';
import { getCurrentLunarDate, formatLunarDate, getCanChi } from '../../lib/lunar';
import { analyzeDay } from '../../lib/goodDays';
import { dailyScores, vietnamDateKey, vietnamToday } from '../../lib/date';
import { getActiveProfile } from '../../lib/profiles';
import { dailyCard } from '../../features/tarot/engine/draw';
import { CARD_MAP } from '../../features/tarot/data/cards';
import { TarotArtwork } from '../../features/tarot/components/TarotArtwork';
import { useTarotAppearance } from '../../features/tarot/context/TarotAppearance';

export default function HomePage() {
  const { appearance } = useTarotAppearance();
  const now = vietnamToday();
  const profile = getActiveProfile();
  const lunar = getCurrentLunarDate();
  const day = analyzeDay(now.getDate(), now.getMonth() + 1, now.getFullYear());
  const scores = dailyScores(
    vietnamDateKey(),
    profile ? `${profile.id}|${profile.birthDate}` : 'guest',
  );
  const drawn = dailyCard(vietnamDateKey(), profile?.id ?? 'guest');
  const card = CARD_MAP.get(drawn.cardId)!;
  const symbols = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];
  return (
    <div className="page-enter">
      <div className="page-heading">
        <div>
          <span className="eyebrow">KẾT NỐI VỚI NHỊP ĐIỆU CỦA BẠN</span>
          <h1>
            Chào {profile?.name || 'bạn'}, một ngày mới<span className="gold">.</span>
          </h1>
          <p>
            {now.toLocaleDateString('vi-VN', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}{' '}
            · Âm lịch {formatLunarDate(lunar)}
          </p>
        </div>
        <Link to="/profile" className="button subtle">
          Hồ sơ của bạn
          <ArrowUpRight size={16} />
        </Link>
      </div>
      <section className="dashboard-hero panel">
        <div>
          <span className="eyebrow">✦ DƯỚI CÙNG MỘT BẦU TRỜI</span>
          <h2>
            Hiểu mình hơn.
            <br />
            <em className="gold">Bước đi an nhiên.</em>
          </h2>
          <p>
            Một chút chiêm nghiệm từ lịch Việt Nam, chiêm tinh và Tarot để đồng hành cùng những lựa
            chọn của bạn.
          </p>
          <Link to="/tarot?spread=daily" className="button primary">
            Khám phá Tarot hôm nay
            <ArrowUpRight size={17} />
          </Link>
        </div>
        <div className="zodiac-wheel" aria-hidden="true">
          {symbols.map((s, i) => (
            <span key={s} style={{ '--angle': `${i * 30}deg` } as CSSProperties}>
              {s}
            </span>
          ))}
          <div className="wheel-center">
            ☾<small>AS ABOVE, SO WITHIN</small>
          </div>
        </div>
      </section>
      <div className="section-heading">
        <div>
          <span className="eyebrow">BẢN ĐỒ CẢM HỨNG</span>
          <h2>Nhịp điệu hôm nay</h2>
        </div>
        <span className="muted small">Một gợi ý để tự suy ngẫm</span>
      </div>
      <div className="score-grid">
        {[
          { name: 'Tài lộc', icon: TrendingUp },
          { name: 'Tình duyên', icon: Heart },
          { name: 'Công việc', icon: BriefcaseBusiness },
          { name: 'Chăm sóc bản thân', icon: Leaf },
        ].map(({ name, icon: Icon }, i) => (
          <article className="score-card panel" key={name}>
            <div className="score-heading">
              <span>{name}</span>
              <Icon size={17} />
            </div>
            <div className="score-value">
              {scores[i]}
              <span>/10</span>
            </div>
            <div
              className="score-track"
              role="meter"
              aria-label={name}
              aria-valuenow={scores[i]}
              aria-valuemin={0}
              aria-valuemax={10}
            >
              <span style={{ width: `${scores[i] * 10}%` }} />
            </div>
          </article>
        ))}
      </div>
      <details className="method-note">
        <summary>Các chỉ số được tạo như thế nào?</summary>
        <p>
          Chỉ số cảm hứng được tạo bằng hàm băm cố định từ ngày Việt Nam (UTC+7), hồ sơ đang chọn và
          từng chủ đề. Cùng ngày và cùng hồ sơ cho cùng kết quả khi tải lại. Đây là gợi ý giải trí,
          không phải phép đo tài chính, tình cảm hay sức khỏe.
        </p>
      </details>
      <div className="two-column">
        <section className="content-panel panel">
          <span className="eyebrow">LỊCH VIỆT NAM</span>
          <h2>Một ngày trong dòng thời gian</h2>
          <dl className="detail-list">
            <div>
              <dt>Âm lịch</dt>
              <dd>
                {formatLunarDate(lunar)} · {getCanChi(lunar.year)}
              </dd>
            </div>
            <div>
              <dt>Can Chi ngày</dt>
              <dd>{day.dayCanChi}</dd>
            </div>
            <div>
              <dt>Ngày theo lịch truyền thống</dt>
              <dd className="gold">{day.isHoangDao ? 'Hoàng đạo' : 'Hắc đạo'}</dd>
            </div>
            <div>
              <dt>Giờ hoàng đạo</dt>
              <dd>{day.luckyHours.slice(0, 2).join(' · ')}</dd>
            </div>
          </dl>
          <Link to="/calendar" className="button subtle" style={{ marginTop: 20 }}>
            Xem lịch & lưu sự kiện
            <ArrowUpRight size={16} />
          </Link>
        </section>
        <section className="content-panel panel">
          <span className="eyebrow">MỘT LÁ CHO HÔM NAY</span>
          <h2>{appearance === 'jojo-ref' ? 'Một lá bài · JoJo ref' : 'Lời nhắn từ Huyền Tinh'}</h2>
          <div className="mini-card-feature">
            <TarotArtwork card={card} reversed={drawn.reversed} lazy />
            <div>
              <span className="eyebrow">{drawn.reversed ? 'Lá ngược' : 'Lá xuôi'}</span>
              <h3>{card.nameVi}</h3>
              <p>{(drawn.reversed ? card.reversedKeywords : card.uprightKeywords).join(' · ')}</p>
              <Link to="/tarot?spread=daily" className="button subtle">
                Lắng nghe thông điệp
                <ArrowUpRight size={15} />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
