// Exercise visuals: photo or pictogram thumbnails, the start/end picture, muscle map and sparkline.
import Image from 'next/image';
import { BACK, EX, FIG, FRONT, MU, PICS, type Fig } from '@/lib/data';
import { asset, cx } from '@/lib/cx';
import { nf } from '@/lib/format';
import { card, small } from './ui';

/** Stick-figure pose, for the exercises that have no photo. */
function FigSvg({ fig, label, className }: { fig: Fig; label?: string; className?: string }) {
  return (
    <svg viewBox="0 0 120 80" className={cx('block size-full bg-fill', className)} {...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true })}>
      <g className="fill-none stroke-line-2 stroke-2 [stroke-linecap:round]">
        {(fig.p || []).map(p => <polyline key={p} points={p} />)}
      </g>
      <g className="fill-none stroke-fg stroke-[5] [stroke-linecap:round] [stroke-linejoin:round]">
        {fig.l.map(p => <polyline key={p} points={p} />)}
        <circle cx={fig.h[0]} cy={fig.h[1]} r={fig.h[2]} className="fill-fg stroke-none" />
      </g>
    </svg>
  );
}

/** Square thumbnail of an exercise (end position). */
export function Thumb({ id, size = 64, className }: { id: string; size?: number; className?: string }) {
  const cls = cx('block flex-none overflow-hidden rounded-xl bg-fill-2 object-cover', className);
  const style = { width: size, height: size };
  return PICS.has(id)
    ? <Image className={cls} style={style} src={asset(`/img/${id}-1.jpg`)} alt="" width={size} height={size} />
    : <span className={cls} style={style}>{FIG[id] && <FigSvg fig={FIG[id][1]} />}</span>;
}

/** Start and end position, alternating. With reduced motion they sit side by side instead. */
export function ExercisePics({ id }: { id: string }) {
  const name = EX[id].n, frame = 'absolute inset-0 size-full object-cover motion-reduce:static';
  const second = cx(frame, 'animate-flip motion-reduce:animate-none');
  return (
    <div className="relative mt-4 aspect-[3/2] overflow-hidden rounded-3xl bg-fill motion-reduce:grid motion-reduce:aspect-[3/1] motion-reduce:grid-cols-2">
      {PICS.has(id) ? (
        <>
          <Image className={frame} src={asset(`/img/${id}-0.jpg`)} alt={`${name}: başlangıç pozisyonu`} width={600} height={400} priority />
          <Image className={second} src={asset(`/img/${id}-1.jpg`)} alt={`${name}: bitiş pozisyonu`} width={600} height={400} priority />
        </>
      ) : FIG[id] && (
        <>
          <FigSvg fig={FIG[id][0]} label={`${name}: başlangıç pozisyonu`} className={frame} />
          <FigSvg fig={FIG[id][1]} label={`${name}: bitiş pozisyonu`} className={second} />
        </>
      )}
    </div>
  );
}

/** Front and back body outline; primary muscles solid, secondary ones faded. */
export function MuscleMap({ id }: { id: string }) {
  const [p, s] = (MU[id] || ['', '']).map(x => x.split(' '));
  const fig = (data: Record<string, string[]>, h: number, label: string) => (
    <svg viewBox={`0 0 1000 ${h}`} width={Math.round(220000 / h)} height={220} role="img" aria-label={label}>
      {Object.entries(data).flatMap(([m, polys]) => polys.map(pts => (
        <polygon key={pts} points={pts} className={p.includes(m) ? 'fill-danger' : s.includes(m) ? 'fill-danger opacity-35' : 'fill-fill-2'} />
      )))}
    </svg>
  );
  const dot = 'mr-1.5 inline-block size-2.5 rounded-[3px] bg-danger';
  return (
    <div className={card}>
      <div className="flex justify-center gap-7">{fig(FRONT, 2000, 'Vücut önden')}{fig(BACK, 2200, 'Vücut arkadan')}</div>
      <p className={cx(small, 'mt-2.5 text-center')}>
        <span className={dot} />Ana kas<span className={cx(dot, 'ml-4 opacity-35')} />Yardımcı kas
      </p>
    </div>
  );
}

/** Tiny line chart of a value over time (oldest first). Needs at least two points. */
export function Spark({ values, unit = 'kg', label = 'Ağırlık' }: { values: number[]; unit?: string; label?: string }) {
  const w = 300, h = 56, p = 6, mn = Math.min(...values), r = Math.max(...values) - mn || 1;
  const pts = values.map((x, i) => [p + (i * (w - 2 * p)) / (values.length - 1), h - p - ((x - mn) / r) * (h - 2 * p)].map(n => n.toFixed(1)));
  const last = pts[pts.length - 1];
  return (
    <svg viewBox={`0 0 ${w} ${h}`} role="img" className="block h-14 w-full"
      aria-label={`${label} gelişimi: ${nf(values[0])} ${unit} → ${nf(values[values.length - 1])} ${unit}`}>
      <polyline fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" points={pts.join(' ')} />
      <circle cx={last[0]} cy={last[1]} r="3.5" fill="currentColor" />
    </svg>
  );
}
