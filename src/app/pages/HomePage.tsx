import { useState, type CSSProperties } from 'react';
import { Link } from 'react-router';
import { ArrowUpRight } from 'lucide-react';
import { getCurrentLunarDate, formatLunarDate, getCanChi, CAN_TO_NGU_HANH } from '../../lib/lunar';
import { analyzeDay } from '../../lib/goodDays';
import { dailyScores, vietnamDateKey, vietnamToday } from '../../lib/date';
import { getActiveProfile } from '../../lib/profiles';
import { calculateWesternChart } from '../../lib/astrology';
import { dailyCard } from '../../features/tarot/engine/draw';
import { CARD_MAP } from '../../features/tarot/data/cards';
import { TarotArtwork } from '../../features/tarot/components/TarotArtwork';
import { useTarotAppearance } from '../../features/tarot/context/TarotAppearance';
import { AstroSymbol } from '../components/astro/AstroSymbol';
import { ZodiacWheel, BaguaWheel } from '../components/astro/AstroWheels';
import { useVisualTheme } from '../components/astro/VisualTheme';
import { EditorialIllustration } from '../components/EditorialIllustration';

export default function HomePage() {
  const { appearance } = useTarotAppearance();
  const { resolved } = useVisualTheme();
  const [tradition, setTradition] = useState<'eastern' | 'western'>(() =>
    resolved === 'western' ? 'western' : 'eastern',
  );
  const now = vietnamToday(),
    profile = getActiveProfile(),
    lunar = getCurrentLunarDate();
  const day = analyzeDay(now.getDate(), now.getMonth() + 1, now.getFullYear());
  const element = CAN_TO_NGU_HANH[day.dayCanChi.split(' ')[0]];
  const birth = profile?.birthDate.split('-').map(Number);
  const western = birth ? calculateWesternChart(birth[2], birth[1], birth[0]) : null;
  const scores = dailyScores(
    vietnamDateKey(),
    profile ? `${profile.id}|${profile.birthDate}` : 'guest',
  );
  const drawn = dailyCard(vietnamDateKey(), profile?.id ?? 'guest'),
    card = CARD_MAP.get(drawn.cardId)!;
  return (
    <div className="fusion-home page-enter">
      <div className="page-heading">
        <div>
          <span className="eyebrow">HAI TRUYỀN THỐNG · MỘT HÀNH TRÌNH</span>
          <h1>
            Chào {profile?.name || 'bạn'}, một ngày mới<span className="gold">.</span>
          </h1>
          <p>
            {now.toLocaleDateString('vi-VN', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>
        <Link to="/profile" className="button subtle">
          Hồ sơ của bạn
          <ArrowUpRight size={16} />
        </Link>
      </div>
      <section className={`fortune-hero panel tradition-${tradition}`}>
        <div className="fortune-hero-copy">
          <div
            className="tradition-tabs"
            role="tablist"
            aria-label="Góc nhìn hôm nay"
            onKeyDown={(event) => {
              if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
              event.preventDefault();
              const next =
                event.key === 'Home'
                  ? 'eastern'
                  : event.key === 'End'
                    ? 'western'
                    : tradition === 'eastern'
                      ? 'western'
                      : 'eastern';
              setTradition(next);
              document.getElementById(`home-${next === 'eastern' ? 'east' : 'west'}-tab`)?.focus();
            }}
          >
            <button
              role="tab"
              id="home-east-tab"
              aria-controls="home-tradition-panel"
              aria-selected={tradition === 'eastern'}
              tabIndex={tradition === 'eastern' ? 0 : -1}
              onClick={() => setTradition('eastern')}
            >
              <AstroSymbol name="Càn" size={18} />
              Đông phương
            </button>
            <button
              role="tab"
              id="home-west-tab"
              aria-controls="home-tradition-panel"
              aria-selected={tradition === 'western'}
              tabIndex={tradition === 'western' ? 0 : -1}
              onClick={() => setTradition('western')}
            >
              <AstroSymbol name="star" size={18} />
              Tây phương
            </button>
          </div>
          <div
            role="tabpanel"
            id="home-tradition-panel"
            aria-labelledby={`home-${tradition === 'eastern' ? 'east' : 'west'}-tab`}
            key={tradition}
            className="tradition-content"
          >
            <span className="eyebrow">
              {tradition === 'eastern' ? 'THIÊN · ĐỊA · NHÂN' : 'AS ABOVE, SO WITHIN'}
            </span>
            <h2>
              {tradition === 'eastern' ? (
                <>
                  Thuận nhịp đất trời.
                  <br />
                  <em>An nhiên bước tới.</em>
                </>
              ) : (
                <>
                  Dưới cùng bầu trời.
                  <br />
                  <em>Mở một góc nhìn.</em>
                </>
              )}
            </h2>
            <p>
              {tradition === 'eastern'
                ? `Ngày ${day.dayCanChi}, tháng âm ${lunar.month}. Một khoảng dừng để sắp xếp việc cần làm và dành chỗ cho điều có ý nghĩa.`
                : 'Lắng nghe những hình tượng từ vòng hoàng đạo và Tarot. Mỗi biểu tượng là một lời mời nhìn lại chính mình.'}
            </p>
            <div className="hero-facts">
              {tradition === 'eastern' ? (
                <>
                  <span>
                    <AstroSymbol name={element} size={19} />
                    Hành {element} · thiên can ngày
                  </span>
                  <span className={day.isHoangDao ? 'jade-text' : 'cinnabar-text'}>
                    {day.isHoangDao ? '✦ Hoàng đạo' : '◇ Hắc đạo'}
                  </span>
                </>
              ) : (
                <>
                  <span>
                    <AstroSymbol name={western?.sunSign ?? 'Sun'} size={19} />
                    {western ? `${western.sunSignVN} · cung Mặt Trời` : '12 cung · 4 nguyên tố'}
                  </span>
                  <span>78 lá bài · một hành trình</span>
                </>
              )}
            </div>
            <Link
              to={tradition === 'eastern' ? '/calendar' : '/tarot?spread=daily'}
              className="button primary"
            >
              {tradition === 'eastern' ? 'Khám phá lịch hôm nay' : 'Khám phá Tarot hôm nay'}
              <ArrowUpRight size={17} />
            </Link>
          </div>
        </div>
        <div className="fortune-medallion" aria-hidden="true">
          <span className="medallion-coordinate">
            {tradition === 'eastern' ? 'ÂM DƯƠNG TƯƠNG HÒA' : 'THE CELESTIAL ATLAS'}
          </span>
          {tradition === 'eastern' ? (
            <BaguaWheel element={element} />
          ) : (
            <ZodiacWheel sign={western?.sunSign} />
          )}
          <div className="medallion-date">
            <span>
              {tradition === 'eastern'
                ? `ÂM LỊCH ${formatLunarDate(lunar)}`
                : western
                  ? `MẶT TRỜI · ${western.sunSignVN.toLocaleUpperCase('vi')}`
                  : 'MỘT KHOẢNG LẶNG ĐỂ HIỂU MÌNH'}
            </span>
            <i />
          </div>
        </div>
      </section>
      <EditorialIllustration
        src="/assets/illustrations/fusion-home.webp"
        alt="Thiên cầu kết hợp la bàn Bát quái và vòng hoàng đạo dưới bầu trời đêm"
        eyebrow="CELESTIAL FENG SHUI"
        title="Hai hệ biểu tượng, một khoảng lặng để hiểu mình"
        className="home-fusion-story"
      >
        Đông phương gợi nhịp thời gian và sự cân bằng; Tây phương mở ra ngôn ngữ của
        các hình tượng. AstroAI đặt cả hai cạnh nhau để bạn tham khảo, đối chiếu và tự
        chọn điều phù hợp.
      </EditorialIllustration>
      <div className="daily-almanac panel">
        <div className="almanac-date">
          <strong>{String(now.getDate()).padStart(2, '0')}</strong>
          <span>
            THÁNG {now.getMonth() + 1}
            <small>{now.getFullYear()}</small>
          </span>
        </div>
        <div>
          <span className="eyebrow">ÂM LỊCH VIỆT NAM</span>
          <strong>{formatLunarDate(lunar)}</strong>
          <p>
            {getCanChi(lunar.year)} · {day.dayCanChi}
          </p>
        </div>
        <div>
          <span className="eyebrow">NHỊP NGÀY</span>
          <strong>
            Trực {day.truc} · Tú {day.tu.name}
          </strong>
          <p>Quy tắc lịch truyền thống tham khảo</p>
        </div>
        <Link className="icon-button" to="/calendar" aria-label="Mở lịch chi tiết">
          <ArrowUpRight size={22} />
        </Link>
      </div>
      <div className="section-heading">
        <div>
          <span className="eyebrow">MỘT CHÚT CẢM HỨNG CHO BẠN</span>
          <h2>Nhịp điệu hôm nay</h2>
        </div>
        <span className="edition-tag">DAILY REFLECTION</span>
      </div>
      <div className="score-grid">
        {[
          { name: 'Tài lộc', icon: 'Kim', note: 'Nhìn lại một nguồn lực bạn đang có.' },
          { name: 'Tình duyên', icon: 'Venus', note: 'Dành một lời hỏi thăm thật lòng.' },
          { name: 'Công việc', icon: 'Sun', note: 'Chọn một việc nhỏ để hoàn thành.' },
          { name: 'Chăm sóc bản thân', icon: 'Mộc', note: 'Cho mình một khoảng nghỉ vừa đủ.' },
        ].map((item, i) => (
          <article
            className="score-card panel"
            key={item.name}
            style={
              { '--score-color': ['#c9ad79', '#d8a5b6', '#a9a1d9', '#83bea4'][i] } as CSSProperties
            }
          >
            <div className="score-heading">
              <AstroSymbol name={item.icon} size={28} />
              <span>{item.name}</span>
            </div>
            <div className="score-orbit">
              <svg viewBox="0 0 100 100" aria-hidden="true">
                <circle className="ring-track" cx="50" cy="50" r="42" />
                <circle
                  className="ring-value"
                  cx="50"
                  cy="50"
                  r="42"
                  strokeDasharray={`${(scores[i] / 10) * 264} 264`}
                />
              </svg>
              <div className="score-value">
                {scores[i]}
                <span>/10</span>
              </div>
            </div>
            <div
              className="score-track"
              role="meter"
              aria-label={item.name}
              aria-valuenow={scores[i]}
              aria-valuemin={0}
              aria-valuemax={10}
            >
              <span style={{ width: `${scores[i] * 10}%` }} />
            </div>
            <p className="score-suggestion">{item.note}</p>
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
      <div className="two-column home-portals">
        <section className="content-panel panel eastern-portal">
          <img
            className="portal-illustration"
            src="/assets/illustrations/eastern-knowledge.webp"
            alt="La bàn Bát quái và vòng Ngũ hành bằng ngọc trong sân trăng"
            loading="lazy"
            decoding="async"
          />
          <div className="portal-mark">
            <AstroSymbol name={element} size={33} />
            <span className="eyebrow">ĐÔNG PHƯƠNG / LỊCH VIỆT NAM</span>
          </div>
          <h2>Chọn nhịp cho một ngày</h2>
          <dl className="detail-list">
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
          <Link to="/calendar" className="button subtle">
            Xem lịch & lưu sự kiện
            <ArrowUpRight size={16} />
          </Link>
          <Link to="/oracle" className="button subtle">
            Gieo quẻ offline
            <ArrowUpRight size={16} />
          </Link>
        </section>
        <section className="content-panel panel western-portal">
          <img
            className="portal-illustration"
            src="/assets/illustrations/western-atlas.webp"
            alt="Vòng hoàng đạo, quỹ đạo hành tinh và bản đồ sao cổ"
            loading="lazy"
            decoding="async"
          />
          <div className="portal-mark">
            <AstroSymbol name="star" size={33} />
            <span className="eyebrow">TÂY PHƯƠNG / MỘT LÁ HÔM NAY</span>
          </div>
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
