import { roving } from '@parche/elements/client';
import { ParchePopover } from '../popover/popover.element.ts';

/**
 * <parche-menu> — a Popover that behaves as an APG menu:
 * - on open, focus moves into the list (first item; the checked one for a
 *   radio group; the last on ArrowUp from the trigger);
 * - ArrowDown / ArrowUp roam the enabled items and wrap, Home / End jump,
 *   letters type ahead;
 * - activating an item closes the menu and emits `parche:select` with the
 *   item's value and label (a link then navigates as usual);
 * - Tab closes; Escape is the popover's own light dismiss; focus goes back
 *   to the trigger on close whatever opened the menu.
 * Open/closed state, `aria-expanded`, positioning and `open-on-hover` come
 * from Popover.
 */
export class ParcheMenu extends ParchePopover {
  static tag: `parche-${string}` = 'parche-menu';

  #openFromEnd = false;

  get items(): HTMLElement[] {
    return this.parts('item').filter((el) => !el.matches('[aria-disabled="true"], :disabled'));
  }

  protected setup(signal: AbortSignal): void {
    super.setup(signal);
    const surface = this.surface;
    if (!surface) return;

    // Arrow keys on the trigger open the menu and pick the end to focus.
    this.addEventListener(
      'keydown',
      (event) => {
        if (surface.contains(event.target as Node)) return;
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
          event.preventDefault();
          this.#openFromEnd = event.key === 'ArrowUp';
          this.show();
        }
      },
      { signal },
    );

    surface.addEventListener(
      'toggle',
      (event) => {
        if ((event as ToggleEvent).newState !== 'open') {
          // The platform restores focus to what was focused before showPopover();
          // WebKit does not focus a clicked button, so that would be <body>.
          const active = document.activeElement;
          if (!active || active === document.body || surface.contains(active)) this.invokers[0]?.focus();
          return;
        }
        const items = this.items;
        const checked = items.find((el) => el.getAttribute('aria-checked') === 'true');
        const target = this.#openFromEnd ? items[items.length - 1] : (checked ?? items[0]);
        this.#openFromEnd = false;
        target?.focus();
      },
      { signal },
    );

    roving(() => this.items, surface, signal, { orientation: 'vertical' });

    surface.addEventListener(
      'keydown',
      (event) => {
        if (event.key === 'Tab') {
          this.hide();
          return;
        }
        if (event.key.length === 1 && /\S/.test(event.key) && !event.altKey && !event.ctrlKey && !event.metaKey) {
          event.preventDefault();
          this.#typeahead(event.key.toLowerCase());
        }
      },
      { signal },
    );

    surface.addEventListener(
      'click',
      (event) => {
        const item = (event.target as Element).closest<HTMLElement>('[data-part="item"]');
        if (!item || !this.items.includes(item)) return;
        this.emit('select', { value: item.dataset.value, label: item.textContent?.trim() });
        this.hide();
      },
      { signal },
    );

  }


  /** The user clicked the trigger of a menu hover already opened: they mean to use it. */
  protected keptOpen(): void {
    this.items[0]?.focus();
  }

  #typeahead(letter: string): void {
    const items = this.items;
    const from = items.indexOf(document.activeElement as HTMLElement);
    const order = [...items.slice(from + 1), ...items.slice(0, from + 1)];
    order.find((el) => el.textContent?.trim().toLowerCase().startsWith(letter))?.focus();
  }
}

ParcheMenu.define();
