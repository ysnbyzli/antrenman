'use client';
// Week pills, month calendar, 8-week chart and confetti: the "how consistent am I" visuals.
import { useState } from 'react';
import { cx } from '@/lib/cx';
import { gymDay, gymOn, monday, nextGym, sameDay } from '@/lib/domain';
import type { Workout } from '@/lib/types';
import { NavLink } from './shell';
import { card, small } from './ui';

const DAYS = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

/** This week, Monday to Sunday: done days filled, planned gym days show which workout is next. */
export function WeekPills({ history, now }: { history: Workout[]; now: number }) {
  const first = nextGym(history);
  const week = DAYS.map((n, i) => {
    const d = monday(now);
    d.setDate(d.getDate() + i);
    const today = sameDay(d, now);
    return { n, d, today, gym: gymOn(history, d), home: history.some(h => h.home && sameDay(h.end, d)), past: d.getTime() < now && !today };
  });
  // gym days still ahead this week, in order: they alternate starting from the next workout
  const planned = week.filter(x => !x.gym && !x.home && gymDay(x.d) && !x.past).map(x => x.n);
  return (
    <div className="grid grid-cols-7 justify-items-center" role="list" aria-label="Bu haftanın günleri">
      {week.map(({ n, d, today, gym, home, past }) => {
        const order = planned.indexOf(n), nx = order % 2 === 0 ? first : first === 'A' ? 'B' : 'A';
        const [cls, txt, label] = gym ? ['bg-flame text-white', '✓', `${gym.name} tamamlandı`]
          : home ? ['bg-ok-bg text-ok', '✓', 'ev rutini tamamlandı']
          : gymDay(d) && past ? ['bg-fill text-muted', '–', 'yapılmadı']
          : order >= 0 ? ['border-[1.5px] border-dashed border-line-2 text-fg', nx, `Full Body ${nx} planlı`]
          : ['bg-fill text-muted', '', 'boş gün'];
        return (
          <div key={n} role="listitem" aria-label={`${n}: ${label}`} className="flex flex-col items-center gap-2 text-xs text-muted">
            <span className={cx(today && 'font-bold text-fg')}>{n}</span>
            <i className={cx('grid size-9 place-items-center rounded-full text-sm font-semibold not-italic', cls, today && !gym && 'ring-2 ring-fg ring-offset-2 ring-offset-surface')}>{txt}</i>
          </div>
        );
      })}
    </div>
  );
}

/** Month grid; gym days link to that workout. */
export function Calendar({ history, now }: { history: Workout[]; now: number }) {
  const [back, setBack] = useState(0); // months back from the current one
  const f = new Date(now);
  f.setHours(0, 0, 0, 0);
  f.setDate(1);
  f.setMonth(f.getMonth() - back);
  const n = new Date(f.getFullYear(), f.getMonth() + 1, 0).getDate(), lead = (f.getDay() + 6) % 7;
  const cell = 'grid size-9 place-items-center rounded-full num text-sm font-medium no-underline';
  const ring = 'shadow-[0_0_0_2px_var(--bg),0_0_0_3.5px_var(--g1000)]';
  const arrow = 'grid size-11 cursor-pointer place-items-center rounded-full text-xl text-muted active:bg-fill disabled:invisible';
  return (
    <div className={card}>
      <div className="flex items-center justify-between">
        <button type="button" className={arrow} aria-label="Önceki ay" onClick={() => setBack(back + 1)}>‹</button>
        <strong>{f.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}</strong>
        <button type="button" className={arrow} aria-label="Sonraki ay" disabled={!back} onClick={() => setBack(back - 1)}>›</button>
      </div>
      <div className="mt-2.5 grid grid-cols-7 justify-items-center gap-1">
        {['P', 'S', 'Ç', 'P', 'C', 'C', 'P'].map((x, i) => <span key={i} className="h-6 text-xs text-muted">{x}</span>)}
        {Array.from({ length: lead }, (_, i) => <span key={`b${i}`} />)}
        {Array.from({ length: n }, (_, i) => {
          const d = new Date(f);
          d.setDate(i + 1);
          const g = gymOn(history, d), hm = !g && history.some(h => h.home && sameDay(h.end, d)), today = sameDay(d, now);
          return g ? (
            <NavLink key={i} href={`/history/detail?id=${g.id}`} aria-label={`${i + 1}: ${g.name}`} className={cx(cell, 'bg-fg font-semibold text-surface', today && ring)}>
              {i + 1}
            </NavLink>
          ) : (
            <span key={i} aria-label={hm ? `${i + 1}: ev rutini` : undefined} className={cx(cell, hm ? 'bg-ok-bg text-ok' : 'text-muted', today && ring)}>
              {i + 1}
            </span>
          );
        })}
      </div>
      <p className={cx(small, 'mt-3 text-center')}>
        <span className="mr-1.5 inline-block size-2.5 rounded-full bg-fg" />Salon
        <span className="mr-1.5 ml-4 inline-block size-2.5 rounded-full bg-ok" />Ev rutini
      </p>
    </div>
  );
}

/** Gym workouts per week for the last 8 weeks; weeks that reached the goal are highlighted. */
export function WeeksChart({ history, goal }: { history: Workout[]; goal: number }) {
  const weeks = Array.from({ length: 8 }, (_, i) => {
    const d = monday();
    d.setDate(d.getDate() - 7 * (7 - i));
    return [d, history.filter(h => !h.home && monday(h.end).getTime() === d.getTime()).length] as const;
  });
  const mx = Math.max(goal, ...weeks.map(w => w[1]));
  return (
    <div className={card}>
      <div className="flex h-[116px] items-end gap-1.5" role="img" aria-label={`Son 8 haftanın antrenman sayıları: ${weeks.map(w => w[1]).join(', ')}`}>
        {weeks.map(([d, n]) => (
          <div key={d.getTime()} className="flex flex-1 flex-col items-center justify-end gap-1 text-[11px] text-muted">
            <span className="num">{n || ''}</span>
            <i className={cx('w-full max-w-7 rounded-md', n >= goal ? 'bg-flame' : 'bg-fill-2')} style={{ height: Math.max(4, (n / mx) * 72) }} />
            <span className="num">{d.getDate()}.{d.getMonth() + 1}</span>
          </div>
        ))}
      </div>
      <p className={cx(small, 'mt-2.5 text-center')}><span className="mr-1.5 inline-block size-2.5 rounded-[3px] bg-flame" />Hedefe ulaşılan hafta</p>
    </div>
  );
}

const CONFETTI = ['bg-flame', 'bg-ok', 'bg-info', 'bg-fg'];
/** One burst of falling confetti. Hidden when the user prefers reduced motion. */
export function Confetti() {
  return (
    <div className="pointer-events-none fixed inset-0 z-9 overflow-hidden motion-reduce:hidden" aria-hidden="true">
      {Array.from({ length: 30 }, (_, i) => (
        <i key={i} className={cx('absolute -top-4 h-[13px] w-2 animate-fall rounded-xs opacity-0', CONFETTI[i % 4])}
          style={{ left: `${(i * 37) % 100}%`, animationDelay: `${(i % 7) * 70}ms`, animationDuration: `${1500 + (i % 5) * 200}ms` }} />
      ))}
    </div>
  );
}
