import { useRef, type PointerEvent, type MouseEvent } from 'react';
/** Horizontal intent wins only after 56px and a 1.5x axis ratio; vertical scroll stays native. */
export function useMonthSwipe(onMove: (delta: number) => void) {
  const consumed = useRef(false);
  const start = useRef<{ x: number; y: number; time: number } | null>(null);
  return {
    onPointerDown: (e: PointerEvent) => {
      consumed.current = false;
      if (e.button === 0) start.current = { x: e.clientX, y: e.clientY, time: Date.now() };
    },
    onClickCapture: (e: MouseEvent) => {
      if (consumed.current && e.detail > 0) {
        e.preventDefault();
        e.stopPropagation();
      }
      consumed.current = false;
    },
    onPointerCancel: () => {
      start.current = null;
    },
    onPointerUp: (e: PointerEvent) => {
      const s = start.current;
      start.current = null;
      if (!s) return;
      const dx = e.clientX - s.x,
        dy = e.clientY - s.y;
      if (Date.now() - s.time < 650 && Math.abs(dx) >= 56 && Math.abs(dx) > Math.abs(dy) * 1.5) {
        consumed.current = true;
        onMove(dx < 0 ? 1 : -1);
      }
    },
  };
}
