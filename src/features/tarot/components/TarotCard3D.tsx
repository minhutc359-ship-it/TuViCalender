import { CARD_MAP } from '../data/cards';
import { getCardBack } from '../data/appearance';
import { useTarotAppearance } from '../context/TarotAppearance';
import { TarotArtwork } from './TarotArtwork';
import type { DrawnCard } from '../engine/draw';
export function TarotCard3D({
  card,
  revealed,
  onClick,
}: {
  card?: DrawnCard;
  revealed: boolean;
  onClick?: () => void;
}) {
  const data = card ? CARD_MAP.get(card.cardId) : undefined;
  const { appearance } = useTarotAppearance();
  const content = (
    <span className={`card-flipper ${revealed ? 'is-revealed' : ''}`}>
      <span className="card-face card-back" aria-hidden={revealed}>
        <img
          src={getCardBack(appearance)}
          alt={`Mặt lưng ${appearance === 'jojo-ref' ? 'JoJo ref' : 'Celestial Tarot'}`}
          draggable="false"
        />
      </span>
      <span className="card-face card-front" aria-hidden={!revealed}>
        {data && <TarotArtwork card={data} reversed={card?.reversed} />}
      </span>
    </span>
  );
  return onClick ? (
    <button className="tarot-card3d" onClick={onClick} aria-label={`Phóng to ${data?.nameVi}`}>
      {content}
    </button>
  ) : (
    <span className="tarot-card3d">{content}</span>
  );
}
