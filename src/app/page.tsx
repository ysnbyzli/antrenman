'use client';
import { useState } from 'react';
import { Icon } from '@/components/icons';
import { WeekPills } from '@/components/progress';
import { NavLink, Page, useGo } from '@/components/shell';
import { Button, Card, Chevron, H2, card, h1, h3, small } from '@/components/ui';
import { Thumb } from '@/components/visuals';
import { discardWorkout, exportData, hideInstall, startWorkout } from '@/lib/actions';
import { asset, cx } from '@/lib/cx';
import { EX, PICS, PLANS } from '@/lib/data';
import { ask } from '@/lib/dialog';
import { DAY, doneCount, gymOn, lastSets, nextGym, streak, suggested, topKg } from '@/lib/domain';
import { fmtDate, fmtTime, mins, nf, targetText } from '@/lib/format';
import { useNow } from '@/lib/hooks';
import { useStore } from '@/lib/store';
import type { PlanKey } from '@/lib/types';

const greeting = (hr: number) => (hr < 5 ? 'İyi geceler' : hr < 12 ? 'Günaydın' : hr < 18 ? 'İyi günler' : 'İyi akşamlar');

export default function HomePage() {
  const s = useStore(), now = useNow(), go = useGo();
  const [pick, setPick] = useState<PlanKey | null>(null); // plan chosen by hand instead of the suggestion
  if (!s) return <Page glow>{null}</Page>;

  const a = s.active, H = s.history, st = streak(H, s.settings.goal), left = Math.max(0, st.goal - st.week);
  const sug = suggested(H, new Date(now)), k = pick || sug, p = PLANS[k];
  const doneToday = gymOn(H, now), last = H.find(h => !h.home), lastSame = H.find(h => h.plan === k);
  const stale = !s.settings.lastBackup || now - s.settings.lastBackup > 14 * DAY;
  const needInstall = /iphone|ipad|ipod/i.test(navigator.userAgent) && !('standalone' in navigator && navigator.standalone) && !s.settings.hideInstall;
  const cover = (a ? a.ex.map(e => e.id) : p.items.map(i => i[0])).find(id => PICS.has(id));
  const body = (['kg', 'waist'] as const).flatMap(f => {
    const x = s.body.find(b => b[f] != null);
    return x ? [`${nf(x[f]!)} ${f === 'kg' ? 'kg' : 'cm'}`] : [];
  });
  const over = a ? '' : doneToday && !pick ? `Bugün ${doneToday.name} tamamlandı ✓` : k === 'H' ? `Sıradaki salon günü: Full Body ${nextGym(H)}` : '';

  const start = () => { startWorkout(k); setPick(null); go('/workout'); };
  const discard = async () => {
    if (await ask('Antrenman silinsin mi?', 'Devam eden antrenman ve girdiğin setler silinir. Bu geri alınamaz.', 'Antrenmanı Sil', { danger: true })) discardWorkout();
  };
  const backup = () => exportData().catch(err => ask('Yedek oluşturulamadı', (err as Error).message, 'Tamam', { cancel: false }));

  return (
    <Page glow>
      <div className="flex items-center justify-between gap-2.5">
        <div>
          <p className={small}>{fmtDate(now)}</p>
          <h1 className={cx(h1, 'mt-0.5')}>{greeting(new Date(now).getHours())}</h1>
        </div>
        <NavLink href="/streak" aria-label={`Seri: ${st.cur} hafta. Seri ve rozetleri aç`}
          className={cx('flex min-h-11 items-center gap-1.5 rounded-full bg-surface pr-4 pl-3 text-[17px] font-semibold no-underline transition-transform duration-150 ease-out-strong active:scale-[.96] motion-reduce:active:scale-100', st.cur ? 'text-fg' : 'text-muted')}>
          <Icon name="flameF" className={cx('size-[22px]', st.cur ? 'text-flame' : 'text-line-2')} />
          <span className="num">{st.cur}</span>
        </NavLink>
      </div>

      {needInstall && (
        <Card className="mt-5">
          <div className="flex items-center justify-between">
            <strong>Ana ekrana ekle</strong>
            <button type="button" className="grid size-8 cursor-pointer place-items-center text-xl text-muted" aria-label="Kapat" onClick={hideInstall}>×</button>
          </div>
          <p className={small}>Safari’de Paylaş düğmesine dokunup “Ana Ekrana Ekle”yi seç. Uygulama tam ekran açılır ve kayıtların silinme riski kalkar.</p>
        </Card>
      )}

      <NavLink href="/streak" className={cx(card, 'block no-underline active:bg-fill', needInstall ? 'mt-2' : 'mt-5')}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="num text-[40px] leading-none font-[650] tracking-[-.04em]">
              {st.week}<span className="text-xl font-medium tracking-normal text-muted">/{st.goal}</span>
            </div>
            <p className={small}>Bu hafta</p>
          </div>
          <WeekPills history={H} now={now} />
        </div>
        <div className="mt-3.5 flex items-center gap-2 border-t border-line pt-3 text-sm text-muted">
          <Icon name="flameF" className={st.week >= st.goal ? 'text-flame' : 'text-line-2'} />
          <span className="flex-1">
            {st.week >= st.goal ? `Haftalık hedef tamam · ${st.cur} hafta seri` : `${st.cur ? 'Seriyi korumak' : 'Seriyi başlatmak'} için ${left} antrenman daha`}
          </span>
          <Chevron />
        </div>
      </NavLink>

      {/* Today's workout: photo of the first exercise behind a dark gradient, so text is white in both themes. */}
      <div
        className="mt-2 flex min-h-[300px] flex-col justify-between rounded-[28px] bg-[#151515] bg-cover bg-center px-4 pt-3.5 pb-4 text-white"
        style={{ backgroundImage: `linear-gradient(180deg,rgba(0,0,0,.5),rgba(0,0,0,.12) 42%,rgba(0,0,0,.9))${cover ? `,url(${asset(`/img/${cover}-1.jpg`)})` : ''}` }}
      >
        <div className="flex items-center justify-between gap-2.5">
          <span className="rounded-full bg-white/20 px-[11px] py-[5px] text-[13px] font-[550] backdrop-blur-md">
            {a ? 'Devam ediyor' : k === sug ? 'Bugün için önerilen' : 'Elle seçildi'}
          </span>
          {!a && (
            <div role="group" aria-label="Antrenman seç" className="flex gap-0.5 rounded-full bg-white/20 p-[3px] backdrop-blur-md">
              {(['A', 'B', 'H'] as const).map(x => (
                <button key={x} type="button" aria-pressed={x === k} aria-label={PLANS[x].name} onClick={() => setPick(x)}
                  className={cx('min-h-[34px] min-w-10 cursor-pointer rounded-full px-3 text-sm font-[550]', x === k ? 'bg-white text-[#111]' : 'text-white')}>
                  {x === 'H' ? 'Ev' : x}
                </button>
              ))}
            </div>
          )}
        </div>
        <div>
          {over && <p className="text-sm opacity-80">{over}</p>}
          <h2 className={cx(h3, 'my-0.5 text-[30px]')}>{a ? a.name : p.name}</h2>
          <p className="text-sm opacity-80">
            {a ? `${doneCount(a)}/${a.ex.length} hareket · ${fmtTime(a.start)}’de başladı`
               : `${p.items.length} hareket${lastSame ? ` · geçen sefer ${mins(lastSame.end - lastSame.start)}` : ''}`}
          </p>
          {a ? (
            <>
              <Button variant="inverse" big className="mt-4" onClick={() => go('/workout')}>Antrenmana Devam Et</Button>
              <button type="button" className="mt-1 min-h-11 w-full cursor-pointer font-[550] text-white/75" onClick={discard}>Antrenmanı Sil…</button>
            </>
          ) : (
            <Button variant="inverse" big className="mt-4" onClick={start}>Antrenmana Başla</Button>
          )}
        </div>
      </div>

      {!a && (
        <>
          <H2>Hareketler</H2>
          <Card>
            <ul className="divide-y divide-line">
              {p.items.map(([id, sets, reps, unit = '', max]) => {
                const kg = p.home ? 0 : topKg(lastSets(H, id));
                return (
                  <li key={id} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                    <NavLink href={`/ex/${id}`} className="flex min-w-0 flex-1 items-center gap-3 no-underline">
                      <Thumb id={id} size={44} />
                      <span>{EX[id].n}</span>
                    </NavLink>
                    <span className="num text-right text-sm whitespace-nowrap text-muted">
                      {targetText({ sets, reps, unit, max })}{kg > 0 && <><br />{nf(kg)}&nbsp;kg</>}
                    </span>
                  </li>
                );
              })}
            </ul>
          </Card>
        </>
      )}

      <div className="mt-2 grid grid-cols-2 gap-2">
        <NavLink href="/history" className={cx(card, 'no-underline active:bg-fill')}>
          <p className={small}>Son antrenman</p>
          <div className="text-[17px] font-semibold">{last ? fmtDate(last.end, { day: 'numeric', month: 'short' }) : '—'}</div>
          <p className={small}>{last ? `${last.name} · ${mins(last.end - last.start)}` : 'Henüz yok'}</p>
        </NavLink>
        <NavLink href="/body" className={cx(card, 'no-underline active:bg-fill')}>
          <p className={small}>Ölçüler</p>
          <div className="num text-[17px] font-semibold">{body[0] ?? '—'}</div>
          <p className={cx(small, 'num')}>{body.length ? (body[1] ?? 'Bel ölçüsü yok') : 'Kilo ve bel ekle'}</p>
        </NavLink>
      </div>

      {stale && H.length > 0 && (
        <Card className="mt-2 flex items-center justify-between gap-2.5">
          <p className={small}>2 haftadır yedek alınmadı.</p>
          <Button onClick={backup}>Yedekle</Button>
        </Card>
      )}
    </Page>
  );
}
