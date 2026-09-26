/**
 * A tiny arithmetic evaluator for calculator formulas: numbers, the input
 * names, + - * / ( ), unary minus, and min, max, round, floor, ceil. No
 * eval, no property access: a formula can only compute a number from the
 * inputs. Shared by the server render (the first result) and the element.
 */
type Token = { t: 'num'; v: number } | { t: 'id'; v: string } | { t: 'op'; v: string };

const FUNCS: Record<string, (...a: number[]) => number> = {
  min: Math.min,
  max: Math.max,
  round: (x: number) => Math.round(x),
  floor: (x: number) => Math.floor(x),
  ceil: (x: number) => Math.ceil(x),
};

function tokenize(src: string): Token[] {
  const out: Token[] = [];
  const re = /\s*(?:(\d+(?:\.\d+)?)|([A-Za-z_][A-Za-z0-9_]*)|([-+*/(),]))/y;
  let m: RegExpExecArray | null;
  while (re.lastIndex < src.length && (m = re.exec(src))) {
    if (m[1]) out.push({ t: 'num', v: Number(m[1]) });
    else if (m[2]) out.push({ t: 'id', v: m[2] });
    else out.push({ t: 'op', v: m[3] });
  }
  if (src.slice(re.lastIndex).trim()) throw new Error(`Unexpected "${src.slice(re.lastIndex).trim()}" in formula`);
  return out;
}

/** Evaluates `formula` with `vars`; throws on an unknown name or a malformed formula. */
export function evaluate(formula: string, vars: Record<string, number>): number {
  const tokens = tokenize(formula);
  let i = 0;
  const peek = () => tokens[i];
  const take = () => tokens[i++];
  const expect = (v: string) => {
    const t = take();
    if (!t || t.t !== 'op' || t.v !== v) throw new Error(`Expected "${v}" in formula`);
  };
  const primary = (): number => {
    const t = take();
    if (!t) throw new Error('Formula ends too soon');
    if (t.t === 'num') return t.v;
    if (t.t === 'op' && t.v === '-') return -primary();
    if (t.t === 'op' && t.v === '(') {
      const v = sum();
      expect(')');
      return v;
    }
    if (t.t === 'id') {
      if (peek()?.t === 'op' && peek()?.v === '(') {
        const fn = FUNCS[t.v];
        if (!fn) throw new Error(`Unknown function "${t.v}"`);
        take();
        const args = [sum()];
        while (peek()?.t === 'op' && peek()?.v === ',') {
          take();
          args.push(sum());
        }
        expect(')');
        return fn(...args);
      }
      if (!(t.v in vars)) throw new Error(`Unknown name "${t.v}" in formula`);
      return vars[t.v];
    }
    throw new Error(`Unexpected "${t.v}" in formula`);
  };
  const product = (): number => {
    let v = primary();
    while (peek()?.t === 'op' && (peek()!.v === '*' || peek()!.v === '/')) {
      const op = take()!.v;
      const r = primary();
      v = op === '*' ? v * r : v / r;
    }
    return v;
  };
  const sum = (): number => {
    let v = product();
    while (peek()?.t === 'op' && (peek()!.v === '+' || peek()!.v === '-')) {
      const op = take()!.v;
      const r = product();
      v = op === '+' ? v + r : v - r;
    }
    return v;
  };
  const v = sum();
  if (i < tokens.length) throw new Error('Unexpected text at the end of the formula');
  return v;
}

/** A result as shown: grouped digits, a fixed number of decimals. */
export function format(value: number, decimals = 0, locale = 'en-GB'): string {
  if (!Number.isFinite(value)) return '–';
  return value.toLocaleString(locale, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}
