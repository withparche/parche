/**
 * ParcheElement — the base for every interactive element.
 *
 * An HTML web component: the `.astro` part renders the complete, accessible
 * markup on the server; the element only upgrades it on the client. State lives
 * in attributes on the root, so a DOM morph (the builder's Idiomorph, view
 * transitions) re-syncs the element through `attributeChangedCallback` instead
 * of re-running setup.
 *
 * Nothing here touches `window` or `document` at module scope — the module is
 * importable on Node and on Cloudflare workerd; `define()` is a no-op there.
 * `HTMLElement` itself does not exist on the server, so the base class extends
 * it only where it is defined and an inert stand-in elsewhere: a subclass can
 * be imported (and its `define()` called) on the server without throwing.
 */
const Base: typeof HTMLElement =
  typeof HTMLElement === 'undefined' ? (class {} as unknown as typeof HTMLElement) : HTMLElement;

export abstract class ParcheElement extends Base {
  /** The custom element tag. Every subclass sets it. */
  static tag: `parche-${string}`;
  /** Attributes whose change re-runs `update()`. */
  static observedAttributes: string[] = [];
  /** Opt in to re-running `update()` when direct children are added or removed. */
  static observeChildren = false;

  #controller: AbortController | null = null;
  #observer: MutationObserver | null = null;
  #ready = false;

  /**
   * Register the element once. Safe under HMR, duplicate imports, a package
   * copy and an ejected copy on the same page, and on the server.
   */
  static define(this: typeof ParcheElement & CustomElementConstructor): void {
    if (typeof customElements === 'undefined') return;
    if (!customElements.get(this.tag)) customElements.define(this.tag, this);
  }

  connectedCallback(): void {
    if (this.#ready) return; // a move in the DOM reconnects; it is not a new setup
    this.#ready = true;
    this.#controller = new AbortController();
    this.setup(this.#controller.signal);
    this.update();
    const ctor = this.constructor as typeof ParcheElement;
    if (ctor.observeChildren) {
      this.#observer = new MutationObserver(() => this.update());
      this.#observer.observe(this, { childList: true });
    }
    this.dataset.upgraded = '';
  }

  disconnectedCallback(): void {
    this.#controller?.abort();
    this.#controller = null;
    this.#observer?.disconnect();
    this.#observer = null;
    this.#ready = false;
    delete this.dataset.upgraded;
  }

  attributeChangedCallback(): void {
    if (this.#ready) this.update();
  }

  /**
   * Bind listeners once. Every listener must pass `{ signal }` so it is removed
   * on disconnect. Read state from the DOM when handling events, never from a
   * cached copy — the attributes are the source of truth.
   */
  protected abstract setup(signal: AbortSignal): void;

  /**
   * Sync `data-state` / `aria-*` on the parts from the root's attributes.
   * Idempotent: runs on connect, on every observed attribute change, and on
   * child changes when `observeChildren` is set.
   */
  protected abstract update(): void;

  /**
   * Parts of this instance by `data-part`. A part belongs to the nearest
   * `parche-*` element above it, so a Dialog's `panel` inside a Tabs panel,
   * or a Toc's `list` inside one, is never mistaken for this element's own
   * (the gate found exactly that: Tabs hid a Dialog's panel with
   * `until-found`). Static elements are not boundaries: a Combobox's input
   * lives inside a Field and is still the Combobox's.
   */
  protected parts<T extends HTMLElement = HTMLElement>(name: string): T[] {
    return Array.from(this.querySelectorAll<T>(`[data-part="${name}"]`)).filter((el) => {
      let p = el.parentElement;
      while (p && p !== this) {
        if (p.tagName.startsWith('PARCHE-')) return false;
        p = p.parentElement;
      }
      return p === this;
    });
  }

  /** First part of this instance by `data-part`, or null. */
  protected part<T extends HTMLElement = HTMLElement>(name: string): T | null {
    return this.parts<T>(name)[0] ?? null;
  }

  protected setState(el: Element, state: string): void {
    if (el.getAttribute('data-state') !== state) el.setAttribute('data-state', state);
  }

  protected get reducedMotion(): boolean {
    return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /**
   * Dispatch `parche:<name>` (bubbling, cancelable). Returns false when a
   * listener called `preventDefault()`. Pair it with `emitted()` after the
   * change has been applied.
   */
  protected emit<T = unknown>(name: string, detail?: T): boolean {
    return this.dispatchEvent(new CustomEvent(`parche:${name}`, { detail, bubbles: true, cancelable: true }));
  }

  /** Dispatch the non-cancelable `parche:<name>d` after-event. */
  protected emitted<T = unknown>(name: string, detail?: T): void {
    this.dispatchEvent(new CustomEvent(`parche:${name}d`, { detail, bubbles: true }));
  }
}
