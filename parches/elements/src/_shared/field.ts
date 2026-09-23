/**
 * The id convention Field and the form controls share: a control with id
 * `x` is described by `x-description` and `x-error` when those exist. A
 * custom control inside a Field puts `describedBy` in `aria-describedby`.
 */
export function fieldIds(id: string, { description, error }: { description?: string; error?: string }) {
  const describedBy = [description && `${id}-description`, error && `${id}-error`].filter(Boolean).join(' ') || undefined;
  return { descriptionId: `${id}-description`, errorId: `${id}-error`, describedBy };
}
