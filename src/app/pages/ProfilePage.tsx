import { useState, type FormEvent } from 'react';
import { Link } from 'react-router';
import { Plus, Save, Trash2 } from 'lucide-react';
import { useStoredState } from '../../lib/storage';
import {
  PROFILE_KEY,
  ACTIVE_PROFILE_KEY,
  isProfiles,
  isTimeZone,
  type Profile,
} from '../../lib/profiles';
import { calculateEasternChart, calculateWesternChart, getZodiacTraits } from '../../lib/astrology';
import { solarToLunar, formatLunarDate } from '../../lib/lunar';
import { vietnamDateKey } from '../../lib/date';
import { AstroSymbol } from '../components/astro/AstroSymbol';
import { ZodiacWheel, BaguaWheel } from '../components/astro/AstroWheels';
import { ElementBalance } from '../components/astro/ElementBalance';
import { EditorialIllustration } from '../components/EditorialIllustration';

const blank = (): Profile => ({
  id: crypto.randomUUID(),
  name: '',
  birthDate: '',
  birthTime: '',
  birthPlace: '',
  timezone: 'Asia/Ho_Chi_Minh',
  tradition: 'fusion',
});
export default function ProfilePage() {
  const [profiles, setProfiles, storageError] = useStoredState<Profile[]>(
    PROFILE_KEY,
    [],
    isProfiles,
  );
  const [activeId, setActiveId] = useStoredState<string>(
    ACTIVE_PROFILE_KEY,
    '',
    (v): v is string => typeof v === 'string',
  );
  const active = profiles.find((p) => p.id === activeId) ?? profiles[0];
  const [draft, setDraft] = useState<Profile>(() => active ?? blank());
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [consent, setConsent] = useState(!!active?.consentAt);
  const [year, month, day] = (active?.birthDate ?? '').split('-').map(Number);
  const western = active ? calculateWesternChart(day, month, year) : null;
  const eastern = active
    ? calculateEasternChart(
        day,
        month,
        year,
        active.birthTime && (active.timezone ?? 'Asia/Ho_Chi_Minh') === 'Asia/Ho_Chi_Minh'
          ? Number(active.birthTime.split(':')[0])
          : undefined,
        active.birthTime ? Number(active.birthTime.split(':')[1]) : 0,
      )
    : null;
  const traits = western ? getZodiacTraits(western.sunSign) : null;
  function save(e: FormEvent) {
    e.preventDefault();
    if (!consent || !isTimeZone(draft.timezone ?? 'Asia/Ho_Chi_Minh')) {
      setError('Hãy chọn múi giờ hợp lệ và đồng ý lưu dữ liệu tại thiết bị.');
      return;
    }
    if (
      !draft.name.trim() ||
      !draft.birthDate ||
      draft.birthDate > vietnamDateKey() ||
      draft.birthDate < '1900-01-01'
    ) {
      setError('Nhập tên và ngày sinh hợp lệ từ năm 1900 đến hôm nay.');
      return;
    }
    const updated = {
      ...draft,
      name: draft.name.trim(),
      birthPlace: draft.birthPlace.trim(),
      timezone: draft.timezone ?? 'Asia/Ho_Chi_Minh',
      consentAt: draft.consentAt ?? new Date().toISOString(),
    };
    setProfiles([...profiles.filter((p) => p.id !== updated.id), updated]);
    setActiveId(updated.id);
    setMessage('Đã cập nhật hồ sơ.');
    setError('');
  }
  function choose(p: Profile) {
    setActiveId(p.id);
    setDraft(p);
    setConsent(!!p.consentAt);
    setMessage('');
    setError('');
  }
  function remove() {
    const remaining = profiles.filter((p) => p.id !== draft.id);
    setProfiles(remaining);
    setActiveId(remaining[0]?.id ?? '');
    setDraft(remaining[0] ?? blank());
    setConsent(!!remaining[0]?.consentAt);
    setMessage('Đã xóa hồ sơ.');
  }
  return (
    <div className="profile-page page-enter">
      <div className="page-heading">
        <div>
          <span className="eyebrow">MỖI NGƯỜI LÀ MỘT VŨ TRỤ</span>
          <h1>
            Bản đồ của riêng bạn<span className="gold">.</span>
          </h1>
          <p>Lưu thông tin sinh để khám phá góc nhìn phương Đông và phương Tây.</p>
        </div>
        <Link to="/settings" className="button subtle">
          Cài đặt bộ bài
        </Link>
      </div>
      <EditorialIllustration
        src="/assets/illustrations/profile-cosmos.webp"
        alt="Bốn trụ biểu tượng, la bàn và vòng hoàng đạo trên bàn quan sát đêm"
        eyebrow="HỒ SƠ CỤC BỘ · RIÊNG TƯ"
        title="Dấu mốc sinh là điểm bắt đầu, không phải giới hạn"
        className="profile-story"
      >
        Hồ sơ giúp nối các phép tính tại máy với góc nhìn Đông–Tây. Thông tin sinh chỉ
        lưu trên thiết bị và không tự động gửi tới chatbot.
      </EditorialIllustration>
      <div className="profile-switcher">
        {profiles.map((p) => (
          <button
            key={p.id}
            className={p.id === active?.id ? 'active' : ''}
            onClick={() => choose(p)}
          >
            {p.name}
          </button>
        ))}
        <button
          onClick={() => {
            setDraft(blank());
            setConsent(false);
            setMessage('');
            setError('');
          }}
        >
          <Plus size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 5 }} />
          Thêm hồ sơ
        </button>
      </div>
      <div className="profile-layout">
        <section className="content-panel panel">
          <span className="eyebrow">THÔNG TIN SINH</span>
          <h2>{profiles.some((p) => p.id === draft.id) ? 'Chỉnh sửa hồ sơ' : 'Tạo hồ sơ mới'}</h2>
          <form className="profile-form" onSubmit={save}>
            <div className="form-field full">
              <label htmlFor="profile-name">Tên của bạn</label>
              <input
                id="profile-name"
                required
                maxLength={80}
                autoComplete="name"
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                placeholder="Bạn muốn được gọi là gì?"
              />
            </div>
            <div className="form-field">
              <label htmlFor="birth-date">Ngày sinh dương lịch</label>
              <input
                id="birth-date"
                type="date"
                required
                min="1900-01-01"
                max={vietnamDateKey()}
                value={draft.birthDate}
                onChange={(e) => setDraft({ ...draft, birthDate: e.target.value })}
              />
            </div>
            <div className="form-field">
              <label htmlFor="birth-time">Giờ sinh · Không bắt buộc</label>
              <input
                id="birth-time"
                type="time"
                value={draft.birthTime}
                onChange={(e) => setDraft({ ...draft, birthTime: e.target.value })}
              />
            </div>
            <div className="form-field full">
              <label htmlFor="birth-place">Nơi sinh · Không bắt buộc</label>
              <input
                id="birth-place"
                maxLength={150}
                value={draft.birthPlace}
                onChange={(e) => setDraft({ ...draft, birthPlace: e.target.value })}
                placeholder="Ví dụ: Hà Nội, Việt Nam"
              />
            </div>
            <div className="form-actions">
              <div className="form-field full">
                <label htmlFor="birth-timezone">Múi giờ nơi sinh</label>
                <input
                  id="birth-timezone"
                  value={draft.timezone ?? 'Asia/Ho_Chi_Minh'}
                  onChange={(e) => setDraft({ ...draft, timezone: e.target.value })}
                  placeholder="Asia/Ho_Chi_Minh"
                />
                <small className="muted">
                  Lịch Việt Nam vẫn dùng UTC+7. Chưa tính Bát tự hoặc lá số thiên văn theo múi giờ
                  khác.
                </small>
              </div>
              <div className="form-field full">
                <label htmlFor="profile-tradition">Góc nhìn ưu tiên</label>
                <select
                  id="profile-tradition"
                  value={draft.tradition ?? 'fusion'}
                  onChange={(e) =>
                    setDraft({ ...draft, tradition: e.target.value as Profile['tradition'] })
                  }
                >
                  <option value="fusion">Đông & Tây</option>
                  <option value="eastern">Đông phương</option>
                  <option value="western">Tây phương</option>
                </select>
              </div>
              <label className="profile-consent">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                />
                Tôi đồng ý lưu thông tin sinh trên thiết bị này. Dữ liệu không tự gửi cho AI hoặc
                cloud.
              </label>
              <button className="button primary" type="submit">
                <Save size={16} />
                Lưu hồ sơ
              </button>
              {profiles.some((p) => p.id === draft.id) && (
                <button type="button" className="button subtle" onClick={remove}>
                  <Trash2 size={14} />
                  Xóa hồ sơ
                </button>
              )}
            </div>
          </form>
          {message && !storageError && (
            <p className="success small" role="status" style={{ marginTop: 16 }}>
              {message}
            </p>
          )}
          {(error || storageError) && (
            <p className="error-message" role="alert">
              {error || 'Không thể lưu vào trình duyệt. Dữ liệu chỉ tồn tại trong phiên hiện tại.'}
            </p>
          )}
          <p className="profile-notice">
            Hồ sơ được lưu trên trình duyệt này. Bạn có thể tạo nhiều hồ sơ và chuyển hồ sơ đang
            xem.
          </p>
        </section>
        <section className="content-panel panel">
          {active && western && eastern && traits ? (
            <>
              <div className="chart-intro">
                <span className="profile-seal">ASTRO / ID</span>
                <div className="sign-symbol" aria-hidden="true">
                  <AstroSymbol name={western.sunSign} size={46} />
                </div>
                <div>
                  <span className="eyebrow">{active.name}</span>
                  <h2>{western.sunSignVN}</h2>
                  <p>{western.sunSign} · Cung Mặt Trời theo khoảng ngày</p>
                </div>
              </div>
              <div className="profile-traditions">
                <section className="profile-western">
                  <div className="tradition-section-title">
                    <AstroSymbol name="star" size={23} />
                    <span className="eyebrow">PHƯƠNG TÂY / VÒNG HOÀNG ĐẠO</span>
                  </div>
                  <ZodiacWheel sign={western.sunSign} />
                  <div className="western-attributes">
                    <span>
                      <AstroSymbol name={western.ruler} size={22} />
                      <small>Chủ tinh theo quy ước</small>
                      <strong>{western.ruler}</strong>
                    </span>
                    <span>
                      <AstroSymbol name={western.element} size={22} />
                      <small>Nguyên tố cung Mặt Trời</small>
                      <strong>
                        {{ Fire: 'Lửa', Earth: 'Đất', Air: 'Khí', Water: 'Nước' }[western.element]}
                      </strong>
                    </span>
                  </div>
                  <p className="small muted">
                    Vòng 12 cung đánh dấu cung Mặt Trời theo khoảng ngày. Chưa phải natal chart có
                    vị trí hành tinh, cung Mọc hay Mặt Trăng.
                  </p>
                </section>
                <section className="profile-eastern">
                  <div className="tradition-section-title">
                    <AstroSymbol name="Càn" size={23} />
                    <span className="eyebrow">PHƯƠNG ĐÔNG / DẤU ẤN NĂM SINH</span>
                  </div>
                  <div className="eastern-profile-emblem">
                    <BaguaWheel element={eastern.nguHanh} />
                    <div>
                      <AstroSymbol name={eastern.conGiap} size={64} />
                      <strong>{eastern.conGiap}</strong>
                      <span>{eastern.canChi.year}</span>
                    </div>
                  </div>
                  <div className="element-identity" data-element={eastern.nguHanh}>
                    <AstroSymbol name={eastern.nguHanh} size={30} />
                    <span>
                      Ngũ hành thiên can năm<strong>{eastern.nguHanh}</strong>
                    </span>
                  </div>
                </section>
              </div>
              <p>{traits.personality}.</p>
              <div className="chart-attributes">
                {traits.strengths.map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </div>
              <div className="section-heading">
                <span className="eyebrow">CAN CHI THAM KHẢO · UTC+7</span>
              </div>
              <div className="pillars">
                {(['year', 'month', 'day', 'hour'] as const).map((key, i) => (
                  <div className="pillar" key={key}>
                    <span>{['Năm', 'Tháng âm', 'Ngày', 'Giờ'][i]}</span>
                    <AstroSymbol name={eastern.canChi[key]?.split(' ')[1] ?? 'compass'} size={25} />
                    {eastern.canChi[key]
                      ?.split(' ')
                      .map((text, j) => <strong key={j}>{text}</strong>) ?? <p>Chưa có giờ sinh</p>}
                  </div>
                ))}
              </div>
              <dl className="detail-list">
                <div>
                  <dt>Âm lịch ngày sinh</dt>
                  <dd>{formatLunarDate(solarToLunar(day, month, year))}</dd>
                </div>
                <div>
                  <dt>Ngũ hành thiên can năm</dt>
                  <dd>{eastern.nguHanh}</dd>
                </div>
                <div>
                  <dt>Con giáp năm âm</dt>
                  <dd>{eastern.conGiap}</dd>
                </div>
              </dl>
              <ElementBalance pillars={eastern.canChi} />
              <details className="method-note">
                <summary>Phương pháp và giới hạn</summary>
                <p>
                  Can Chi năm dùng năm âm lịch, ngày dùng số ngày Julian và giờ dùng can ngày. Trụ
                  năm tuổi theo lịch âm. Bốn trụ khi đủ giờ dùng tháng tiết khí xấp xỉ UTC+7, quy
                  ước đổi ngày lúc 00:00; có thể khác tên năm âm quanh Tết/Lập Xuân. Cung Mặt Trời
                  dùng khoảng ngày phổ biến. Chưa tính cung Mọc, Mặt Trăng hoặc lá số Bát tự chuyên
                  sâu. Nơi sinh hiện chỉ được lưu; phép tính dùng UTC+7 và ngày đổi lúc 00:00.
                </p>
              </details>
            </>
          ) : (
            <div className="empty-state">
              <div className="empty-profile-wheel">
                <ZodiacWheel />
              </div>
              <h2>Một bản đồ đang chờ bạn</h2>
              <p>Lưu ngày sinh để xem cung Mặt Trời, Can Chi và các thuộc tính của hồ sơ.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
