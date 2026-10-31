import { useEffect, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import { useVisualTheme } from '../../../app/components/astro/VisualTheme';
import { createDeck, dailyCard, type DrawnCard } from '../engine/draw';
import { getSpread, type SpreadId } from '../data/spreads';
import type { Reading } from '../engine/reading';
import { vietnamDateKey } from '../../../lib/date';
import type { TopicSelection } from '../data/reading-topics';

export function useTarotSession() {
  const [phase, setPhase] = useState<'idle' | 'shuffling' | 'picking' | 'revealing' | 'complete'>(
    'idle',
  );
  const [deck, setDeck] = useState<DrawnCard[]>([]);
  const [reading, setReading] = useState<Reading | null>(null);
  const [revealed, setRevealed] = useState(0);
  const systemReduced = useReducedMotion();
  const { motion } = useVisualTheme();
  const reduced = systemReduced || motion === 'calm';
  useEffect(() => {
    if (phase !== 'shuffling') return;
    const timer = setTimeout(() => setPhase('picking'), reduced ? 80 : 1000);
    return () => clearTimeout(timer);
  }, [phase, reduced]);
  useEffect(() => {
    if (phase !== 'revealing' || !reading) return;
    if (revealed === reading.cards.length) {
      setPhase('complete');
      return;
    }
    const timer = setTimeout(() => setRevealed((n) => n + 1), reduced ? 60 : 650);
    return () => clearTimeout(timer);
  }, [phase, reading, revealed, reduced]);
  function start(
    spreadId: SpreadId,
    question: string,
    allowReversed: boolean,
    profileId: string,
    topic: TopicSelection = 'auto',
  ) {
    const daily = spreadId === 'daily';
    const todayCard = dailyCard(vietnamDateKey(), profileId);
    setReading({
      id: crypto.randomUUID(),
      deckId: 'celestial-v1',
      spreadId,
      question: question.trim(),
      cards: daily ? [{ ...todayCard, reversed: allowReversed && todayCard.reversed }] : [],
      createdAt: new Date().toISOString(),
      note: '',
      profileId,
      topic,
    });
    setDeck(daily ? [] : createDeck(allowReversed));
    setRevealed(0);
    setPhase('shuffling');
  }
  function choose(cardId: string) {
    if (
      phase !== 'picking' ||
      !reading ||
      reading.cards.length >= getSpread(reading.spreadId).positions.length
    )
      return;
    const card = deck.find((c) => c.cardId === cardId);
    if (!card) return;
    setReading({ ...reading, cards: [...reading.cards, card] });
    setDeck(deck.filter((c) => c.cardId !== cardId));
  }
  return {
    skipAnimation: () => {
      if (phase === 'shuffling') setPhase('picking');
      if (phase === 'revealing' && reading) {
        setRevealed(reading.cards.length);
        setPhase('complete');
      }
    },
    phase,
    deck,
    reading,
    revealed,
    start,
    choose,
    reveal: () => setPhase('revealing'),
    reset: () => {
      setPhase('idle');
      setReading(null);
      setDeck([]);
      setRevealed(0);
    },
  };
}
