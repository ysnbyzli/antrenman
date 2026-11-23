'use client';
// One finished workout. Used twice: as the celebration screen right after finishing, and as the history detail.
import { useSearchParams } from 'next/navigation';
import { deleteWorkout } from '@/lib/actions';
import { cx } from '@/lib/cx';
import { MU } from '@/lib/data';
import { ask } from '@/lib/dialog';
import { badges, streak, topKg, volume } from '@/lib/domain';
import { dur, fmtDate, kgs, nf, setText } from '@/lib/format';
import { useStore } from '@/lib/store';
import type { Workout } from '@/lib/types';
import { Icon, iconShapes } from './icons';
import { BadgeTile, Hex, Medal } from './medal';
import { Confetti } from './progress';
import { BackLink, Dock, NavLink, Page, useGo } from './shell';
import { Badge, Button, Card, Chevron, H2, Stat, btn, card, h1, small } from './ui';

const MUSCLE: Record<string, string> = {
  quadriceps: 'Ön bacak', gluteal: 'Kalça', hamstring: 'Arka bacak', upper_back: 'Sırt', trapezius: 'Trapez', back_deltoids: 'Arka omuz',
  front_deltoids: 'Omuz', biceps: 'Biceps', triceps: 'Triceps', chest: 'Göğüs', abs: 'Karın', obliques: 'Yan karın', lower_back: 'Bel',
  forearm: 'Ön kol', calves: 'Baldır', neck: 'Boyun',
};
/** Share of the workout's sets per primary muscle, biggest first. */
function muscleSplit(h: Workout) {
  const n: Record<string, number> = {};
  h.ex.forEach(e => {
    const prim = (MU[e.id]?.[0] ?? '').split(' ').filter(Boolean);
    prim.forEach(m => { n[m] = (n[m] || 0) + e.sets.length / prim.length; });
  });
  const total = Object.values(n).reduce((a, b) => a + b, 0);
  return Object.entries(n).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]).map(([m, v]) => ({ name: MUSCLE[m] ?? m, pct: Math.round((v / total) * 100) }));
}

/** "Yeni rekor" sticker: trophy, dumbbell and a tilted outlined label. */
function RecordSticker() {
  const label = { textAnchor: 'middle' as const, fontSize: 17, fontWeight: 900, fontStyle: 'italic', fill: '#fff', stroke: '#e63e00', strokeWidth: 5, paintOrder: 'stroke', strokeLinejoin: 'round' as const };
  return (
    <svg viewBox="0 0 124 100" className="w-[112px] flex-none" aria-hidden="true">
      <g transform="rotate(-8 62 50)">
        <g transform="translate(40 0) scale(2.1)" fill="#f5a800" fillRule="evenodd">{iconShapes('trophyF')}</g>
        <g transform="translate(4 30) rotate(-22 22 22) scale(1.8)" fill="#ff5a1f">{iconShapes('dumbbellF')}</g>
        <text x="66" y="72" {...label} className="font-sans">YENİ</text>
        <text x="68" y="92" {...label} className="font-sans">REKOR</text>
      </g>
    </svg>
  );
}

export function WorkoutDetail({ summary }: { summary?: boolean }) {
  const s = useStore(), q = useSearchParams(), go = useGo();
  if (!s) return <Page bare={summary}>{null}</Page>;

  const h = s.history.find(x => x.id === q.get('id'));
  if (!h) {
    return (
      <Page>
        <h1 className={h1}>Bulunamadı</h1>
        <p className="mt-2"><NavLink href="/history">Geçmişe dön</NavLink></p>
      </Page>
    );
  }
  const sets = h.ex.reduce((n, e) => n + e.sets.length, 0), vol = volume(h), done = h.ex.filter(e => e.sets.length).length;
  const st = streak(s.history, s.settings.goal), nth = s.history.filter(x => !x.home).length;
  const earned = badges(s.history, s.settings.goal).filter(b => h.badges?.includes(b.id));
  const records = h.ex.filter(e => h.prs?.includes(e.id)).map(e => {
    const best = e.sets.reduce((a, b) => (Number(b.kg) > Number(a.kg) ? b : a));
    return { id: e.id, name: e.name, text: `${nf(topKg(e.sets))} kg × ${best.reps}` };
  });
  const date = fmtDate(h.end, { day: 'numeric', month: 'short', year: 'numeric' });
  const split = muscleSplit(h).slice(0, 4);
  const rise = summary ? 'animate-rise motion-reduce:animate-none' : '';

  const remove = async () => {
    if (!(await ask('Kayıt silinsin mi?', 'Bu antrenman geçmişten silinir. Bu geri alınamaz.', 'Kaydı Sil', { danger: true }))) return;
    go('/history');
    deleteWorkout(h.id);
  };
  const share = async () => {
    const text = [`${h.name} · ${date}`, `Süre ${dur(h.end - h.start)} · ${done} hareket · ${sets} set${vol ? ` · ${kgs(vol)}` : ''}`,
      ...records.map(r => `Yeni rekor: ${r.name} ${r.text}`)].join('\n');
    try {
      if (navigator.share) await navigator.share({ text });
      else { await navigator.clipboard.writeText(text); void ask('Özet kopyalandı', 'Metni istediğin yere yapıştırabilirsin.', 'Tamam', { cancel: false }); }
    } catch {} // sharing cancelled
  };

  return (
    <Page bare={summary} glow>
      <div className="flex-1 pb-6">
        {summary && q.get('new') && <Confetti />}
        <BackLink href={summary ? '/' : '/history'}>{summary ? 'Ana Sayfa' : 'Geçmiş'}</BackLink>

        <div className="mt-2 flex flex-col items-center text-center">
          <div className={summary ? 'animate-pop motion-reduce:animate-none' : undefined}>
            {earned[0] ? <Medal b={earned[0]} size={132} /> : <Hex tier={h.home ? 'p' : 'b'} icon="trophyF" size={132} />}
          </div>
          <h1 className={cx(h1, 'mt-5 text-2xl', rise)}>{summary ? 'Antrenman Tamam' : h.name}</h1>
          <p className="mt-1.5 flex gap-4 text-muted">{summary && <span>{h.name}</span>}<span>{date}</span></p>
        </div>

        <div className="mt-7 grid grid-cols-2 gap-2">
          <Stat className={cx(rise, '[animation-delay:.05s]')} icon="clockF" tone="info" label="Süre" value={dur(h.end - h.start)} />
          <Stat className={cx(rise, '[animation-delay:.1s]')} icon="dumbbellF" tone="purple" label="Kaldırılan" value={vol ? kgs(vol) : '—'} />
          <Stat className={cx(rise, '[animation-delay:.15s]')} icon="figureF" tone="cyan" label="Hareket" value={<>{done}<span className="text-sm font-normal text-muted">/{h.ex.length}</span></>} />
          <Stat className={cx(rise, '[animation-delay:.2s]')} icon="flameF" tone="flame" label="Toplam set" value={sets} />
        </div>

        {records.length > 0 && (
          <Card className="mt-2 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2.5 font-semibold"><Icon name="starF" className="text-flame" />Yeni rekor</div>
              <ul className="mt-3 grid gap-2">
                {records.map(r => <li key={r.id}><p className={small}>{r.name}</p><p className="num font-medium">{r.text}</p></li>)}
              </ul>
            </div>
            <RecordSticker />
          </Card>
        )}

        {summary && !h.home && (
          <NavLink href="/streak" className={cx(card, 'mt-2 flex items-center gap-3.5 no-underline active:bg-fill')}>
            <Icon name="flameF" className={cx('size-8', st.week >= st.goal ? 'text-flame' : 'text-line-2')} />
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{st.week >= st.goal ? `Haftalık hedef tamam · ${st.cur} hafta seri` : `Bu hafta ${st.week}/${st.goal}`}</p>
              <p className={small}>{nth}. antrenmanın{st.week < st.goal && ` · seri için ${st.goal - st.week} antrenman daha`}</p>
            </div>
            <Chevron />
          </NavLink>
        )}

        {earned.length > 0 && (
          <Card className="mt-2">
            <p className="font-semibold">{summary ? 'Yeni rozet kazandın' : 'Bu antrenmanda kazanılan rozetler'}</p>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {earned.map(b => <BadgeTile key={b.id} b={b} earnedAt={h.end} />)}
            </div>
          </Card>
        )}

        {split.length > 0 && (
          <>
            <H2>Kas dağılımı</H2>
            <Card className="grid gap-3.5">
              {split.map(m => (
                <div key={m.name}>
                  <div className="flex items-baseline justify-between"><span className="font-medium">{m.name}</span><span className="num text-sm text-muted">%{m.pct}</span></div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-fill-2"><i className="block h-full rounded-full bg-flame" style={{ width: `${m.pct}%` }} /></div>
                </div>
              ))}
            </Card>
          </>
        )}

        <H2>Hareketler</H2>
        <Card>
          <ul className="divide-y divide-line">
            {h.ex.map(e => (
              <li key={e.id} className="flex items-baseline justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <span>
                  <NavLink href={`/ex/${e.id}`} className="font-medium no-underline">{e.name}</NavLink>
                  {h.prs?.includes(e.id) && <Badge ok className="ml-1.5">Rekor</Badge>}
                </span>
                <span className={cx('num text-right text-sm whitespace-nowrap', !e.sets.length && 'text-muted')}>
                  {e.sets.length ? e.sets.map((x, i) => <span key={i} className="block">{setText(x, e.target.unit)}</span>) : 'Yapılmadı'}
                </span>
              </li>
            ))}
          </ul>
        </Card>
        {!summary && <button type="button" onClick={remove} className="mt-5 min-h-12 w-full cursor-pointer font-semibold text-danger">Bu Kaydı Sil…</button>}
      </div>
      {summary && (
        <Dock>
          <div className="grid grid-cols-2 gap-3">
            <NavLink href={`/history/detail?id=${h.id}`} className={btn({ big: true })}>Kaydı Gör</NavLink>
            <Button variant="primary" big onClick={share}>Özeti Paylaş</Button>
          </div>
        </Dock>
      )}
    </Page>
  );
}
