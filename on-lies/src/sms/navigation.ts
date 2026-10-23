import type { ScenarioItem, UserAnswer } from '../types';

export interface SmsContinuation {
  kind: 'item' | 'round' | 'results';
  label: string;
  itemId?: number;
}

export function getSmsContinuation(
  items: ScenarioItem[], answers: UserAnswer[], activeId: number, round: number, lives: number,
): SmsContinuation {
  if (lives <= 0) return { kind: 'results', label: 'Xem kết quả →' };
  const answered = new Set(answers.map(answer => answer.item.id));
  const current = items.findIndex(item => item.id === activeId);
  const ordered = [...items.slice(current + 1), ...items.slice(0, current + 1)];
  const next = ordered.find(item => !answered.has(item.id));
  if (next) return { kind: 'item', itemId: next.id, label: 'Tin chưa xử lý tiếp theo →' };
  return round < 3 ? { kind: 'round', label: `Sang vòng ${round + 1} →` } : { kind: 'results', label: 'Xem kết quả →' };
}
