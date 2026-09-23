import { ParcheElement } from '@parche/elements/client';

/**
 * <parche-banner> — dismisses on the button: collapses the bar where motion
 * is allowed, then removes it, and remembers the choice under `remember`
 * in localStorage. On connect, a remembered dismissal removes it at once.
 * `parche:dismiss` before (cancelable), `parche:dismissed` after.
 */
export class ParcheBanner extends ParcheElement {
  static tag = 'parche-banner' as const;

  get storageKey(): string | null {
    const key = this.getAttribute('remember');
    return key ? `parche-banner:${key}` : null;
  }

  dismiss(): void {
    if (!this.emit('dismiss')) return;
    const key = this.storageKey;
    if (key) {
      try {
        localStorage.setItem(key, '1');
      } catch {}
    }
    const finish = () => {
      this.remove();
      this.emitted('dismiss');
    };
    if (this.reducedMotion) return finish();
    this.style.height = `${this.offsetHeight}px`;
    this.style.overflow = 'hidden';
    void this.offsetHeight; // commit the height before transitioning it
    this.style.transition = 'height 0.25s ease, opacity 0.25s ease';
    this.style.height = '0';
    this.style.opacity = '0';
    this.setState(this, 'closing');
    this.addEventListener('transitionend', finish, { once: true });
  }

  protected setup(signal: AbortSignal): void {
    const key = this.storageKey;
    if (key) {
      try {
        if (localStorage.getItem(key)) {
          this.remove();
          return;
        }
      } catch {}
    }
    this.part('dismiss')?.addEventListener('click', () => this.dismiss(), { signal });
  }

  protected update(): void {}
}

ParcheBanner.define();
