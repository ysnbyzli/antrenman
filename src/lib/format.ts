import type { Target, Unit, WSet } from './types';

const NBSP = ' ';

/** Turkish decimal comma. */
export const nf = (v: number | string) => String(v).replace('.', ',');
export const hasKg = (s: Pick<WSet, 'kg'>) => s.kg !== '' && s.kg != null;

export const fmtDate = (t: number, o: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' }) =>
  new Date(t).toLocaleDateString('tr-TR', o);
export const fmtTime = (t: number) => new Date(t).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

/** m:ss or h:mm:ss, rounded up so a countdown never shows 0:00 early. */
export function clock(ms: number) {
  const s = Math.max(0, Math.ceil(ms / 1000)), h = Math.floor(s / 3600), m = Math.floor(s / 60) % 60, x = String(s % 60).padStart(2, '0');
  return h ? `${h}:${String(m).padStart(2, '0')}:${x}` : `${m}:${x}`;
}
export const mins = (ms: number) => `${Math.max(1, Math.round(ms / 60000))}${NBSP}dk`;
export function dur(ms: number) {
  const m = Math.round(ms / 6e4);
  return m >= 60 ? `${Math.floor(m / 60)}${NBSP}sa ${m % 60}${NBSP}dk` : `${m}${NBSP}dk`;
}
export const kgs = (v: number) => (v >= 1000 ? `${nf((v / 1000).toFixed(1))}${NBSP}ton` : `${Math.round(v)}${NBSP}kg`);

export const unitLabel = (u: Unit) => (u === 'sn' ? 'saniye' : u === 'taraf' ? 'tekrar / taraf' : 'tekrar');
export const targetText = (t: Target) =>
  `${t.max ? `${t.sets}–${t.max}` : t.sets} × ${t.reps}${t.unit === 'sn' ? `${NBSP}sn` : t.unit === 'taraf' ? ' / taraf' : ''}`;
export const setText = (s: WSet, u: Unit) =>
  hasKg(s) ? `${nf(s.kg)}${NBSP}kg × ${s.reps}` : `${s.reps}${NBSP}${u === 'sn' ? 'sn' : 'tekrar'}`;

/** Parse user input that may use a decimal comma. NaN when not a number. */
export const parseNum = (v: string) => parseFloat(v.trim().replace(',', '.'));
