'use client';
// Badges drawn as SVG medals: a shape per group, a metal per tier.
import type { ReactNode, SVGProps } from 'react';
import { TIER, TXT, type BadgeKind } from '@/lib/data';
import { ask } from '@/lib/dialog';
import type { Badge } from '@/lib/domain';
import { fmtDate } from '@/lib/format';
import { cx } from '@/lib/cx';
import { iconShapes } from './icons';

const poly = (n: number, r: number, rot = -90, r2 = r) =>
  Array.from({ length: n }, (_, i) => {
    const a = ((rot + (i * 360) / n) * Math.PI) / 180, q = i % 2 ? r2 : r;
    return `${(50 + q * Math.cos(a)).toFixed(1)},${(50 + q * Math.sin(a)).toFixed(1)}`;
  }).join(' ');

const HEX = poly(6, 47), SEAL = poly(20, 48, -90, 41), OCT = poly(8, 48, -67.5);
const SHAPES: Record<BadgeKind, (a: SVGProps<SVGElement>) => ReactNode> = {
  n: a => <polygon points={HEX} strokeLinejoin="round" {...(a as SVGProps<SVGPolygonElement>)} />,
  s: a => <path d="M50 4 90 17v31c0 24-17 39-40 48C27 87 10 72 10 48V17z" strokeLinejoin="round" {...(a as SVGProps<SVGPathElement>)} />,
  pr: a => <polygon points={SEAL} strokeLinejoin="round" {...(a as SVGProps<SVGPolygonElement>)} />,
  vol: a => <polygon points={OCT} strokeLinejoin="round" {...(a as SVGProps<SVGPolygonElement>)} />,
  home: a => <circle cx="50" cy="50" r="46" {...(a as SVGProps<SVGCircleElement>)} />,
};

/** Gradient definitions shared by every medal; rendered once in the layout. */
export function MedalDefs() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden="true">
      <defs>
        {Object.entries(TIER).map(([k, [a, b, c]]) => [
          <linearGradient key={`m-${k}`} id={`m-${k}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={a} /><stop offset=".5" stopColor={b} /><stop offset="1" stopColor={c} />
          </linearGradient>,
          <linearGradient key={`mi-${k}`} id={`mi-${k}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={c} /><stop offset=".6" stopColor={b} /><stop offset="1" stopColor={a} />
          </linearGradient>,
        ])}
        <linearGradient id="m-sheen" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".5" /><stop offset=".42" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function Medal({ b, size = 68 }: { b: Badge; size?: number }) {
  const at = (scale: number, a: SVGProps<SVGElement>) => (
    <g transform={`translate(50 50) scale(${scale}) translate(-50 -50)`}>{SHAPES[b.k](a)}</g>
  );
  const fs = b.label.length > 3 ? 19 : b.label.length > 2 ? 23 : 30, up = b.k === 's' ? 5 : 0;
  const col = b.got ? TXT[b.tier] : 'var(--g500)';
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true"
      className={cx('block overflow-visible', b.got && 'drop-shadow-[0_4px_8px_rgba(0,0,0,.2)]')}>
      {b.got ? (
        <>
          {at(1, { fill: `url(#m-${b.tier})` })}
          {at(0.82, { fill: `url(#mi-${b.tier})`, stroke: 'rgba(255,255,255,.45)', strokeWidth: 1.5 })}
          {at(0.82, { fill: 'url(#m-sheen)' })}
        </>
      ) : at(1, { className: 'fill-fill stroke-line stroke-2' })}
      <text x="50" y={54 - up} fontSize={fs} fill={col} textAnchor="middle" className="font-sans font-bold tracking-[-.03em]">{b.label}</text>
      <g transform={`translate(40.4 ${59 - up}) scale(.8)`} fill="none" stroke={col} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        {iconShapes(b.icon)}
      </g>
    </svg>
  );
}

/** Medal with its name; tapping opens the detail sheet. `earnedAt` is shown there when known. */
export function BadgeTile({ b, isNew, earnedAt, className }: { b: Badge; isNew?: boolean; earnedAt?: number; className?: string }) {
  const progress = `${b.cur.toLocaleString('tr-TR')} / ${b.need.toLocaleString('tr-TR')}`;
  const open = () =>
    void ask(
      b.name,
      b.got ? `${b.desc}.${earnedAt ? ` ${fmtDate(earnedAt, { day: 'numeric', month: 'long', year: 'numeric' })} tarihinde kazandın.` : ''}`
            : `${b.desc}.\nİlerleme: ${progress}`,
      'Tamam',
      { cancel: false, content: <Medal b={b} size={128} /> },
    );
  return (
    <button type="button" onClick={open} aria-label={`${b.name}: ${b.got ? 'kazanıldı' : progress}`}
      className={cx('relative flex cursor-pointer flex-col items-center gap-[3px] rounded-2xl px-0.5 py-2.5 text-center text-xs text-muted active:bg-fill', className)}>
      {isNew && <span className="absolute top-0.5 right-1.5 z-1 rounded-full bg-flame px-[7px] py-px text-[11px] font-semibold text-white">Yeni</span>}
      <Medal b={b} />
      <strong className={cx('mt-1.5 text-[13px] font-semibold', b.got && 'text-fg')}>{b.name}</strong>
      {!b.got && (
        <>
          <span className="num">{progress}</span>
          <span className="mt-0.5 h-[3px] w-11 overflow-hidden rounded-full bg-fill-2">
            <i className="block h-full rounded-full bg-muted" style={{ width: `${(b.cur / b.need) * 100}%` }} />
          </span>
        </>
      )}
    </button>
  );
}
