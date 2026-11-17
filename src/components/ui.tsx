// Small shared building blocks. Styling is Tailwind utilities on top of the theme in globals.css.
import type { ComponentProps, ReactNode } from 'react';
import { cx } from '@/lib/cx';
import { Icon, type IconName } from './icons';

type Variant = 'default' | 'primary' | 'ghost' | 'inverse';
const VARIANT: Record<Variant, string> = {
  default: 'border-line bg-surface text-fg active:bg-fill-2',
  primary: 'border-fg bg-fg text-surface active:bg-muted',
  ghost: 'border-transparent bg-transparent text-muted active:bg-fill-2',
  inverse: 'border-transparent bg-white text-[#111] active:bg-[#dcdcdc]',
};

/** Class string for anything that should look like a button (also used on links). */
export const btn = (o: { variant?: Variant; big?: boolean; danger?: boolean; className?: string } = {}) =>
  cx(
    'inline-flex min-h-11 cursor-pointer items-center justify-center gap-1.5 rounded-[10px] border px-4 font-[550] no-underline',
    'transition-[background-color,border-color,transform] duration-150 ease-out active:scale-[.98] motion-reduce:active:scale-100',
    VARIANT[o.variant ?? 'default'],
    o.big && 'min-h-14 w-full rounded-[14px] text-[17px]',
    o.danger && 'text-danger',
    o.className,
  );

export function Button({ variant, big, danger, className, type = 'button', ...rest }:
  ComponentProps<'button'> & { variant?: Variant; big?: boolean; danger?: boolean }) {
  return <button type={type} className={btn({ variant, big, danger, className })} {...rest} />;
}

export const card = 'rounded-[18px] border border-line bg-surface p-4 shadow-card';
export function Card({ className, ...rest }: ComponentProps<'div'>) {
  return <div className={cx(card, className)} {...rest} />;
}

/** Section heading. */
export function H2({ className, ...rest }: ComponentProps<'h2'>) {
  return <h2 className={cx('mt-7 mb-2.5 text-[13px] font-[550] tracking-[.04em] text-muted uppercase', className)} {...rest} />;
}
export const h1 = 'text-[28px] leading-[1.15] font-[650] tracking-[-.03em]';
export const h3 = 'text-[22px] leading-[1.2] font-[620] tracking-[-.02em]';
export const small = 'text-sm text-muted';

export function Badge({ ok, className, ...rest }: ComponentProps<'span'> & { ok?: boolean }) {
  return (
    <span
      className={cx('rounded-full px-2 py-0.5 text-xs font-[550] whitespace-nowrap', ok ? 'bg-ok-bg text-ok' : 'bg-fill text-muted', className)}
      {...rest}
    />
  );
}

/** Small card with a label, a big number and an optional unit / footnote. */
export function Stat({ label, value, unit, foot, className }:
  { label: string; value: ReactNode; unit?: string; foot?: ReactNode; className?: string }) {
  return (
    <Card className={className}>
      <p className={small}>{label}</p>
      <div className="num text-[22px] font-semibold whitespace-nowrap">
        {value}{unit && <span className="text-sm font-normal text-muted"> {unit}</span>}
      </div>
      {foot && <p className={small}>{foot}</p>}
    </Card>
  );
}

/** iOS-style grouped list container; put <Row>s inside. */
export function Group({ className, ...rest }: ComponentProps<'div'>) {
  return <div className={cx('overflow-hidden rounded-[18px] border border-line bg-surface shadow-card [&>*+*]:border-t [&>*+*]:border-fill-2', className)} {...rest} />;
}
export const row = 'flex min-h-15 w-full items-center gap-3 px-3.5 py-2 text-left text-fg no-underline';
export const rowTap = 'cursor-pointer active:bg-fill';

/** Row content: tinted icon square, label with optional sub line, and whatever goes on the right. */
export function RowBody({ icon, label, sub, danger, children }:
  { icon?: IconName; label: ReactNode; sub?: ReactNode; danger?: boolean; children?: ReactNode }) {
  return (
    <>
      {icon && (
        <span className={cx('grid size-[34px] flex-none place-items-center rounded-[10px]', danger ? 'bg-danger/10 text-danger' : 'bg-fill')}>
          <Icon name={icon} />
        </span>
      )}
      <div className={cx('min-w-0 flex-1', danger && 'text-danger')}>
        {label}
        {sub && <p className={small}>{sub}</p>}
      </div>
      {children}
    </>
  );
}
export const Chevron = () => <span className="text-muted" aria-hidden="true">›</span>;

/** − value + control used in settings and the workout screen. */
export function Stepper({ value, onStep, label, big }: { value: ReactNode; onStep: (dir: 1 | -1) => void; label: string; big?: boolean }) {
  const b = cx(
    'grid flex-none cursor-pointer place-items-center rounded-full bg-fill font-normal transition-transform duration-100 ease-out active:scale-[.92] motion-reduce:active:scale-100',
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

/** Pill-shaped filter / option buttons. */
export function Segmented<T extends string>({ options, value, onChange, label, className }:
  { options: [T, string][]; value: T; onChange: (v: T) => void; label: string; className?: string }) {
  return (
    <div role="group" aria-label={label} className={cx('flex gap-1 rounded-[10px] bg-fill p-1', className)}>
      {options.map(([k, name]) => (
        <button
          key={k} type="button" aria-pressed={value === k} onClick={() => onChange(k)}
          className={cx('min-h-[34px] cursor-pointer rounded-md px-2.5 text-sm font-[550]', value === k ? 'bg-surface text-fg shadow-card' : 'text-muted')}
        >
          {name}
        </button>
      ))}
    </div>
  );
}
