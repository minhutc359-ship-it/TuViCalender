export function vietnamDateKey(date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  return ['year', 'month', 'day']
    .map((type) => parts.find((p) => p.type === type)!.value)
    .join('-');
}

export function vietnamToday() {
  const [year, month, day] = vietnamDateKey().split('-').map(Number);
  return new Date(year, month - 1, day, 12);
}

export function stableHash(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) hash = Math.imul(hash ^ value.charCodeAt(i), 16777619);
  return hash >>> 0;
}

export function dailyScores(date: string, profile: string) {
  return ['fortune', 'love', 'career', 'wellbeing'].map(
    (kind) => 5 + (stableHash(`${date}|${profile}|${kind}`) % 6),
  );
}
