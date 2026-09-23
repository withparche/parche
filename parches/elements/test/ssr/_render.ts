import { experimental_AstroContainer as AstroContainer } from 'astro/container';

let container: AstroContainer | null = null;

/** Render an .astro component to a string on the server, no browser involved. */
export async function render(Component: any, props: Record<string, unknown> = {}, slots?: Record<string, string>): Promise<string> {
  container ??= await AstroContainer.create();
  return container.renderToString(Component, { props, slots });
}

/** Count `<script` tags in server output — interactive elements hoist exactly one. */
export function scriptCount(html: string): number {
  return (html.match(/<script\b/g) ?? []).length;
}
