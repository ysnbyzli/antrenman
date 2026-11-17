'use client';
import { useState } from 'react';
import { Icon } from '@/components/icons';
import { NavLink, Page } from '@/components/shell';
import { Badge, Card, Chevron, Group, H2, Stat, btn, h1, row, rowTap, small } from '@/components/ui';
import { cx } from '@/lib/cx';
import { volume } from '@/lib/domain';
import { dur, kgs, mins, nf } from '@/lib/format';
import { useNow } from '@/lib/hooks';
import { useStore } from '@/lib/store';
import type { Workout } from '@/lib/types';

type Filter = 'all' | 'gym' | 'home';
const FILTERS: [Filter, string][] = [['all', 'Tümü'], ['gym', 'Salon'], ['home', 'Ev']];
const monthKey = (t: number) => { const d = new Date(t); return d.getFullYear() * 12 + d.getMonth(); };

function Row({ h }: { h: Workout }) {
  const d = new Date(h.end), sets = h.ex.reduce((n, e) => n + e.sets.length, 0), v = volume(h);
  return (
    <NavLink href={`/history/detail?id=${h.id}`} className={cx(row, rowTap)}>
      <span className={cx('flex h-12 w-11 flex-none flex-col items-center justify-center rounded-xl leading-[1.15]', h.home ? 'bg-ok-bg text-ok' : 'bg-fg text-surface')}>
        <b className="num text-[17px]">{d.getDate()}</b>
        <span className="text-[11px] opacity-70">{d.toLocaleDateString('tr-TR', { weekday: 'short' })}</span>
      </span>
      <div className="min-w-0 flex-1">
        <strong className="font-semibold">{h.name}</strong>
        <p className={cx(small, 'tabular-nums whitespace-nowrap')}>{mins(h.end - h.start)}{sets > 0 && ` · ${sets} set`}{v > 0 && ` · ${kgs(v)}`}</p>
      </div>
      {!!h.prs?.length && <Badge ok>{h.prs.length} rekor</Badge>}
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
        <Card className="mt-4"><p className="text-muted">Henüz tamamlanan antrenman yok. İlk antrenmanını bitirdiğinde burada görünecek.</p></Card>
      </Page>
    );
  }

  const month = s.history.filter(h => !h.home && monthKey(h.end) === monthKey(now));
  const minutes = Math.round(month.reduce((n, h) => n + h.end - h.start, 0) / 6e4), vol = month.reduce((n, h) => n + volume(h), 0);
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
        <NavLink href="/streak" className={btn({ className: 'min-h-10 rounded-full! px-3.5' })}><Icon name="cal" />Takvim</NavLink>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2.5">
        <Stat label="Bu ay" value={month.length} foot="antrenman" />
        <Stat label="Süre" value={minutes >= 60 ? nf((minutes / 60).toFixed(1)) : minutes} unit={minutes >= 60 ? 'sa' : 'dk'} foot="bu ay" />
        <Stat label="Kaldırılan" value={vol >= 1000 ? nf((vol / 1000).toFixed(1)) : Math.round(vol)} unit={vol >= 1000 ? 'ton' : 'kg'} foot="bu ay" />
      </div>
      <div role="group" aria-label="Filtre" className="mt-4 flex gap-2">
        {FILTERS.map(([k, name]) => (
          <button key={k} type="button" aria-pressed={filter === k} onClick={() => setFilter(k)}
            className={cx('min-h-9 cursor-pointer rounded-full border px-3.5 text-sm font-[550]', filter === k ? 'border-fg bg-fg text-surface' : 'border-line bg-surface')}>
            {name}
          </button>
        ))}
      </div>
      {groups.length ? groups.map(g => (
        <section key={g.k}>
          <H2 className="flex items-center justify-between gap-2.5">
            <span>{new Date(g.t).toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}</span>
            <span className="num font-normal tracking-normal normal-case">{g.items.length} antrenman · {dur(g.items.reduce((n, h) => n + h.end - h.start, 0))}</span>
          </H2>
          <Group>{g.items.map(h => <Row key={h.id} h={h} />)}</Group>
        </section>
      )) : <p className={cx(small, 'mt-5')}>Bu filtrede kayıt yok.</p>}
    </Page>
  );
}
