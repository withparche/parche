import { ParcheElement, closeOnOutside, positionFallback, supportsAnchorPositioning } from '@parche/elements/client';
import { polyfillPopover } from '../popover/popover.element.ts';

/**
 * <parche-combobox> — the list-autocomplete combobox, after GitHub's
 * `combobox-nav`: focus stays in the input, `aria-activedescendant` names
 * the highlighted option, ArrowDown / ArrowUp move it, Enter commits, Escape
 * closes. Typing filters the options (case-insensitive contains) and opens
 * the list; the empty state shows when nothing matches.
 * - on upgrade the native `<datalist>` is detached (the listbox replaces it)
 *   and the indicator button appears;
 * - a commit sets the input's text to the option's label and `data-value`
 *   to its value, and emits `parche:select` (`{ value, label }`);
 * - the listbox is a manual popover anchored under the input, positioned
 *   by the lazy fallback where CSS anchors are missing.
 */
export class ParcheCombobox extends ParcheElement {
  static tag = 'parche-combobox' as const;

  #stop: (() => void) | null = null;

  get input(): HTMLInputElement | null {
    return this.part<HTMLInputElement>('input');
  }

  get listbox(): HTMLElement | null {
    return this.part('listbox');
  }

  get options(): HTMLElement[] {
    return this.parts('option');
  }

  /** The options matching the current text. */
  get visible(): HTMLElement[] {
    return this.options.filter((o) => !o.hidden);
  }

  get open(): boolean {
    return this.dataset.state === 'open';
  }

  get value(): string {
    return this.input?.dataset.value ?? '';
  }

  show(filter = true): void {
    const input = this.input;
    const listbox = this.listbox;
    if (!input || !listbox || input.disabled) return;
    this.#filter(filter ? input.value : '');
    if (!this.open) {
      try {
        listbox.showPopover();
      } catch {
        return;
      }
      this.dataset.state = 'open';
      input.setAttribute('aria-expanded', 'true');
      void this.#anchor();
    }
  }

  hide(): void {
    const input = this.input;
    const listbox = this.listbox;
    if (!input || !listbox || !this.open) return;
    try {
      listbox.hidePopover();
    } catch {}
    this.dataset.state = 'closed';
    input.setAttribute('aria-expanded', 'false');
    this.#activate(null);
    this.#stop?.();
    this.#stop = null;
  }

  /** Pick an option: text and value into the input, then close. */
  commit(option: HTMLElement): void {
    const input = this.input;
    if (!input) return;
    const detail = { value: option.dataset.value ?? '', label: option.dataset.label ?? option.textContent?.trim() ?? '' };
    if (!this.emit('select', detail)) return;
    input.value = detail.label;
    input.dataset.value = detail.value;
    this.hide();
    this.emitted('select', detail);
  }

  protected setup(signal: AbortSignal): void {
    const input = this.input;
    const listbox = this.listbox;
    if (!input || !listbox) return;

    void polyfillPopover();

    // The listbox replaces the native suggestions; the indicator appears.
    input.removeAttribute('list');
    this.part('datalist')?.remove();
    const indicator = this.part<HTMLButtonElement>('indicator');
    if (indicator) indicator.hidden = false;

    input.addEventListener(
      'input',
      () => {
        delete input.dataset.value; // typed text is not a committed option
        this.show();
      },
      { signal },
    );
    input.addEventListener('click', () => this.show(false), { signal });

    input.addEventListener(
      'keydown',
      (event) => {
        switch (event.key) {
          case 'ArrowDown':
            event.preventDefault();
            if (!this.open) this.show(!event.altKey);
            else this.#move(1);
            break;
          case 'ArrowUp':
            event.preventDefault();
            if (this.open) this.#move(-1);
            break;
          case 'Enter': {
            const active = this.#active();
            if (this.open && active) {
              event.preventDefault();
              this.commit(active);
            }
            break;
          }
          case 'Escape':
            if (this.open) {
              event.preventDefault();
              this.hide();
            }
            break;
          case 'Tab':
            this.hide();
            break;
        }
      },
      { signal },
    );

    indicator?.addEventListener(
      'click',
      () => {
        if (this.open) this.hide();
        else {
          this.show(false);
          input.focus();
        }
      },
      { signal },
    );

    // Options are not focusable: a pointerdown would blur the input, so it is
    // prevented and the click commits.
    listbox.addEventListener('pointerdown', (event) => event.preventDefault(), { signal });
    listbox.addEventListener(
      'click',
      (event) => {
        const option = (event.target as Element).closest<HTMLElement>('[data-part="option"]');
        if (option && this.options.includes(option)) this.commit(option);
      },
      { signal },
    );
    listbox.addEventListener(
      'pointermove',
      (event) => {
        const option = (event.target as Element).closest<HTMLElement>('[data-part="option"]');
        if (option && !option.hidden) this.#activate(option);
      },
      { signal },
    );

    closeOnOutside(this, null, () => this.hide(), signal);
    signal.addEventListener('abort', () => this.#stop?.());
  }

  protected update(): void {}

  #filter(text: string): void {
    const needle = text.trim().toLowerCase();
    let shown = 0;
    for (const option of this.options) {
      const hit = !needle || (option.dataset.label ?? option.textContent ?? '').toLowerCase().includes(needle);
      option.hidden = !hit;
      if (hit) shown++;
    }
    const empty = this.part('empty');
    if (empty) empty.hidden = shown > 0;
    if (!this.visible.includes(this.#active()!)) this.#activate(null);
  }

  #active(): HTMLElement | null {
    const id = this.input?.getAttribute('aria-activedescendant');
    return (id && this.options.find((o) => o.id === id)) || null;
  }

  #activate(option: HTMLElement | null): void {
    for (const o of this.options) {
      const on = o === option;
      o.setAttribute('aria-selected', String(on));
      this.setState(o, on ? 'active' : 'inactive');
    }
    const input = this.input;
    if (!input) return;
    if (option) {
      input.setAttribute('aria-activedescendant', option.id);
      option.scrollIntoView({ block: 'nearest' });
    } else input.removeAttribute('aria-activedescendant');
  }

  #move(delta: number): void {
    const visible = this.visible;
    if (visible.length === 0) return;
    const current = visible.indexOf(this.#active()!);
    const next = current === -1 ? (delta > 0 ? 0 : visible.length - 1) : (current + delta + visible.length) % visible.length;
    this.#activate(visible[next]);
  }

  async #anchor(): Promise<void> {
    if (supportsAnchorPositioning()) return;
    const wrapper = this.part('wrapper');
    const listbox = this.listbox;
    if (!wrapper || !listbox) return;
    this.#stop?.();
    this.#stop = await positionFallback(wrapper, listbox, 'bottom-start', 4);
  }
}

ParcheCombobox.define();
