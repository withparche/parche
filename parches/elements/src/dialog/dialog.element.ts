import { ParcheElement } from '@parche/elements/client';

/** The `command` event an invoker sends to its target (not yet in every TS lib). */
interface CommandEventLike extends Event {
  command: string;
  source: Element | null;
}

const hasCommands = () => typeof HTMLButtonElement !== 'undefined' && 'command' in HTMLButtonElement.prototype;
const hasClosedBy = () => typeof HTMLDialogElement !== 'undefined' && 'closedBy' in HTMLDialogElement.prototype;

let invokers: Promise<void> | null = null;
/** Load the invoker-commands polyfill once, only where the platform lacks them. */
export function polyfillInvokers(): Promise<void> {
  if (hasCommands()) return Promise.resolve();
  invokers ??= import('invokers-polyfill/fn').then((m) => {
    if (!m.isSupported()) m.apply();
  });
  return invokers;
}

/**
 * <parche-dialog> — upgrades a native modal <dialog>:
 * - `parche:open` / `parche:close` before (cancelable), `parche:opened` /
 *   `parche:closed` after; `data-state` on the root;
 * - `show()` / `close()` for scripts, on top of the declarative invokers;
 * - polyfills `command`/`commandfor` and `closedby` where the platform lacks
 *   them. Focus trap, Escape and focus return are the platform's.
 * State lives in the <dialog>'s `open`; nothing is cached.
 */
export class ParcheDialog extends ParcheElement {
  static tag: `parche-${string}` = 'parche-dialog';

  get dialog(): HTMLDialogElement | null {
    return this.querySelector(':scope > dialog');
  }

  get open(): boolean {
    return this.dialog?.open ?? false;
  }

  get closedBy(): string {
    return this.dialog?.getAttribute('closedby') ?? 'closerequest';
  }

  show(): void {
    const dialog = this.dialog;
    if (dialog && !dialog.open && this.emit('open')) dialog.showModal();
  }

  close(returnValue?: string): void {
    const dialog = this.dialog;
    if (dialog?.open && this.emit('close')) dialog.close(returnValue);
  }

  protected setup(signal: AbortSignal): void {
    const dialog = this.dialog;
    if (!dialog) return;

    void polyfillInvokers();

    // An invoker's command reaches the dialog first, cancelable: the veto point.
    dialog.addEventListener(
      'command',
      (event) => {
        const { command } = event as CommandEventLike;
        if (command === 'show-modal' || command === 'show') {
          if (!this.emit('open')) event.preventDefault();
        } else if (command === 'close') {
          if (!this.emit('close')) event.preventDefault();
        }
      },
      { signal },
    );

    // Escape and light dismiss arrive as a cancelable `cancel`.
    dialog.addEventListener(
      'cancel',
      (event) => {
        if (this.closedBy === 'none' || !this.emit('close')) event.preventDefault();
      },
      { signal },
    );

    // `closedby="any"` where the attribute is unknown: a click on the backdrop
    // has the dialog itself as target (the panel carries the padding).
    if (!hasClosedBy()) {
      dialog.addEventListener(
        'click',
        (event) => {
          if (event.target === dialog && this.closedBy === 'any') this.close();
        },
        { signal },
      );
    }

    dialog.addEventListener(
      'close',
      () => {
        this.update();
        this.emitted('close', { returnValue: dialog.returnValue });
      },
      { signal },
    );

    // `open` is the state; watching it covers showModal(), commands and the
    // polyfill alike, in every engine.
    const observer = new MutationObserver(() => {
      this.update();
      if (dialog.open) this.emitted('open');
    });
    observer.observe(dialog, { attributes: true, attributeFilter: ['open'] });
    signal.addEventListener('abort', () => observer.disconnect());
  }

  protected update(): void {
    this.setState(this, this.open ? 'open' : 'closed');
  }
}

ParcheDialog.define();
