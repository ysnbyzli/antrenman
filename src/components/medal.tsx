'use client';
// Badges as rounded hexagons: a lighter rim, a gradient face in the tier's colour, a white glyph for the group.
import { TIER, type BadgeKind, type Tier } from '@/lib/data';
import { ask } from '@/lib/dialog';
import type { Badge } from '@/lib/domain';
import { fmtDate } from '@/lib/format';
import { cx } from '@/lib/cx';
import { iconShapes, type IconName } from './icons';

const poly = (n: number, r: number, rot = -90) =>
  Array.from({ length: n }, (_, i) => {
    const a = ((rot + (i * 360) / n) * Math.PI) / 180;
    return `${(50 + r * Math.cos(a)).toFixed(1)},${(50 + r * Math.sin(a)).toFixed(1)}`;
  }).join(' ');

// Corners are rounded by stroking each hexagon in its own colour with round joins.
const RIM = poly(6, 43), FACE = poly(6, 35);
const SPARK = 'M0-5 1.2-1.2 5 0 1.2 1.2 0 5-1.2 1.2-5 0-1.2-1.2z';
const GLYPH: Record<BadgeKind, IconName> = { n: 'dumbbellF', s: 'flameF', pr: 'trophyF', vol: 'scaleF', home: 'homeF' };

/** Gradient definitions shared by every hexagon; rendered once in the layout. */
export function MedalDefs() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden="true">
      <defs>
        {Object.entries(TIER).map(([k, [a, b, c]]) => (
          <linearGradient key={k} id={`m-${k}`} x1=".2" y1="0" x2=".8" y2="1">
            <stop offset="0" stopColor={a} /><stop offset=".55" stopColor={b} /><stop offset="1" stopColor={c} />
          </linearGradient>
        ))}
        <linearGradient id="m-sheen" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".35" /><stop offset=".45" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/** The hexagon itself. With a `label` the glyph moves up and the label sits under it. */
export function Hex({ tier, icon, label, locked, size = 68, className }:
  { tier: Tier; icon: IconName; label?: string; locked?: boolean; size?: number; className?: string }) {
  const ink = locked ? 'var(--g500)' : '#fff';
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true"
      className={cx('block overflow-visible', !locked && 'drop-shadow-[0_6px_12px_rgba(0,0,0,.3)]', className)}>
      {locked ? (
        <>
          <polygon points={RIM} strokeWidth="8" strokeLinejoin="round" className="fill-fill stroke-fill" />
          <polygon points={FACE} strokeWidth="8" strokeLinejoin="round" className="fill-fill-2 stroke-fill-2" />
        </>
      ) : (
        <>
          <polygon points={RIM} fill={TIER[tier][0]} stroke={TIER[tier][0]} strokeWidth="8" strokeLinejoin="round" opacity=".6" />
          <polygon points={FACE} fill={`url(#m-${tier})`} stroke={TIER[tier][1]} strokeWidth="8" strokeLinejoin="round" />
          <polygon points={FACE} fill={`url(#m-${tier})`} />
          <polygon points={FACE} fill="url(#m-sheen)" />
          <path d={SPARK} transform="translate(27 37) scale(.9)" fill="#fff" opacity=".9" />
          <path d={SPARK} transform="translate(74 33) scale(.7)" fill="#fff" opacity=".9" />
        </>
      )}
      <g transform={label ? 'translate(33.2 23) scale(1.4)' : 'translate(23.6 23.6) scale(2.2)'} fill={ink} fillRule="evenodd">{iconShapes(icon)}</g>
      {label && (
        <text x="50" y="76" fontSize={label.length > 3 ? 13 : 16} fill={ink} textAnchor="middle" className="font-sans font-bold tracking-[-.02em]">{label}</text>
      )}
    </svg>
  );
}

export function Medal({ b, size = 68 }: { b: Badge; size?: number }) {
  return <Hex tier={b.tier} icon={GLYPH[b.k]} label={b.label} locked={!b.got} size={size} />;
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
      { cancel: false, content: <Medal b={b} size={136} /> },
    );
  return (
    <button type="button" onClick={open} aria-label={`${b.name}: ${b.got ? 'kazanıldı' : progress}`}
      className={cx('relative flex cursor-pointer flex-col items-center gap-[3px] rounded-2xl px-0.5 py-2.5 text-center text-xs text-muted active:bg-fill', className)}>
      {isNew && <span className="absolute top-0.5 right-1.5 z-1 rounded-full bg-flame px-[7px] py-px text-[11px] font-semibold text-white">Yeni</span>}
      <Medal b={b} size={72} />
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
