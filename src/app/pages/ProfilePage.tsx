import { useState, type FormEvent } from 'react';
import { Link } from 'react-router';
import { Plus, Save, Trash2 } from 'lucide-react';
import { useStoredState } from '../../lib/storage';
import { PROFILE_KEY, ACTIVE_PROFILE_KEY, isProfiles, type Profile } from '../../lib/profiles';
import {
  calculateEasternChart,
  calculateWesternChart,
  getZodiacTraits,
  ZODIAC_SIGNS,
} from '../../lib/astrology';
import { solarToLunar, formatLunarDate } from '../../lib/lunar';
import { vietnamDateKey } from '../../lib/date';

const blank = (): Profile => ({
  id: crypto.randomUUID(),
  name: '',
  birthDate: '',
  birthTime: '',
  birthPlace: '',
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
  const [year, month, day] = (active?.birthDate ?? '').split('-').map(Number);
  const western = active ? calculateWesternChart(day, month, year) : null;
  const eastern = active
    ? calculateEasternChart(
        day,
        month,
        year,
        active.birthTime ? Number(active.birthTime.split(':')[0]) : undefined,
      )
    : null;
  const traits = western ? getZodiacTraits(western.sunSign) : null;
  const symbols = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];
  function save(e: FormEvent) {
    e.preventDefault();
    if (
      !draft.name.trim() ||
      !draft.birthDate ||
      draft.birthDate > vietnamDateKey() ||
      draft.birthDate < '1900-01-01'
    ) {
      setError('Nhập tên và ngày sinh hợp lệ từ năm 1900 đến hôm nay.');
      return;
    }
    const updated = { ...draft, name: draft.name.trim(), birthPlace: draft.birthPlace.trim() };
    setProfiles([...profiles.filter((p) => p.id !== updated.id), updated]);
    setActiveId(updated.id);
    setMessage('Đã cập nhật hồ sơ.');
    setError('');
  }
  function choose(p: Profile) {
    setActiveId(p.id);
    setDraft(p);
    setMessage('');
    setError('');
  }
  function remove() {
    const remaining = profiles.filter((p) => p.id !== draft.id);
    setProfiles(remaining);
    setActiveId(remaining[0]?.id ?? '');
    setDraft(remaining[0] ?? blank());
    setMessage('Đã xóa hồ sơ.');
  }
  return (
    <div className="page-enter">
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
                <div className="sign-symbol" aria-hidden="true">
                  {symbols[ZODIAC_SIGNS.indexOf(western.sunSign)]}
                </div>
                <div>
                  <span className="eyebrow">{active.name}</span>
                  <h2>{western.sunSignVN}</h2>
                  <p>{western.sunSign} · Cung Mặt Trời theo khoảng ngày</p>
                </div>
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
              <details className="method-note">
                <summary>Phương pháp và giới hạn</summary>
                <p>
                  Can Chi năm dùng năm âm lịch, ngày dùng số ngày Julian và giờ dùng can ngày. Trụ
                  tháng dùng tháng âm, chưa hiệu chỉnh theo tiết khí. Cung Mặt Trời dùng khoảng ngày
                  phổ biến. Chưa tính cung Mọc, Mặt Trăng hoặc lá số Bát tự chuyên sâu. Nơi sinh
                  hiện chỉ được lưu; phép tính dùng UTC+7 và ngày đổi lúc 00:00.
                </p>
              </details>
            </>
          ) : (
            <div className="empty-state">
              <div className="sign-symbol">☾</div>
              <h2>Một bản đồ đang chờ bạn</h2>
              <p>Lưu ngày sinh để xem cung Mặt Trời, Can Chi và các thuộc tính của hồ sơ.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
