'use client';
import { useState } from 'react';
import { Icon } from '@/components/icons';
import { NavLink, Page } from '@/components/shell';
import { Card, Chevron, H2, Segmented, btn, card, h1, small } from '@/components/ui';
import { cx } from '@/lib/cx';
import { monday, volume } from '@/lib/domain';
import { dur, fmtDate, kgs, nf } from '@/lib/format';
import { useNow } from '@/lib/hooks';
import { useStore } from '@/lib/store';
import type { Workout } from '@/lib/types';

type Filter = 'all' | 'gym' | 'home';
const FILTERS: [Filter, string][] = [['all', 'Tümü'], ['gym', 'Salon'], ['home', 'Ev']];
const monthKey = (t: number) => { const d = new Date(t); return d.getFullYear() * 12 + d.getMonth(); };

/** One workout as its own card: icon, name and date, duration pill. */
function Entry({ h }: { h: Workout }) {
  const v = volume(h);
  return (
    <NavLink href={`/history/detail?id=${h.id}`} className={cx(card, 'flex items-center gap-3.5 p-3.5 no-underline active:bg-fill')}>
      <span className="grid size-12 flex-none place-items-center rounded-2xl bg-fill-2">
        <Icon name={h.home ? 'homeF' : 'dumbbellF'} className={cx('size-6', h.home ? 'text-ok' : 'text-flame')} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">{h.name}</p>
        <p className={small}>{fmtDate(h.end)}</p>
        {(v > 0 || !!h.prs?.length) && (
          <p className="num mt-0.5 text-sm text-muted">
            {v > 0 && kgs(v)}{v > 0 && !!h.prs?.length && ' · '}{!!h.prs?.length && <span className="font-semibold text-flame">{h.prs.length} rekor</span>}
          </p>
        )}
      </div>
      <span className="num rounded-full bg-fill-2 px-3 py-1 text-sm font-semibold">{dur(h.end - h.start)}</span>
      <Chevron />
    </NavLink>
  );
}

export default function HistoryPage() {
  const s = useStore(), now = useNow();
  const [filter, setFilter] = useState<Filter>('all');
  if (!s) return <Page>{null}</Page>;
  if (!s.history.length) {
    return (
      <Page>
        <h1 className={h1}>Geçmiş</h1>
        <Card className="mt-5"><p className="text-muted">Henüz tamamlanan antrenman yok. İlk antrenmanını bitirdiğinde burada görünecek.</p></Card>
      </Page>
    );
  }

  const gym = s.history.filter(h => !h.home), month = gym.filter(h => monthKey(h.end) === monthKey(now));
  // lifted weight per week, last 8 weeks
  const weeks = Array.from({ length: 8 }, (_, i) => {
    const d = monday(now);
    d.setDate(d.getDate() - 7 * (7 - i));
    return [d, gym.filter(h => monday(h.end).getTime() === d.getTime()).reduce((n, h) => n + volume(h), 0)] as const;
  });
  const peak = Math.max(1, ...weeks.map(w => w[1]));
  const groups: { k: number; t: number; items: Workout[] }[] = [];
  s.history.filter(h => filter === 'all' || (filter === 'home') === !!h.home).forEach(h => {
    const k = monthKey(h.end);
    if (groups.at(-1)?.k !== k) groups.push({ k, t: h.end, items: [] });
    groups.at(-1)!.items.push(h);
  });

  return (
    <Page>
      <div className="flex items-center justify-between gap-2.5">
        <h1 className={h1}>Geçmiş</h1>
        <NavLink href="/streak" className={btn({ className: 'min-h-11 bg-surface! px-4' })}><Icon name="cal" />Takvim</NavLink>
      </div>

      {/* this month at a glance, with the weekly lifted weight underneath */}
      <Card className="mt-5">
        <p className={small}>Bu ay kaldırılan</p>
        <p className="num mt-0.5 text-[40px] leading-none font-bold tracking-[-.02em]">
          {(v => (v >= 1000 ? nf((v / 1000).toFixed(1)) : Math.round(v)))(month.reduce((n, h) => n + volume(h), 0))}
          <span className="text-xl font-semibold text-muted"> {month.reduce((n, h) => n + volume(h), 0) >= 1000 ? 'ton' : 'kg'}</span>
        </p>
        <p className={cx(small, 'num mt-1.5')}>{month.length} antrenman · {dur(month.reduce((n, h) => n + h.end - h.start, 0))}</p>
        <div className="mt-5 flex h-[104px] items-end gap-2" role="img" aria-label={`Son 8 haftada haftalık kaldırılan ağırlık: ${weeks.map(w => kgs(w[1])).join(', ')}`}>
          {weeks.map(([d, v], i) => (
            <div key={d.getTime()} className="flex flex-1 flex-col items-center justify-end gap-1.5 text-[11px] text-muted">
              <i className={cx('w-full rounded-lg', i === 7 ? 'bg-flame' : v ? 'bg-fill-2' : 'bg-fill')} style={{ height: Math.max(4, (v / peak) * 78) }} />
              <span className="num">{d.getDate()}.{d.getMonth() + 1}</span>
            </div>
          ))}
        </div>
      </Card>

      <Segmented className="mt-5 self-start" label="Filtre" options={FILTERS} value={filter} onChange={setFilter} />
      {groups.length ? groups.map(g => (
        <section key={g.k}>
          <H2 className="flex items-baseline justify-between gap-2.5">
            <span>{new Date(g.t).toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}</span>
            <span className="num text-sm font-normal text-muted">{g.items.length} antrenman</span>
          </H2>
          <div className="grid gap-2">{g.items.map(h => <Entry key={h.id} h={h} />)}</div>
        </section>
      )) : <p className={cx(small, 'mt-5')}>Bu filtrede kayıt yok.</p>}
    </Page>
  );
}
