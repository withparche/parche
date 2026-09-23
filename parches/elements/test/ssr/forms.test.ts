import { describe, it, expect } from 'vitest';
import { render, scriptCount } from './_render';
import Label from '../../src/label/Label.astro';
import Field from '../../src/field/Field.astro';
import Input from '../../src/input/Input.astro';
import Textarea from '../../src/textarea/Textarea.astro';
import Select from '../../src/select/Select.astro';
import Checkbox from '../../src/checkbox/Checkbox.astro';
import RadioGroup from '../../src/radio-group/RadioGroup.astro';
import Combobox from '../../src/combobox/Combobox.astro';

describe('Label and Field', () => {
  it('Label ties to its control; the required mark is decorative', async () => {
    const html = await render(Label, { for: 'x', text: 'Name', required: true });
    expect(html).toMatch(/<label for="x"[^>]*>\s*Name\s*<span[^>]*aria-hidden="true">\*<\/span>/);
  });
  it('Field renders label, control slot, description and error under the id convention', async () => {
    const html = await render(Field, { id: 'h', label: 'Handle', description: 'Help', error: 'Taken', required: true }, { default: '<input id="h" />' });
    expect(html).toMatch(/data-part="root"[^>]*data-state="invalid"/);
    expect(html).toMatch(/<label for="h"/);
    expect(html).toContain('<input id="h" />');
    expect(html).toMatch(/<p id="h-description"[^>]*>Help</);
    expect(html).toMatch(/<p id="h-error"[^>]*>Taken</);
    expect(scriptCount(html)).toBe(0);
  });
});

describe('Input, Textarea, Select', () => {
  it('Input references the Field texts and carries the validation state, no script', async () => {
    const html = await render(Input, { name: 'email', label: 'Email', type: 'email', description: 'Help', error: 'Bad', required: true, icon: 'tabler:mail' });
    expect(html).toMatch(/<input[^>]*id="email"[^>]*name="email"[^>]*type="email"[^>]*required[^>]*aria-invalid="true"[^>]*aria-describedby="email-description email-error"/);
    expect(html).toMatch(/data-part="icon"/);
    expect(scriptCount(html)).toBe(0);
  });
  it('Textarea grows by default and carries its value as content', async () => {
    const html = await render(Textarea, { name: 'm', label: 'Message', value: 'hi', rows: 3 });
    expect(html).toMatch(/<textarea[^>]*id="m"[^>]*rows="3"[^>]*\[field-sizing:content\][^>]*>hi<\/textarea>/);
  });
  it('Select renders a placeholder, groups and the selected value', async () => {
    const html = await render(Select, {
      name: 'r',
      label: 'Region',
      placeholder: 'Pick',
      value: 'b',
      options: [{ value: 'a', label: 'A' }, { label: 'G', options: [{ value: 'b', label: 'B' }, { value: 'c', label: 'C', disabled: true }] }],
    });
    expect(html).toMatch(/<option value="" disabled>Pick</);
    expect(html).toMatch(/<optgroup label="G">/);
    expect(html).toMatch(/<option value="b" selected>B</);
    expect(html).toMatch(/<option value="c" disabled>C</);
    expect(scriptCount(html)).toBe(0);
  });
});

describe('Checkbox and RadioGroup', () => {
  it('Checkbox is a native checkbox with an HTML label and linked texts', async () => {
    const html = await render(Checkbox, { name: 't', label: 'I agree to the <a href="/t">terms</a>', required: true, error: 'Required' });
    expect(html).toMatch(/<input type="checkbox" id="t" name="t" value="on" required aria-invalid="true" aria-describedby="t-error"/);
    expect(html).toMatch(/<label for="t"[^>]*>I agree to the <a href="\/t">terms<\/a>/);
    expect(scriptCount(html)).toBe(0);
  });
  it('RadioGroup is a fieldset with a legend, one labelled radio per option, the value checked', async () => {
    const html = await render(RadioGroup, { name: 'b', label: 'Billing', value: 'y', description: 'Help', options: [{ value: 'm', label: 'Monthly' }, { value: 'y', label: 'Yearly', disabled: false }] });
    expect(html).toMatch(/<fieldset[^>]*aria-describedby="b-description"/);
    expect(html).toMatch(/<legend[^>]*>\s*Billing/);
    expect(html).toMatch(/<input type="radio" id="b-m" name="b" value="m"(?! checked)/);
    expect(html).toMatch(/<input type="radio" id="b-y" name="b" value="y" checked/);
    expect(html).toMatch(/<label for="b-y"/);
    expect(scriptCount(html)).toBe(0);
  });
});

describe('Combobox', () => {
  it('renders the combobox input, a datalist for no-script, and the listbox with options', async () => {
    const html = await render(Combobox, { name: 'c', label: 'Country', value: 'es', options: [{ value: 'es', label: 'Spain' }, { value: 'us', label: 'United States' }] });
    expect(html).toMatch(/<input[^>]*id="c"[^>]*role="combobox"[^>]*aria-autocomplete="list"[^>]*aria-expanded="false"[^>]*aria-controls="c-listbox"[^>]*list="c-datalist"[^>]*value="Spain"[^>]*data-value="es"/);
    expect(html).toMatch(/<datalist id="c-datalist"[^>]*>\s*<option value="Spain">(<\/option>)?\s*<option value="United States">/);
    expect(html).toMatch(/<div id="c-listbox" role="listbox" aria-label="Country" popover="manual"/);
    expect(html).toMatch(/<div role="option" id="c-option-0" aria-selected="false"[^>]*data-value="es"/);
    expect(html).toMatch(/data-part="indicator"[^>]* hidden/);
    expect(scriptCount(html)).toBe(1);
  });
});
