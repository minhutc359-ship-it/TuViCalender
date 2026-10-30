export type RandomSource = () => number;
export const secureRandom: RandomSource = () =>
  crypto.getRandomValues(new Uint32Array(1))[0] / 4294967296;
export function shuffle<T>(items: readonly T[], random: RandomSource = secureRandom): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const value = random();
    if (value < 0 || value >= 1 || !Number.isFinite(value))
      throw new RangeError('Invalid random source');
    const j = Math.floor(value * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
