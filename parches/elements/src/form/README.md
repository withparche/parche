---
summary: A real form that validates in place, shows sending, sent and failed, and keeps what was typed.
whenToUse:
  - Any form a page sends: contact, sign-up, waitlist, booking.
whenNotToUse:
  - Search boxes that navigate; a plain form is enough.
related: [Field, Input, Select, Textarea, Checkbox, RadioGroup, Button]
---

```astro
---
import Form from 'parche:elements/Form';
---
<Form endpoint="https://formspree.io/f/xyz" successLabel="Sent — reply within a day">
  <Input name="email" type="email" label="Email" required />
  <Button type="submit">Send</Button>
  <p slot="success">Thanks. We reply within a day.</p>
</Form>
```

:::example basic
An email field that validates in place, and a success line under the form.
:::

## States

The root's `data-state` goes `idle` → `loading` → `success` or `error`. The
submit button reads `loadingLabel` while sending and `successLabel` once sent.
`success`: `button` changes only the label, `append` shows the success slot
under the form, `replace` shows it in place of the form. A failure shows
`errorMessage` as an alert and keeps every field as typed. With no `endpoint`
the send is simulated after 900 ms, so a demo page behaves like the real one.

Events: `parche:submit` (cancelable; call `preventDefault()` to send yourself)
and `parche:submitd` with `{ ok, response }`.

## Accessibility

Errors are the browser's own messages, written under each control and linked
with `aria-describedby` and `aria-invalid`; focus goes to the first invalid
field. Sending and sent are announced through a status region; success moves
focus to the success content.
