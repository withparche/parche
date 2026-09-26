// The part of Idiomorph the preview client uses (the package ships no types).
declare module 'idiomorph' {
  export const Idiomorph: {
    morph(target: Element, next: Element | string, options?: { morphStyle?: 'innerHTML' | 'outerHTML'; ignoreActiveValue?: boolean }): unknown;
  };
}
