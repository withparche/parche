import { ParcheElement, readConsent, whenConsented } from '@parche/elements/client';

/**
 * <parche-comments> — loads giscus into `frame` when the reader comes near or
 * presses `load`, once consent allows it; keeps its theme on the site's mode.
 * Emits `parche:commentsloadd`.
 */
export class ParcheComments extends ParcheElement {
  static tag = 'parche-comments' as const;

  protected setup(signal: AbortSignal): void {
    const button = this.part<HTMLButtonElement>('load');
    const needsConsent = this.getAttribute('consent') === 'required';
    const ready = () => {
      this.setState(this, 'ready');
      const consentNote = this.part('consent');
      if (consentNote) consentNote.hidden = true;
      if (button) button.hidden = false;
      button?.addEventListener('click', () => this.#load(), { signal, once: true });
      if (typeof IntersectionObserver === 'function') {
        const io = new IntersectionObserver((entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            io.disconnect();
            this.#load();
          }
        }, { rootMargin: '200px 0px' });
        io.observe(this);
        signal.addEventListener('abort', () => io.disconnect());
      }
    };
    if (needsConsent && !readConsent()?.comments && document.documentElement.dataset.consent !== 'cmp') {
      const consentNote = this.part('consent');
      if (consentNote) consentNote.hidden = false;
    }
    if (needsConsent) whenConsented('comments', ready, signal);
    else ready();
    // Follow the site's light or dark mode.
    const mo = new MutationObserver(() => this.#theme());
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    signal.addEventListener('abort', () => mo.disconnect());
  }

  protected update(): void {}

  #mode(): string {
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  }

  #theme(): void {
    const frame = this.querySelector<HTMLIFrameElement>('iframe.giscus-frame');
    frame?.contentWindow?.postMessage({ giscus: { setConfig: { theme: this.#mode() } } }, 'https://giscus.app');
  }

  #load(): void {
    if (this.getAttribute('data-state') === 'loaded') return;
    const frame = this.part('frame');
    if (!frame) return;
    const s = document.createElement('script');
    s.src = 'https://giscus.app/client.js';
    s.async = true;
    s.crossOrigin = 'anonymous';
    const attrs: Record<string, string> = {
      'data-repo': this.getAttribute('repo') ?? '',
      'data-repo-id': this.getAttribute('repo-id') ?? '',
      'data-category': this.getAttribute('category') ?? '',
      'data-category-id': this.getAttribute('category-id') ?? '',
      'data-mapping': this.getAttribute('mapping') ?? 'pathname',
      'data-strict': '1',
      'data-reactions-enabled': '1',
      'data-emit-metadata': '0',
      'data-input-position': 'bottom',
      'data-theme': this.#mode(),
      'data-lang': this.getAttribute('lang') ?? 'en',
      'data-loading': 'lazy',
    };
    for (const [k, v] of Object.entries(attrs)) s.setAttribute(k, v);
    frame.replaceChildren(s);
    const button = this.part('load');
    if (button) button.hidden = true;
    this.setState(this, 'loaded');
    this.emitted('commentsload', { repo: attrs['data-repo'] });
  }
}

ParcheComments.define();
