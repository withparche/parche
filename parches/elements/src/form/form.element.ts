import { ParcheElement } from '@parche/elements/client';

type Control = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

/**
 * <parche-form> — validates in place and sends without leaving the page.
 *
 * Submit: the browser's constraints decide what is invalid; the element writes
 * each control's `validationMessage` into its Field's error (`<id>-error`),
 * sets `aria-invalid`, and focuses the first one. A valid form emits the
 * cancelable `parche:submit` (an integration may take over), then posts with
 * fetch and moves `data-state` to loading, then success or error, emitting
 * `parche:submitd` with `{ ok, response }`. Nothing typed is ever cleared.
 */
export class ParcheForm extends ParcheElement {
  static tag = 'parche-form' as const;

  #idleLabel = '';

  protected setup(signal: AbortSignal): void {
    const form = this.part<HTMLFormElement>('form');
    if (!form) return;
    // The element reports errors itself, in the page's words and place.
    form.noValidate = true;
    this.#idleLabel = this.#button(form)?.textContent ?? '';

    form.addEventListener('input', (e) => this.#clear(e.target as Control), { signal });
    form.addEventListener('change', (e) => this.#clear(e.target as Control), { signal });
    form.addEventListener(
      'submit',
      (event) => {
        event.preventDefault();
        if (this.getAttribute('data-state') === 'loading') return;
        if (!this.#check(form)) return;
        if (!this.emit('submit', { form })) return;
        void this.#send(form);
      },
      { signal },
    );
  }

  protected update(): void {}

  #button(form: HTMLFormElement): HTMLButtonElement | null {
    return form.querySelector<HTMLButtonElement>('button[type="submit"], button:not([type])');
  }

  #errorNode(control: Control): HTMLElement | null {
    if (!control.id) return null;
    const existing = this.querySelector<HTMLElement>(`#${CSS.escape(control.id)}-error`);
    if (existing) return existing;
    const field = control.closest('.parche-field');
    if (!field) return null;
    const p = document.createElement('p');
    p.id = `${control.id}-error`;
    p.className = 'parche-field-error text-sm text-danger';
    p.dataset.part = 'error';
    field.append(p);
    const described = control.getAttribute('aria-describedby');
    control.setAttribute('aria-describedby', [described, p.id].filter(Boolean).join(' '));
    return p;
  }

  #clear(control: Control): void {
    if (!control || control.getAttribute('aria-invalid') !== 'true' || !control.checkValidity()) return;
    control.removeAttribute('aria-invalid');
    const node = this.#errorNode(control);
    if (node) node.textContent = '';
    control.closest('.parche-field')?.setAttribute('data-state', 'valid');
  }

  #check(form: HTMLFormElement): boolean {
    const invalid = Array.from(form.elements).filter(
      (el): el is Control => 'checkValidity' in el && typeof (el as Control).checkValidity === 'function' && !(el as Control).checkValidity(),
    );
    for (const control of invalid) {
      control.setAttribute('aria-invalid', 'true');
      const node = this.#errorNode(control);
      if (node) node.textContent = control.validationMessage;
      control.closest('.parche-field')?.setAttribute('data-state', 'invalid');
    }
    invalid[0]?.focus();
    return invalid.length === 0;
  }

  async #send(form: HTMLFormElement): Promise<void> {
    const button = this.#button(form);
    const error = this.part('error');
    const status = this.part('status');
    if (error) error.hidden = true;
    this.setState(this, 'loading');
    this.setAttribute('aria-busy', 'true');
    if (button) {
      button.disabled = true;
      button.textContent = this.getAttribute('loading-label') ?? 'Sending…';
    }
    if (status) status.textContent = this.getAttribute('loading-label') ?? 'Sending…';

    let ok = false;
    let response: Response | null = null;
    const endpoint = form.getAttribute('action');
    try {
      if (endpoint) {
        response = await fetch(endpoint, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
        ok = response.ok;
      } else {
        // A demo: no endpoint, so the send is simulated.
        await new Promise((r) => setTimeout(r, 900));
        ok = true;
      }
    } catch {
      ok = false;
    }

    this.removeAttribute('aria-busy');
    if (button) button.disabled = false;
    if (ok) {
      this.setState(this, 'success');
      const done = this.getAttribute('success-label');
      if (button) {
        button.textContent = done || this.#idleLabel;
        if (done) button.disabled = true;
      }
      const panel = this.part('success');
      const mode = this.getAttribute('data-success');
      if (panel && mode !== 'button') {
        panel.hidden = false;
        if (mode === 'replace') form.hidden = true;
        panel.focus();
      }
      if (status) status.textContent = done || panel?.textContent?.trim().slice(0, 140) || 'Sent';
    } else {
      this.setState(this, 'error');
      if (button) button.textContent = this.#idleLabel;
      if (error) error.hidden = false;
      if (status) status.textContent = '';
    }
    this.emitted('submit', { ok, response });
  }
}

ParcheForm.define();
