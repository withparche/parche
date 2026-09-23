import { ParcheElement, roving, tabbable } from '@parche/elements/client';

/**
 * <parche-tabs> — upgrades server-rendered tabs:
 * - roving tabindex over the enabled tabs (arrows per orientation, Home/End),
 *   automatic activation: the panel follows the focused tab (APG);
 * - `parche:change` before a change (cancelable), `parche:changed` after;
 * - `sync-key`: the selected value lives in the URL query, read on connect
 *   and written with `history.replaceState` (no navigation, no history entry);
 * - a panel is tabbable only when it holds nothing focusable, so Tab from the
 *   tab list lands on content, not on an empty container;
 * - inactive panels are `hidden="until-found"`; a find-in-page match reveals
 *   one (`beforematch`) and selects its tab.
 * State is `data-value` on the root; every part is synced from it.
 */
export class ParcheTabs extends ParcheElement {
  static tag = 'parche-tabs' as const;
  static observedAttributes = ['data-value'];

  #setActive: ((index: number) => void) | null = null;

  get value(): string {
    return this.dataset.value ?? '';
  }

  set value(next: string) {
    this.select(next);
  }

  // Own tabs and panels carry `data-value`; anything else with the same
  // part name inside the panels' content is not ours.
  get tabs(): HTMLButtonElement[] {
    return this.parts<HTMLButtonElement>('tab').filter((t) => 'value' in t.dataset);
  }

  get panels(): HTMLElement[] {
    return this.parts('panel').filter((p) => 'value' in p.dataset);
  }

  /** Select a tab by value. Returns false when unknown, disabled or vetoed. */
  select(value: string): boolean {
    const tab = this.tabs.find((t) => t.dataset.value === value);
    if (!tab || tab.disabled) return false;
    if (value === this.value) return true;
    if (!this.emit('change', { value })) return false;
    this.dataset.value = value; // attributeChangedCallback → update()
    this.#sync(value);
    this.emitted('change', { value });
    return true;
  }

  protected setup(signal: AbortSignal): void {
    const list = this.part('list');
    if (!list) return;

    const key = this.getAttribute('sync-key');
    if (key) {
      const fromUrl = new URL(location.href).searchParams.get(key);
      if (fromUrl) this.select(fromUrl);
    }

    list.addEventListener(
      'click',
      (event) => {
        const tab = (event.target as Element).closest<HTMLButtonElement>('[data-part="tab"]');
        if (tab && this.tabs.includes(tab)) this.select(tab.dataset.value ?? '');
      },
      { signal },
    );

    // Find-in-page revealed a hidden panel: make its tab the selected one.
    this.addEventListener(
      'beforematch',
      (event) => {
        const panel = (event.target as Element).closest<HTMLElement>('[data-part="panel"]');
        if (panel && this.panels.includes(panel)) this.select(panel.dataset.value ?? '');
      },
      { signal },
    );

    this.#setActive = roving(() => this.tabs.filter((t) => !t.disabled), list, signal, {
      orientation: this.dataset.orientation === 'vertical' ? 'vertical' : 'horizontal',
      onMove: (tab) => this.select(tab.dataset.value ?? ''),
    });
  }

  protected update(): void {
    const value = this.value;
    const enabled = this.tabs.filter((t) => !t.disabled);
    for (const tab of this.tabs) {
      const active = tab.dataset.value === value;
      tab.setAttribute('aria-selected', String(active));
      this.setState(tab, active ? 'active' : 'inactive');
    }
    this.#setActive?.(Math.max(0, enabled.findIndex((t) => t.dataset.value === value)));
    for (const panel of this.panels) {
      const active = panel.dataset.value === value;
      if (active) panel.removeAttribute('hidden');
      else panel.setAttribute('hidden', 'until-found');
      this.setState(panel, active ? 'active' : 'inactive');
      // A hidden panel must not be a tab stop: `hidden="until-found"` keeps the
      // element focusable, and focus would land on nothing visible.
      panel.tabIndex = active && tabbable(panel).length === 0 ? 0 : -1;
    }
  }

  #sync(value: string): void {
    const key = this.getAttribute('sync-key');
    if (!key) return;
    const url = new URL(location.href);
    url.searchParams.set(key, value);
    history.replaceState(history.state, '', url);
  }
}

ParcheTabs.define();
