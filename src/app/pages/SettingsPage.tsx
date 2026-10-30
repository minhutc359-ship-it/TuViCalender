import { Check, Palette, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router';
import { TAROT_CARDS } from '../../features/tarot/data/cards';
import {
  JOJO_REFERENCES,
  JOJO_MAPPING_SOURCE,
  type TarotAppearanceId,
} from '../../features/tarot/data/appearance';
import { useTarotAppearance } from '../../features/tarot/context/TarotAppearance';
import { TarotArtwork } from '../../features/tarot/components/TarotArtwork';
import { ReadingMethod } from '../../features/tarot/components/ReadingMethod';
import { OfflineSettings } from '../components/OfflineSettings';

export default function SettingsPage() {
  const { appearance, setAppearance, storageError } = useTarotAppearance();
  const options: { id: TarotAppearanceId; name: string; description: string; cards: number[] }[] = [
    {
      id: 'celestial-v1',
      name: 'Celestial · Huyền Tinh',
      description: 'Navy, vàng cổ và biểu tượng thiên văn cho hành trình chiêm nghiệm.',
      cards: [0, 2, 1],
    },
    {
      id: 'jojo-ref',
      name: 'JoJo ref',
      description:
        'Đủ 78 minh họa JoJo: 22 đối ứng Tarot chính thức và 56 liên tưởng mỹ thuật cho Minor.',
      cards: [22, 17, 77],
    },
  ];
  return (
    <div className="settings-page page-enter">
      <div className="page-heading">
        <div>
          <span className="eyebrow">KHÔNG GIAN THEO CÁCH CỦA BẠN</span>
          <h1>
            Cài đặt<span className="gold">.</span>
          </h1>
          <p>Chọn bộ minh họa Tarot bạn muốn đồng hành.</p>
        </div>
        <Palette className="gold" size={28} />
      </div>
      <fieldset className="appearance-fieldset">
        <legend>Minh họa thẻ bài Tarot</legend>
        <div className="appearance-options">
          {options.map((option) => (
            <label
              className={`appearance-option panel ${appearance === option.id ? 'selected' : ''}`}
              key={option.id}
            >
              <input
                type="radio"
                name="tarot-appearance"
                value={option.id}
                checked={appearance === option.id}
                onChange={() => setAppearance(option.id)}
                aria-label={option.name}
              />
              <div className="appearance-preview" aria-hidden="true">
                {option.cards.map((index) => (
                  <TarotArtwork key={index} card={TAROT_CARDS[index]} appearance={option.id} />
                ))}
              </div>
              <div className="appearance-description">
                <span className="appearance-option-heading">
                  <strong>{option.name}</strong>
                  {appearance === option.id && <Check size={18} />}
                </span>
                <p>{option.description}</p>
                <small>
                  {option.id === 'jojo-ref'
                    ? 'Major: đối ứng trong truyện · Minor: liên tưởng mỹ thuật'
                    : 'Đủ 78 lá · Artwork biểu tượng Celestial'}
                </small>
              </div>
            </label>
          ))}
        </div>
      </fieldset>
      <p className="success small" role="status">
        {storageError
          ? ''
          : `Đang dùng ${appearance === 'jojo-ref' ? 'JoJo ref' : 'Celestial · Huyền Tinh'}. Lựa chọn được lưu trên trình duyệt này.`}
      </p>
      {storageError && (
        <p className="error-message" role="alert">
          Không thể lưu cài đặt. Lựa chọn chỉ có hiệu lực trong phiên hiện tại.
        </p>
      )}
      <div className="settings-explanation panel">
        <h2>Đổi minh họa, giữ nguyên lá bài</h2>
        <p>
          Bộ Tarot vẫn có 78 lá, cùng xác suất rút, nghĩa xuôi/ngược và kiểu trải. Cài đặt áp dụng
          khi lật bài, tra thư viện, xem trang chủ và mở lại nhật ký.
        </p>
        <p>
          Trong Stardust Crusaders, nhóm Tarot đối ứng với 22 Major Arcana. Ví dụ The Star → Star
          Platinum / Jotaro Kujo; The World → The World / DIO; The Fool → The Fool / Iggy. Các Stand
          và các nhân vật ở những phần khác chỉ được chọn làm minh họa cho 56 Minor theo liên tưởng
          mỹ thuật; đây không phải bảng đối ứng chính thức và không làm thay đổi ý nghĩa Tarot.
        </p>
        <Link className="button primary" to="/tarot">
          Khám phá bộ bài
          <ArrowUpRight size={16} />
        </Link>
        <a className="text-link small" href={JOJO_MAPPING_SOURCE} target="_blank" rel="noreferrer">
          Nguồn đối ứng và hình tham chiếu: JoJo Wiki
        </a>
      </div>
      <details className="jojo-reference-list panel">
        <summary>Bảng đối ứng 22 lá Major Arcana</summary>
        <div className="jojo-reference-table">
          <table>
            <thead>
              <tr>
                <th>Lá Tarot</th>
                <th>Stand</th>
                <th>Nhân vật</th>
              </tr>
            </thead>
            <tbody>
              {JOJO_REFERENCES.map((reference) => (
                <tr key={reference.cardId}>
                  <td>{TAROT_CARDS.find((card) => card.id === reference.cardId)!.name}</td>
                  <td>{reference.stand}</td>
                  <td>{reference.user}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
      <ReadingMethod />
      <OfflineSettings />
    </div>
  );
}
