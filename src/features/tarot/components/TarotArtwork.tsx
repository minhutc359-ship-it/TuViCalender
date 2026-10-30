import type { CSSProperties } from 'react';
import type { TarotCard } from '../data/cards';
import { getCardAppearance, type TarotAppearanceId } from '../data/appearance';
import { useTarotAppearance } from '../context/TarotAppearance';

/** The same presentation is used in flips, the library, previews and journal. */
export function TarotArtwork({
  card,
  reversed = false,
  lazy = false,
  appearance: override,
}: {
  card: TarotCard;
  reversed?: boolean;
  lazy?: boolean;
  appearance?: TarotAppearanceId;
}) {
  const { appearance } = useTarotAppearance();
  const { imagePath, reference } = getCardAppearance(card, override ?? appearance);
  const alt = reference
    ? `${card.name} · ${reference.stand} · ${reference.user}${reversed ? ', lá ngược' : ''}`
    : `${card.nameVi}${reversed ? ', lá ngược' : ''}`;
  return (
    <div
      className={`tarot-artwork ${reference ? 'jojo-artwork' : ''} ${reversed ? 'reversed-art' : ''}`}
      style={reference ? ({ '--stand-accent': reference.accent } as CSSProperties) : undefined}
    >
      {reference && (
        <>
          <div className="jojo-card-number" aria-hidden="true">
            {card.number === 0 ? '0' : String(card.number).padStart(2, '0')}
            <b>
              {reference.association === 'canonical'
                ? 'STARDUST CRUSADERS'
                : 'JOJO REF · MINOR ART'}
            </b>
            <i>✦</i>
          </div>
          <div className="jojo-card-orbit" aria-hidden="true" />
          <div className="jojo-sound-effect" aria-hidden="true">
            ゴゴゴ
          </div>
        </>
      )}
      <img src={imagePath} alt={alt} loading={lazy ? 'lazy' : 'eager'} draggable="false" />
      {reference && (
        <>
          {reference.userImage && (
            <img
              className="jojo-user-portrait"
              src={reference.userImage}
              alt=""
              aria-hidden="true"
              loading={lazy ? 'lazy' : 'eager'}
            />
          )}
          <div className="jojo-card-caption" aria-hidden="true">
            <small>{card.name.toUpperCase()}</small>
            <b>{reference.stand}</b>
            <em>{reference.user}</em>
          </div>
        </>
      )}
    </div>
  );
}
