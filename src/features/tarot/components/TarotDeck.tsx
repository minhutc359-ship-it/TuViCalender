import { motion, useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { getCardBack } from '../data/appearance';
import { useTarotAppearance } from '../context/TarotAppearance';
import type { DrawnCard } from '../engine/draw';
export function TarotDeck({
  deck,
  shuffling,
  disabled,
  onChoose,
}: {
  deck: DrawnCard[];
  shuffling: boolean;
  disabled: boolean;
  onChoose: (id: string) => void;
}) {
  const reduced = useReducedMotion();
  const { appearance } = useTarotAppearance();
  const container = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(730);
  useEffect(() => {
    if (!container.current) return;
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(container.current);
    return () => observer.disconnect();
  }, []);
  const visibleCount = width <= 420 ? 12 : 18;
  return (
    <div
      ref={container}
      className={`deck-fan ${shuffling ? 'is-shuffling' : ''}`}
      aria-label="Bộ bài để chọn"
      aria-busy={shuffling}
    >
      {(shuffling
        ? Array.from({ length: 9 }, (_, i) => ({ cardId: String(i), reversed: false }))
        : deck.slice(0, visibleCount)
      ).map((card, index, cards) => {
        const offset = index - (cards.length - 1) / 2;
        return (
          <motion.button
            key={shuffling ? `shuffle-${index}` : card.cardId}
            className="deck-card"
            disabled={disabled || shuffling}
            initial={false}
            animate={
              shuffling
                ? {
                    x: reduced ? 0 : [0, (index % 2 ? 1 : -1) * 65, 0],
                    y: index * -1,
                    rotate: reduced ? 0 : [0, offset * 4, 0],
                  }
                : {
                    x: offset * Math.min(29, Math.max(8, (width - 170) / (cards.length - 1))),
                    y: Math.abs(offset) ** 1.7 * 1.2,
                    rotate: offset * 4,
                  }
            }
            transition={{ duration: shuffling ? 0.45 : 0.6, repeat: shuffling && !reduced ? 1 : 0 }}
            onClick={() => onChoose(card.cardId)}
            aria-label={`Chọn lá bài úp ${index + 1}`}
          >
            <img src={getCardBack(appearance)} alt="" draggable="false" />
          </motion.button>
        );
      })}
    </div>
  );
}
