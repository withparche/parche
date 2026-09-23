import { twMerge } from 'tailwind-merge';

/**
 * Merge class lists, dropping falsy entries and resolving Tailwind conflicts
 * (`p-4` + `p-2` → `p-2`). The one class helper elements use.
 */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return twMerge(classes.filter(Boolean).join(' '));
}

type VariantMap = Record<string, Record<string, string>>;
type VariantProps<V extends VariantMap> = { [K in keyof V]?: keyof V[K] };
type CompoundVariant<V extends VariantMap> = VariantProps<V> & { class: string };

export interface VariantsConfig<V extends VariantMap> {
  /** Classes every instance gets. */
  base: string;
  /** Axis → option → classes. The zod enum in `.props.ts` is the source of truth for the options. */
  variants: V;
  /** Extra classes when several axes match at once (`variant: 'ghost', tone: 'danger'`). */
  compound?: CompoundVariant<V>[];
  /** Option used when a prop is omitted. */
  defaults: { [K in keyof V]: keyof V[K] };
}

/**
 * Build a class resolver for an element's variant axes. Typed against the
 * config, so a misspelt option is a compile error; conflicts are resolved by
 * `twMerge`, so a caller's `class` can override a base utility.
 *
 *   const button = defineVariants({
 *     base: 'inline-flex items-center',
 *     variants: { variant: { primary: 'bg-primary', ghost: 'bg-transparent' }, size: { sm: 'h-8', md: 'h-10' } },
 *     compound: [{ variant: 'ghost', tone: 'danger', class: 'text-danger' }],
 *     defaults: { variant: 'primary', size: 'md' },
 *   });
 *   button({ size: 'sm' }, className)
 */
export function defineVariants<V extends VariantMap>(config: VariantsConfig<V>) {
  return (props: VariantProps<V> = {}, className?: string): string => {
    const chosen = { ...config.defaults, ...stripUndefined(props) } as { [K in keyof V]: keyof V[K] };
    const classes: string[] = [config.base];
    for (const axis of Object.keys(config.variants) as Array<keyof V>) {
      const option = chosen[axis];
      const value = config.variants[axis][option as string];
      if (value) classes.push(value);
    }
    for (const rule of config.compound ?? []) {
      const { class: cls, ...match } = rule;
      const hit = (Object.keys(match) as Array<keyof V>).every((axis) => chosen[axis] === match[axis]);
      if (hit) classes.push(cls);
    }
    return cn(...classes, className);
  };
}

function stripUndefined<T extends object>(obj: T): Partial<T> {
  const out: Partial<T> = {};
  for (const [k, v] of Object.entries(obj)) if (v !== undefined) (out as Record<string, unknown>)[k] = v;
  return out;
}
