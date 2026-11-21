// Small shared building blocks. Styling is Tailwind utilities on top of the theme in globals.css.
// Look: borderless cards with 24px corners on a near-black page, pill buttons, coloured solid icons.
import type { ComponentProps, ReactNode } from 'react';
import { cx } from '@/lib/cx';
import { Icon, type IconName } from './icons';

type Variant = 'default' | 'primary' | 'ghost' | 'inverse';
const VARIANT: Record<Variant, string> = {
  default: 'bg-fill-2 text-fg active:bg-line-2',
  primary: 'bg-fg text-page active:opacity-85',
  ghost: 'bg-transparent text-muted active:bg-fill',
  inverse: 'bg-white text-[#111] active:bg-[#dcdcdc]',
};

/** Class string for anything that should look like a button (also used on links). */
export const btn = (o: { variant?: Variant; big?: boolean; danger?: boolean; className?: string } = {}) =>
  cx(
    'inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-full px-5 font-semibold no-underline',
    'transition-[background-color,opacity,transform] duration-150 ease-out active:scale-[.98] motion-reduce:active:scale-100',
    VARIANT[o.variant ?? 'default'],
    o.big && 'min-h-14 w-full text-[17px]',
    o.danger && 'text-danger',
    o.className,
  );

export function Button({ variant, big, danger, className, type = 'button', ...rest }:
  ComponentProps<'button'> & { variant?: Variant; big?: boolean; danger?: boolean }) {
  return <button type={type} className={btn({ variant, big, danger, className })} {...rest} />;
}

/** Round 44px button, e.g. the back chevron. */
export const circle = 'grid size-11 flex-none cursor-pointer place-items-center rounded-full bg-surface text-fg no-underline active:bg-fill-2';

export const card = 'rounded-3xl bg-surface p-4';
export function Card({ className, ...rest }: ComponentProps<'div'>) {
  return <div className={cx(card, className)} {...rest} />;
}

/** Section heading. */
export function H2({ className, ...rest }: ComponentProps<'h2'>) {
  return <h2 className={cx('mt-7 mb-3 text-[17px] font-semibold tracking-[-.01em]', className)} {...rest} />;
}
export const h1 = 'text-[28px] leading-[1.15] font-bold tracking-[-.02em]';
export const h3 = 'text-[22px] leading-[1.2] font-semibold tracking-[-.02em]';
export const small = 'text-sm text-muted';

export function Badge({ ok, className, ...rest }: ComponentProps<'span'> & { ok?: boolean }) {
  return (
    <span
      className={cx('rounded-full px-2 py-0.5 text-xs font-semibold whitespace-nowrap', ok ? 'bg-ok-bg text-ok' : 'bg-fill text-muted', className)}
      {...rest}
    />
  );
}

export type Tone = 'info' | 'purple' | 'cyan' | 'flame' | 'ok';
export const TONE: Record<Tone, string> = { info: 'text-info', purple: 'text-purple', cyan: 'text-cyan', flame: 'text-flame', ok: 'text-ok' };

/** Stat card: coloured icon, grey label, big value. `stack` puts the icon on top for narrow three-column rows. */
export function Stat({ label, value, unit, foot, icon, tone = 'info', stack, className }:
  { label: string; value: ReactNode; unit?: string; foot?: ReactNode; icon?: IconName; tone?: Tone; stack?: boolean; className?: string }) {
  return (
    <Card className={cx(icon && !stack && 'flex items-center gap-3.5', className)}>
      {icon && <Icon name={icon} className={cx(stack ? 'mb-2 size-6' : 'size-8', TONE[tone])} />}
      <div className="min-w-0">
        <p className={small}>{label}</p>
        <div className="num text-2xl leading-tight font-semibold whitespace-nowrap">
          {value}{unit && <span className="text-sm font-normal text-muted"> {unit}</span>}
        </div>
        {foot && <p className={small}>{foot}</p>}
      </div>
    </Card>
  );
}

/** Grouped list container; put rows inside. */
export function Group({ className, ...rest }: ComponentProps<'div'>) {
  return <div className={cx('overflow-hidden rounded-3xl bg-surface [&>*+*]:border-t [&>*+*]:border-line', className)} {...rest} />;
}
export const row = 'flex min-h-16 w-full items-center gap-3 px-4 py-2.5 text-left text-fg no-underline';
export const rowTap = 'cursor-pointer active:bg-fill';

/** Row content: tinted icon square, label with optional sub line, and whatever goes on the right. */
export function RowBody({ icon, label, sub, danger, children }:
  { icon?: IconName; label: ReactNode; sub?: ReactNode; danger?: boolean; children?: ReactNode }) {
  return (
    <>
      {icon && (
        <span className={cx('grid size-9 flex-none place-items-center rounded-xl', danger ? 'bg-danger/15 text-danger' : 'bg-fill-2')}>
          <Icon name={icon} />
        </span>
      )}
      <div className={cx('min-w-0 flex-1 font-medium', danger && 'text-danger')}>
        {label}
        {sub && <p className={cx(small, 'font-normal')}>{sub}</p>}
      </div>
      {children}
    </>
  );
}
export const Chevron = () => <span className="text-lg text-muted" aria-hidden="true">›</span>;

/** − value + control used in settings and the workout screen. */
export function Stepper({ value, onStep, label, big }: { value: ReactNode; onStep: (dir: 1 | -1) => void; label: string; big?: boolean }) {
  const b = cx(
    'grid flex-none cursor-pointer place-items-center rounded-full bg-fill-2 font-normal transition-transform duration-100 ease-out active:scale-[.92] motion-reduce:active:scale-100',
    big ? 'size-[52px] text-2xl' : 'size-10 text-xl',
  );
  return (
    <div className={cx('flex items-center', big ? 'w-full justify-between' : 'gap-1')}>
      <button type="button" className={b} aria-label={`${label} azalt`} onClick={() => onStep(-1)}>−</button>
      {value}
      <button type="button" className={b} aria-label={`${label} artır`} onClick={() => onStep(1)}>+</button>
    </div>
  );
}

/** Pill-shaped option buttons. */
export function Segmented<T extends string>({ options, value, onChange, label, className }:
  { options: [T, string][]; value: T; onChange: (v: T) => void; label: string; className?: string }) {
  return (
    <div role="group" aria-label={label} className={cx('flex gap-0.5 rounded-full bg-fill-2 p-[3px]', className)}>
      {options.map(([k, name]) => (
        <button
          key={k} type="button" aria-pressed={value === k} onClick={() => onChange(k)}
          className={cx('min-h-[34px] cursor-pointer rounded-full px-3 text-sm font-semibold', value === k ? 'bg-fg text-page' : 'text-muted')}
        >
          {name}
        </button>
      ))}
    </div>
  );
}
