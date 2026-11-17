'use client';
// One finished workout. Used twice: as the celebration screen right after finishing, and as the history detail.
import { useSearchParams } from 'next/navigation';
import { deleteWorkout } from '@/lib/actions';
import { cx } from '@/lib/cx';
import { ask } from '@/lib/dialog';
import { badges, streak, volume } from '@/lib/domain';
import { fmtDate, fmtTime, setText } from '@/lib/format';
import { useStore } from '@/lib/store';
import { Icon } from './icons';
import { BadgeTile } from './medal';
import { Confetti } from './progress';
import { BackLink, Dock, NavLink, Page, useGo } from './shell';
import { Badge, Card, Chevron, H2, Stat, btn, card, h1, small } from './ui';

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
  const sets = h.ex.reduce((n, e) => n + e.sets.length, 0), vol = volume(h);
  const st = streak(s.history, s.settings.goal), nth = s.history.filter(x => !x.home).length;
  const earned = badges(s.history, s.settings.goal).filter(b => h.badges?.includes(b.id));
  const rise = summary ? 'animate-rise motion-reduce:animate-none' : '';

  const remove = async () => {
    if (!(await ask('Kayıt silinsin mi?', 'Bu antrenman geçmişten silinir. Bu geri alınamaz.', 'Kaydı Sil', { danger: true }))) return;
    go('/history');
    deleteWorkout(h.id);
  };

  return (
    <Page bare={summary}>
      <div className="flex-1 pb-5">
        {summary && q.get('new') && <Confetti />}
        {!summary && <BackLink href="/history">Geçmiş</BackLink>}
        <h1 className={cx(h1, summary ? 'mt-6' : 'mt-1', rise)}>{summary ? 'Antrenman tamam ✓' : h.name}</h1>
        <p className={cx(small, 'mt-1')}>{summary && `${h.name} · `}{fmtDate(h.end)} · {fmtTime(h.start)}–{fmtTime(h.end)}</p>

        {summary && !h.home && (
          <NavLink href="/streak" className={cx(card, 'mt-3.5 flex items-center gap-3 no-underline active:bg-fill')}>
            <Icon name="flame" className={cx('size-7', st.week >= st.goal && 'fill-flame text-flame')} />
            <div className="flex-1">
              <strong>{st.week >= st.goal ? `Haftalık hedef tamam · ${st.cur} hafta seri` : `Bu hafta ${st.week}/${st.goal}`}</strong>
              <p className={small}>{nth}. antrenmanın{st.week < st.goal && ` · seri için ${st.goal - st.week} antrenman daha`}</p>
            </div>
            <Chevron />
          </NavLink>
        )}
        {earned.length > 0 && (
          <>
            <p className={cx(small, 'mt-3.5 mb-2')}>{summary ? 'Yeni rozet kazandın' : 'Bu antrenmanda kazanılan rozetler'}</p>
            <div className="grid grid-cols-3 gap-2.5">
              {earned.map(b => <BadgeTile key={b.id} b={b} earnedAt={h.end} className={summary ? 'animate-pop [animation-delay:.3s] motion-reduce:animate-none' : undefined} />)}
            </div>
          </>
        )}

        <div className="mt-4 grid grid-cols-3 gap-2.5">
          <Stat className={cx(rise, '[animation-delay:.06s]')} label="Süre" value={Math.max(1, Math.round((h.end - h.start) / 60000))} unit="dk" />
          <Stat className={cx(rise, '[animation-delay:.12s]')} label="Set" value={sets} />
          <Stat className={cx(rise, '[animation-delay:.18s]')} label="Hareket" value={<>{h.ex.filter(e => e.sets.length).length}<span className="text-sm font-normal text-muted">/{h.ex.length}</span></>} />
        </div>
        {vol > 0 && <p className={cx(small, 'mt-2.5')}>Toplam kaldırılan: <span className="num">{Math.round(vol).toLocaleString('tr-TR')}&nbsp;kg</span></p>}

        <H2>Hareketler</H2>
        <Card>
          <ul className="divide-y divide-fill-2">
            {h.ex.map(e => (
              <li key={e.id} className="flex items-baseline justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                <span>
                  <NavLink href={`/ex/${e.id}`} className="no-underline">{e.name}</NavLink>
                  {h.prs?.includes(e.id) && <Badge ok className="ml-1.5">Rekor</Badge>}
                </span>
                <span className={cx('num text-right text-sm whitespace-nowrap', !e.sets.length && 'text-muted')}>
                  {e.sets.length ? e.sets.map((x, i) => <span key={i} className="block">{setText(x, e.target.unit)}</span>) : 'Yapılmadı'}
                </span>
              </li>
            ))}
          </ul>
        </Card>
        {!summary && <button type="button" onClick={remove} className="mt-5 min-h-11 w-full cursor-pointer font-[550] text-danger">Bu Kaydı Sil…</button>}
      </div>
      {summary && <Dock><NavLink href="/" className={btn({ variant: 'primary', big: true })}>Tamam</NavLink></Dock>}
    </Page>
  );
}
