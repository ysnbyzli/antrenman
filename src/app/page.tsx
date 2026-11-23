'use client';
import { useState } from 'react';
import { Icon } from '@/components/icons';
import { Hex } from '@/components/medal';
import { WeekPills } from '@/components/progress';
import { NavLink, Page, useGo } from '@/components/shell';
import { Button, Card, Chevron, H2, Segmented, Stat, card, small } from '@/components/ui';
import { Thumb } from '@/components/visuals';
import { discardWorkout, exportData, hideInstall, startWorkout } from '@/lib/actions';
import { cx } from '@/lib/cx';
import { EX, PLANS } from '@/lib/data';
import { ask } from '@/lib/dialog';
import { DAY, doneCount, gymOn, lastSets, nextGym, streak, suggested, topKg } from '@/lib/domain';
import { fmtDate, fmtTime, mins, nf, targetText } from '@/lib/format';
import { useNow } from '@/lib/hooks';
import { useStore } from '@/lib/store';
import type { PlanKey } from '@/lib/types';

const greeting = (hr: number) => (hr < 5 ? 'İyi geceler' : hr < 12 ? 'Günaydın' : hr < 18 ? 'İyi günler' : 'İyi akşamlar');
const PLAN_OPTIONS: [PlanKey, string][] = [['A', 'Full Body A'], ['B', 'Full Body B'], ['H', 'Ev']];

/** Hexagon emblem for a plan: its letter for gym days, a house for the home routine. */
function PlanEmblem({ plan }: { plan: PlanKey }) {
  return plan === 'H' ? <Hex tier="o" icon="homeF" size={124} /> : <Hex tier={plan === 'A' ? 'b' : 'p'} text={plan} size={124} />;
}

export default function HomePage() {
  const s = useStore(), now = useNow(), go = useGo();
  const [pick, setPick] = useState<PlanKey | null>(null); // plan chosen by hand instead of the suggestion
  if (!s) return <Page glow>{null}</Page>;

  const a = s.active, H = s.history, st = streak(H, s.settings.goal), left = Math.max(0, st.goal - st.week);
  const sug = suggested(H, new Date(now)), k = a ? a.plan : pick || sug, p = PLANS[k];
  const doneToday = gymOn(H, now), last = H.find(h => !h.home), lastSame = H.find(h => h.plan === k);
  const stale = !s.settings.lastBackup || now - s.settings.lastBackup > 14 * DAY;
  const needInstall = /iphone|ipad|ipod/i.test(navigator.userAgent) && !('standalone' in navigator && navigator.standalone) && !s.settings.hideInstall;
  const eyebrow = a ? 'Devam ediyor' : doneToday && !pick ? `Bugün ${doneToday.name} tamamlandı ✓` : k === sug ? 'Bugün için önerilen' : 'Elle seçildi';

  const start = () => { startWorkout(k); setPick(null); go('/workout'); };
  const discard = async () => {
    if (await ask('Antrenman silinsin mi?', 'Devam eden antrenman ve girdiğin setler silinir. Bu geri alınamaz.', 'Antrenmanı Sil', { danger: true })) discardWorkout();
  };
  const backup = () => exportData().catch(err => ask('Yedek oluşturulamadı', (err as Error).message, 'Tamam', { cancel: false }));

  return (
    <Page glow>
      <header className="flex items-center justify-between gap-2.5">
        <div>
          <p className={small}>{fmtDate(now)}</p>
          <p className="text-[22px] leading-tight font-bold tracking-[-.02em]">{greeting(new Date(now).getHours())}</p>
        </div>
        <NavLink href="/streak" aria-label={`Seri: ${st.cur} hafta. Seri ve rozetleri aç`}
          className={cx('flex min-h-11 items-center gap-1.5 rounded-full bg-surface pr-4 pl-3 text-[17px] font-semibold no-underline transition-transform duration-150 ease-out-strong active:scale-[.96] motion-reduce:active:scale-100', st.cur ? 'text-fg' : 'text-muted')}>
          <Icon name="flameF" className={cx('size-[22px]', st.cur ? 'text-flame' : 'text-line-2')} />
          <span className="num">{st.cur}</span>
        </NavLink>
      </header>

      {/* Today's workout: emblem, name, and the plan switcher */}
      <section className="mt-8 flex flex-col items-center text-center">
        <PlanEmblem plan={k} />
        <p className={cx(small, 'mt-5')}>{eyebrow}</p>
        <h1 className="mt-1 text-[30px] leading-[1.1] font-bold tracking-[-.02em]">{a ? a.name : p.name}</h1>
        <p className="mt-1.5 text-muted">
          {a ? `${doneCount(a)}/${a.ex.length} hareket · ${fmtTime(a.start)}’de başladı`
             : `${p.items.length} hareket${lastSame ? ` · geçen sefer ${mins(lastSame.end - lastSame.start)}` : ''}`}
        </p>
        {a ? <button type="button" className="mt-2 min-h-11 cursor-pointer px-4 font-semibold text-danger" onClick={discard}>Antrenmanı Sil…</button>
           : <Segmented className="mt-5" label="Antrenman seç" options={PLAN_OPTIONS} value={k} onChange={setPick} />}
      </section>

      {needInstall && (
        <Card className="mt-7">
          <div className="flex items-center justify-between">
            <strong>Ana ekrana ekle</strong>
            <button type="button" className="grid size-8 cursor-pointer place-items-center text-xl text-muted" aria-label="Kapat" onClick={hideInstall}>×</button>
          </div>
          <p className={small}>Safari’de Paylaş düğmesine dokunup “Ana Ekrana Ekle”yi seç. Uygulama tam ekran açılır ve kayıtların silinme riski kalkar.</p>
        </Card>
      )}

      {/* This week */}
      <NavLink href="/streak" className={cx(card, 'block no-underline active:bg-fill', needInstall ? 'mt-2' : 'mt-7')}>
        <div className="flex items-center gap-3.5">
          <Icon name="calF" className="size-8 text-info" />
          <div className="flex-1">
            <p className={small}>Bu hafta</p>
            <p className="num text-2xl leading-tight font-semibold">{st.week}<span className="text-base font-normal text-muted">/{st.goal} antrenman</span></p>
          </div>
          <Chevron />
        </div>
        <div className="mt-4 border-t border-line pt-4"><WeekPills history={H} now={now} /></div>
      </NavLink>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <Stat icon="flameF" tone="flame" label="Seri" value={st.cur} unit="hafta"
          foot={st.week >= st.goal ? 'Hedef tamam' : `${left} gün kaldı`} />
        <Stat icon="clockF" tone="purple" label="En son" value={last ? fmtDate(last.end, { day: 'numeric', month: 'short' }) : '—'}
          foot={last ? `${last.name.replace('Full Body ', '')} · ${mins(last.end - last.start)}` : 'Henüz yok'} />
      </div>

      {!a && (
        <>
          <H2 className="flex items-baseline justify-between">Hareketler<span className="text-sm font-normal text-muted">{p.items.length} hareket</span></H2>
          <div className="-mx-5 flex snap-x gap-2 overflow-x-auto px-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {p.items.map(([id, sets, reps, unit = '', max]) => {
              const kg = p.home ? 0 : topKg(lastSets(H, id));
              return (
                <NavLink key={id} href={`/ex/${id}`} className="w-[152px] flex-none snap-start rounded-3xl bg-surface p-2 no-underline active:bg-fill">
                  <Thumb id={id} width={136} height={100} className="rounded-2xl!" />
                  <p className="mt-2.5 truncate px-1.5 font-semibold">{EX[id].n}</p>
                  <p className="num px-1.5 pb-1.5 text-sm text-muted">{targetText({ sets, reps, unit, max })}{kg > 0 && ` · ${nf(kg)} kg`}</p>
                </NavLink>
              );
            })}
          </div>
        </>
      )}

      {stale && H.length > 0 && (
        <Card className="mt-7 flex items-center justify-between gap-2.5">
          <p className={small}>2 haftadır yedek alınmadı.</p>
          <Button className="bg-fill-2" onClick={backup}>Yedekle</Button>
        </Card>
      )}
      {k === 'H' && !a && <p className={cx(small, 'mt-4 text-center')}>Sıradaki salon günü: Full Body {nextGym(H)}</p>}

      {/* Primary action stays in thumb reach, floating above the tab bar */}
      <div className="h-20" />
      <div className="fixed inset-x-5 bottom-[calc(max(12px,env(safe-area-inset-bottom)-12px)+76px)] z-4 mx-auto max-w-[480px]">
        <Button variant="primary" big className="shadow-[0_10px_30px_rgba(0,0,0,.45)]" onClick={a ? () => go('/workout') : start}>
          {a ? 'Antrenmana Devam Et' : 'Antrenmana Başla'}
        </Button>
      </div>
    </Page>
  );
}
