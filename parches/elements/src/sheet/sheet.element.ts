import { ParcheDialog } from '../dialog/dialog.element.ts';

/**
 * <parche-sheet> — a Dialog docked to an edge. The behaviour is Dialog's
 * (invokers, `closedby`, events, state hook) plus one thing a drawer needs:
 * following a link inside it closes it, so a same-page anchor does not leave
 * the menu over the content it just scrolled to.
 */
export class ParcheSheet extends ParcheDialog {
  static tag: `parche-${string}` = 'parche-sheet';

  protected setup(signal: AbortSignal): void {
    super.setup(signal);
    this.dialog?.addEventListener(
      'click',
      (event) => {
        const link = (event.target as Element).closest('a[href]');
        if (link && !event.defaultPrevented) this.close();
      },
      { signal },
    );
  }
}

ParcheSheet.define();
