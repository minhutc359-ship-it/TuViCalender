import { useEffect, useMemo, useState, type CSSProperties } from 'react';
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
  const animeFallback =
    card.suit === 'cups'
      ? '/assets/anime/tarot/love-reflection.webp'
      : card.suit === 'pentacles' || card.suit === 'swords'
        ? '/assets/anime/tarot/career-reflection.webp'
        : '/assets/anime/tarot/self-reflection.webp';
  const sources = useMemo(
    () => [...new Set([imagePath, card.imagePath, animeFallback])],
    [imagePath, card.imagePath, animeFallback],
  );
  const [sourceIndex, setSourceIndex] = useState(0);
  useEffect(() => setSourceIndex(0), [card.id, imagePath]);
  const activeReference = sourceIndex === 0 ? reference : undefined;
  const alt = activeReference
    ? `${card.name} · ${activeReference.stand} · ${activeReference.user}${reversed ? ', lá ngược' : ''}`
    : `${card.nameVi}${reversed ? ', lá ngược' : ''}`;
  return (
    <div
      className={`tarot-artwork ${activeReference ? 'jojo-artwork' : ''} ${reversed ? 'reversed-art' : ''}`}
      style={activeReference ? ({ '--stand-accent': activeReference.accent } as CSSProperties) : undefined}
    >
      {activeReference && (
        <>
          <div className="jojo-card-number" aria-hidden="true">
            {card.number === 0 ? '0' : String(card.number).padStart(2, '0')}
            <b>
              {activeReference.association === 'canonical'
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
      <img
        src={sources[sourceIndex]}
        alt={alt}
        loading={lazy ? 'lazy' : 'eager'}
        draggable="false"
        onError={() => {
          if (sourceIndex < sources.length - 1) setSourceIndex((index) => index + 1);
        }}
      />
      {activeReference && (
        <>
          {activeReference.userImage && (
            <img
              className="jojo-user-portrait"
              src={activeReference.userImage}
              alt=""
              aria-hidden="true"
              loading={lazy ? 'lazy' : 'eager'}
              onError={(event) => {
                event.currentTarget.hidden = true;
              }}
            />
          )}
          <div className="jojo-card-caption" aria-hidden="true">
            <small>{card.name.toUpperCase()}</small>
            <b>{activeReference.stand}</b>
            <em>{activeReference.user}</em>
          </div>
        </>
      )}
    </div>
  );
}
