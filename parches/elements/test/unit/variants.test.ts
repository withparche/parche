import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cn, defineVariants } from '../../src/_shared/variants.ts';

test('cn: drops falsy entries and resolves Tailwind conflicts', () => {
  assert.equal(cn('p-4', false, null, undefined, 'p-2'), 'p-2');
  assert.equal(cn('text-muted', 'hover:text-heading'), 'text-muted hover:text-heading');
});

const button = defineVariants({
  base: 'inline-flex',
  variants: {
    variant: { primary: 'bg-primary text-on-primary', ghost: 'bg-transparent text-muted' },
    size: { sm: 'h-8 px-3', md: 'h-10 px-4' },
    tone: { default: '', danger: '' },
  },
  compound: [{ variant: 'ghost', tone: 'danger', class: 'text-danger' }],
  defaults: { variant: 'primary', size: 'md', tone: 'default' },
});

test('defineVariants: defaults apply when props are omitted', () => {
  assert.equal(button(), 'inline-flex bg-primary text-on-primary h-10 px-4');
});

test('defineVariants: an undefined prop falls back to the default', () => {
  assert.equal(button({ size: undefined }), 'inline-flex bg-primary text-on-primary h-10 px-4');
});

test('defineVariants: compound variants add classes only when every axis matches', () => {
  assert.equal(button({ variant: 'ghost', tone: 'danger' }), 'inline-flex bg-transparent h-8 px-3'.replace('h-8 px-3', 'h-10 px-4') + ' text-danger');
  assert.doesNotMatch(button({ variant: 'ghost' }), /text-danger/);
  assert.doesNotMatch(button({ tone: 'danger' }), /text-danger/);
});

test('defineVariants: a caller class overrides conflicting base utilities', () => {
  assert.equal(button({ size: 'sm' }, 'px-6'), 'inline-flex bg-primary text-on-primary h-8 px-6');
});
