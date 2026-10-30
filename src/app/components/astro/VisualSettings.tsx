import { AstroSymbol } from './AstroSymbol';
import { useVisualTheme, THEME_NAMES, type ThemePreference } from './VisualTheme';
export function VisualSettings() {
  const { preference, resolved, setPreference, motion, setMotion, storageError } = useVisualTheme();
  const options: { id: ThemePreference; icon: string; text: string }[] = [
    {
      id: 'fusion',
      icon: 'fusion',
      text: 'Ngọc, ánh vàng và bầu trời chàm. Hai truyền thống, một không gian.',
    },
    { id: 'eastern', icon: 'Càn', text: 'Ngọc lục, son đỏ, mây và vòng bát quái.' },
    { id: 'western', icon: 'star', text: 'Chàm tím, ánh bạc, các quỹ đạo và chòm sao.' },
    {
      id: 'auto',
      icon: 'compass',
      text: 'Lịch dùng Đông phương, Tarot dùng Tây phương; các trang khác dùng Fusion.',
    },
  ];
  return (
    <section className="visual-settings">
      <div className="section-heading">
        <div>
          <span className="eyebrow">CELESTIAL FENG SHUI</span>
          <h2>Không gian thị giác</h2>
        </div>
        <span className="edition-tag">MYSTIC FUSION</span>
      </div>
      <fieldset className="visual-fieldset">
        <legend className="sr-only">Chủ đề giao diện</legend>
        <div className="visual-theme-options">
          {options.map((option) => (
            <label
              className={`visual-theme-option panel theme-preview-${option.id} ${preference === option.id ? 'selected' : ''}`}
              key={option.id}
            >
              <input
                type="radio"
                name="visual-theme"
                aria-label={option.id === 'auto' ? 'Tự động theo màn hình' : THEME_NAMES[option.id]}
                checked={preference === option.id}
                onChange={() => setPreference(option.id)}
              />
              <div className="theme-miniature">
                <i />
                <AstroSymbol name={option.icon} size={44} />
                <i />
              </div>
              <strong>
                {option.id === 'auto' ? 'Tự động theo màn hình' : THEME_NAMES[option.id]}
              </strong>
              <p>{option.text}</p>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="motion-setting panel">
        <div>
          <h3>Nhịp chuyển động</h3>
          <p>
            Sao trôi, quỹ đạo và ánh sáng chuyển động nhẹ. Luôn tôn trọng cài đặt giảm chuyển động
            của thiết bị.
          </p>
        </div>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={motion === 'calm'}
            onChange={(e) => setMotion(e.target.checked ? 'calm' : 'gentle')}
          />
          Không gian tĩnh
        </label>
      </div>
      <p className="small theme-feedback" aria-live="polite">
        Đang hiển thị {THEME_NAMES[resolved]}. Lựa chọn được lưu trên trình duyệt này.
      </p>
      {storageError && (
        <p className="error-message" role="alert">
          Không thể lưu giao diện. Lựa chọn chỉ áp dụng trong phiên hiện tại.
        </p>
      )}
    </section>
  );
}
