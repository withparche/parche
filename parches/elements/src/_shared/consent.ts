/**
 * The visitor's consent, by category ('ads', 'comments', 'analytics'…), as
 * the Consent element records it. Anything that sets cookies or loads a third
 * party waits on it: `whenConsented('ads', load)` runs now if the visitor has
 * agreed and otherwise when they do. Nothing is granted by default.
 *
 * A site that uses a certified CMP instead (AdSense in the EEA, UK and
 * Switzerland needs a TCF v2.3 one) marks the page with
 * `<html data-consent="cmp">`: the CMP gates the third party itself, and
 * `whenConsented` runs at once. Nothing here touches `window` at import.
 */
export const CONSENT_KEY = 'parche-consent';
export const CONSENT_EVENT = 'parche:consent';

export type Choices = Record<string, boolean>;

/** The recorded choices, or null when the visitor has not chosen yet. */
export function readConsent(): Choices | null {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    return raw ? (JSON.parse(raw).choices as Choices) : null;
  } catch {
    return null;
  }
}

/** Records the choices and tells whoever waits. */
export function writeConsent(choices: Choices): void {
  try {
    localStorage.setItem(CONSENT_KEY, JSON.stringify({ v: 1, at: new Date().toISOString(), choices }));
  } catch {
    /* private mode: the choice holds for this page */
  }
  document.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: choices }));
}

/** Runs `run` once the visitor agrees to `category`: now, or when they do. */
export function whenConsented(category: string, run: () => void, signal?: AbortSignal): void {
  if (document.documentElement.dataset.consent === 'cmp' || readConsent()?.[category]) {
    run();
    return;
  }
  const listener = (e: Event) => {
    if ((e as CustomEvent<Choices>).detail?.[category]) {
      document.removeEventListener(CONSENT_EVENT, listener);
      run();
    }
  };
  document.addEventListener(CONSENT_EVENT, listener, { signal });
}
