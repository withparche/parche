/**
 * How the sidebar groups the elements. Anything not listed lands in "Other",
 * so a new element shows up without touching this file.
 */
export const groups: Array<{ label: string; names: string[] }> = [
  { label: 'Layout', names: ['Container', 'Section', 'AspectRatio', 'Divider'] },
  { label: 'Typography', names: ['Heading', 'Eyebrow', 'Prose', 'Code', 'Kbd'] },
  { label: 'Actions', names: ['Button', 'Link'] },
  { label: 'Media', names: ['Image', 'Avatar', 'Icon', 'Video', 'Skeleton'] },
  { label: 'Data display', names: ['Badge', 'Tag', 'Card', 'Stat', 'Breadcrumb', 'Pagination', 'Toc', 'Share'] },
  { label: 'Disclosure', names: ['Collapsible', 'Accordion', 'Tabs', 'Carousel'] },
  { label: 'Overlays', names: ['Dialog', 'Sheet', 'Popover', 'Menu', 'Tooltip', 'Toast', 'Banner'] },
  { label: 'Forms', names: ['Label', 'Field', 'Input', 'Textarea', 'Select', 'Checkbox', 'RadioGroup', 'Switch', 'Slider', 'Combobox'] },
];

export function grouped(names: string[]): Array<{ label: string; names: string[] }> {
  const seen = new Set<string>();
  const out = groups
    .map((g) => ({ label: g.label, names: g.names.filter((n) => names.includes(n) && (seen.add(n), true)) }))
    .filter((g) => g.names.length > 0);
  const rest = names.filter((n) => !seen.has(n));
  if (rest.length) out.push({ label: 'Other', names: rest });
  return out;
}
