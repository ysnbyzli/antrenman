import { BackLink, NavLink, Page } from '@/components/shell';
import { Chevron, Group, h1, row, rowTap, small } from '@/components/ui';
import { Thumb } from '@/components/visuals';
import { cx } from '@/lib/cx';
import { EX } from '@/lib/data';

export default function ExercisesPage() {
  return (
    <Page>
      <BackLink href="/settings">Ayarlar</BackLink>
      <h1 className={cx(h1, 'mt-1')}>Hareketler</h1>
      <Group className="mt-4">
        {Object.entries(EX).map(([id, x]) => (
          <NavLink key={id} href={`/ex/${id}`} className={cx(row, rowTap)}>
            <Thumb id={id} size={44} />
            <div className="min-w-0 flex-1"><strong className="font-semibold">{x.n}</strong><p className={small}>{x.m}</p></div>
            <Chevron />
          </NavLink>
        ))}
      </Group>
    </Page>
  );
}
