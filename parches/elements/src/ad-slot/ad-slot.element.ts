import { ParcheElement, whenConsented } from '@parche/elements/client';

const loadedScripts = new Map<string, Promise<void>>();

function loadScript(src: string, attrs: Record<string, string> = {}): Promise<void> {
  let p = loadedScripts.get(src);
  if (!p) {
    p = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.async = true;
      s.src = src;
      for (const [k, v] of Object.entries(attrs)) s.setAttribute(k, v);
      s.onload = () => resolve();
      s.onerror = () => reject(new Error(`ad script failed: ${src}`));
      document.head.append(s);
    });
    loadedScripts.set(src, p);
  }
  return p;
}

/**
 * <parche-ad> — once the visitor agrees to "ads" (or at once under a
 * certified CMP) and the slot is near the viewport, loads the network into
 * the reserved box: an AdSense unit, or a network's script and container.
 * Each script loads once per page. Emits `parche:adloadd`.
 */
export class ParcheAdSlot extends ParcheElement {
  static tag = 'parche-ad' as const;

  protected setup(signal: AbortSignal): void {
    const start = () => {
      if (typeof IntersectionObserver !== 'function') return void this.#load();
      const io = new IntersectionObserver((entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          void this.#load();
        }
      }, { rootMargin: '400px 0px' });
      io.observe(this);
      signal.addEventListener('abort', () => io.disconnect());
    };
    if (this.getAttribute('consent') === 'cmp') start();
    else whenConsented('ads', start, signal);
  }

  protected update(): void {}

  async #load(): Promise<void> {
    const box = this.part('box');
    if (!box || this.getAttribute('data-state') === 'loaded') return;
    try {
      if (this.getAttribute('provider') === 'script') {
        const template = box.querySelector('template');
        if (template) box.replaceChildren(template.content.cloneNode(true));
        const src = this.getAttribute('src');
        if (src) await loadScript(src);
      } else {
        const client = this.getAttribute('client');
        const unit = this.getAttribute('unit');
        if (!client || !unit) return;
        const ins = document.createElement('ins');
        ins.className = 'adsbygoogle';
        ins.style.cssText = 'display:block;width:100%;height:100%';
        ins.dataset.adClient = client;
        ins.dataset.adSlot = unit;
        box.replaceChildren(ins);
        await loadScript(`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(client)}`, { crossorigin: 'anonymous' });
        ((window as any).adsbygoogle ||= []).push({});
      }
      this.setState(this, 'loaded');
      this.emitted('adload', { provider: this.getAttribute('provider') });
    } catch {
      /* the reserved space stays; the page does not move */
    }
  }
}

ParcheAdSlot.define();
