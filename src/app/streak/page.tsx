'use client';
import { Icon } from '@/components/icons';
import { BadgeTile } from '@/components/medal';
import { Calendar, WeeksChart } from '@/components/progress';
import { BackLink, Page } from '@/components/shell';
import { Card, H2, Stat, h3, small } from '@/components/ui';
import { cx } from '@/lib/cx';
import { GROUP, type BadgeKind } from '@/lib/data';
import { badges, streak } from '@/lib/domain';
import { useNow } from '@/lib/hooks';
import { useStore } from '@/lib/store';

export default function StreakPage() {
  const s = useStore(), now = useNow();
  if (!s) return <Page>{null}</Page>;

  const H = s.history, st = streak(H, s.settings.goal), all = badges(H, s.settings.goal), left = Math.max(0, st.goal - st.week);
  const latest = H[0]?.badges ?? []; // earned in the most recent workout → "Yeni"
  const earnedAt = (id: string) => H.find(h => h.badges?.includes(id))?.end;

  return (
    <Page>
      <BackLink href="/">Ana Sayfa</BackLink>
      <div className="mt-2 flex items-center justify-between gap-2.5">
        <div>
          <div className="num text-[88px] leading-[.95] font-[650] tracking-[-.05em]">{st.cur}</div>
          <h1 className={h3}>hafta seri</h1>
        </div>
        <Icon name="flame" className={cx('size-[88px] stroke-[1.2]', st.cur ? 'fill-flame text-flame' : 'text-line-2')} />
      </div>
      <p className="mt-2.5 text-muted">
        {st.week >= st.goal ? 'Bu haftanın hedefi tamam, seri güvende.' : `${st.cur ? 'Seriyi korumak' : 'Seriyi başlatmak'} için bu hafta ${left} antrenman daha.`}
      </p>
      <div className="mt-4 grid grid-cols-3 gap-2.5">
        <Stat label="Bu hafta" value={<>{st.week}<span className="text-sm font-normal text-muted">/{st.goal}</span></>} />
        <Stat label="En uzun" value={st.best} unit="hf" />
        <Stat label="Toplam" value={H.filter(h => !h.home).length} />
      </div>
      <p className={cx(small, 'mt-2.5')}>Haftada {st.goal} salon antrenmanı yaptığın her hafta seriye eklenir. Hedefi Ayarlar’dan değiştirebilirsin.</p>

      <H2>Son 8 hafta</H2>
      <WeeksChart history={H} goal={st.goal} />
      <H2>Takvim</H2>
      <Calendar history={H} now={now} />

      <H2>Rozetler · {all.filter(b => b.got).length}/{all.length}</H2>
      <div className="grid gap-2.5">
        {(Object.keys(GROUP) as BadgeKind[]).map(k => {
          const g = all.filter(b => b.k === k);
          return (
            <Card key={k}>
              <div className="flex items-center justify-between">
                <strong>{GROUP[k][0]}</strong>
                <span className={cx(small, 'num')}>{g.filter(b => b.got).length}/{g.length}</span>
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2.5">
                {g.map(b => <BadgeTile key={b.id} b={b} isNew={latest.includes(b.id)} earnedAt={earnedAt(b.id)} />)}
              </div>
            </Card>
          );
        })}
      </div>
    </Page>
  );
}
