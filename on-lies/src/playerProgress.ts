export const TRACKED_GAMES = ['mail', 'messages', 'phone', 'family'] as const;

export function readCompletedGames(raw: string | null): Set<string> {
  try {
    const saved: unknown = JSON.parse(raw || '[]');
    if (!Array.isArray(saved)) return new Set();
    return new Set(saved.map(mode => mode === 'inspector' ? 'mail' : mode)
      .filter(mode => typeof mode === 'string' && (TRACKED_GAMES as readonly string[]).includes(mode)));
  } catch {
    return new Set();
  }
}

const LEVELS = [
  { xp: 0, title: 'Tân binh' },
  { xp: 1000, title: 'Đặc vụ Thực tập' },
  { xp: 2000, title: 'Chuyên viên an ninh' },
  { xp: 3000, title: 'Cảnh sát mạng' },
  { xp: 4000, title: 'Thanh tra cấp 5' },
];

export function getLevelProgress(xp: number) {
  const total = Number.isFinite(xp) ? Math.max(0, xp) : 0;
  const index = LEVELS.findLastIndex(level => total >= level.xp);
  const current = LEVELS[index];
  const next = LEVELS[index + 1];
  return {
    level: index + 1, role_title: current.title, nextXp: next?.xp ?? null,
    percent: next ? Math.round((total - current.xp) / (next.xp - current.xp) * 100) : 100,
  };
}
