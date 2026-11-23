'use client';
import { BadgeTile, Hex } from '@/components/medal';
import { Calendar, WeekPills, WeeksChart } from '@/components/progress';
import { BackLink, Page } from '@/components/shell';
import { Card, H2, Stat, h1, small } from '@/components/ui';
import { cx } from '@/lib/cx';
import { GROUP, type BadgeKind } from '@/lib/data';
import { badges, streak } from '@/lib/domain';
import { useNow } from '@/lib/hooks';
import { useStore } from '@/lib/store';

export default function StreakPage() {
  const s = useStore(), now = useNow();
  if (!s) return <Page glow>{null}</Page>;

  const H = s.history, st = streak(H, s.settings.goal), all = badges(H, s.settings.goal), left = Math.max(0, st.goal - st.week);
  const got = all.filter(b => b.got).length;
  const latest = H[0]?.badges ?? []; // earned in the most recent workout → "Yeni"
  const earnedAt = (id: string) => H.find(h => h.badges?.includes(id))?.end;

  return (
    <Page glow>
      <BackLink href="/">Ana Sayfa</BackLink>

      {/* the streak as the hero: flame emblem, the number, what it takes to keep it */}
      <section className="mt-2 flex flex-col items-center text-center">
        <Hex tier="b" icon="flameF" size={132} locked={!st.cur} />
        <p className="num mt-4 text-[64px] leading-none font-bold tracking-[-.04em]">{st.cur}</p>
        <h1 className={cx(h1, 'mt-1 text-2xl')}>hafta seri</h1>
        <p className="mt-2 max-w-[280px] text-muted">
          {st.week >= st.goal ? 'Bu haftanın hedefi tamam, seri güvende.' : `${st.cur ? 'Seriyi korumak' : 'Seriyi başlatmak'} için bu hafta ${left} antrenman daha.`}
        </p>
      </section>

      <div className="mt-7 grid grid-cols-2 gap-2">
        <Stat icon="calF" tone="info" label="Bu hafta" value={<>{st.week}<span className="text-base font-normal text-muted">/{st.goal}</span></>} />
        <Stat icon="flameF" tone="flame" label="En uzun seri" value={st.best} unit="hafta" />
        <Stat icon="dumbbellF" tone="purple" label="Antrenman" value={H.filter(h => !h.home).length} />
        <Stat icon="trophyF" tone="cyan" label="Rozet" value={<>{got}<span className="text-base font-normal text-muted">/{all.length}</span></>} />
      </div>
      <Card className="mt-2">
        <WeekPills history={H} now={now} />
        <p className={cx(small, 'mt-4 border-t border-line pt-3.5')}>Haftada {st.goal} salon antrenmanı yaptığın her hafta seriye eklenir. Hedefi Ayarlar’dan değiştirebilirsin.</p>
      </Card>

      <H2>Son 8 hafta</H2>
      <WeeksChart history={H} goal={st.goal} />
      <H2>Takvim</H2>
      <Calendar history={H} now={now} />

      <H2 className="flex items-baseline justify-between">Rozetler<span className="num text-sm font-normal text-muted">{got}/{all.length}</span></H2>
      <div className="grid gap-2">
        {(Object.keys(GROUP) as BadgeKind[]).map(k => {
          const g = all.filter(b => b.k === k);
          return (
            <Card key={k}>
              <div className="flex items-center justify-between">
                <p className="font-semibold">{GROUP[k][0]}</p>
                <span className={cx(small, 'num')}>{g.filter(b => b.got).length}/{g.length}</span>
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {g.map(b => <BadgeTile key={b.id} b={b} isNew={latest.includes(b.id)} earnedAt={earnedAt(b.id)} />)}
              </div>
            </Card>
          );
        })}
      </div>
    </Page>
  );
}
