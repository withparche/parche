/**
 * ParchePricingToggle — monthly/annual pricing toggle Web Component.
 * Toggles visibility between [data-price-monthly] and [data-price-annual] elements.
 * The toggle button is [data-toggle] with a knob at [data-knob].
 */
class ParchePricingToggle extends HTMLElement {
  connectedCallback() {
    const toggle = this.querySelector('[data-toggle]');
    if (!toggle) return;

    const knob = toggle.querySelector('[data-knob]') as HTMLElement;
    const monthlyPrices = this.querySelectorAll('[data-price-monthly]');
    const annualPrices = this.querySelectorAll('[data-price-annual]');
    const monthlyLabel = this.querySelector('[data-label="monthly"]') as HTMLElement;
    const annualLabel = this.querySelector('[data-label="annual"]') as HTMLElement;
    let isAnnual = false;

    const update = () => {
      if (knob) {
        knob.style.transform = isAnnual ? 'translateX(1.75rem)' : 'translateX(0)';
      }
      monthlyPrices.forEach((el) => el.classList.toggle('hidden', isAnnual));
      annualPrices.forEach((el) => el.classList.toggle('hidden', !isAnnual));
      if (monthlyLabel) monthlyLabel.classList.toggle('text-heading', !isAnnual);
      if (annualLabel) annualLabel.classList.toggle('text-heading', isAnnual);
    };

    update();
    toggle.addEventListener('click', () => {
      isAnnual = !isAnnual;
      update();
    });
  }
}

if (!customElements.get('parche-pricing-toggle')) {
  customElements.define('parche-pricing-toggle', ParchePricingToggle);
}
