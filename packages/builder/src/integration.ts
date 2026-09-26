import { fileURLToPath } from 'node:url';
import type { AstroIntegration } from 'astro';
import { session } from './server/session.js';

export interface BuilderOptions {
  /** The session secret every editor request must carry; the CLI generates it. */
  token: string;
  /** The secret the preview iframe carries in its URL (a separate one: it sits in a URL). */
  previewToken: string;
  /** The address the server listens on, when the CLI was told to expose it. Localhost otherwise. */
  host?: string | boolean;
}

/**
 * The builder: an editor for the site's content that runs only under
 * `astro dev`, added by `parche astro builder` through Astro's programmatic
 * `dev()`. Nothing of it reaches a build — the integration refuses any other
 * command, and the site's astro.config never names it.
 *
 * Every route lives under `/_parche/`, which outranks the catch-all page
 * route, and every API request is checked against the session token
 * (src/server/guard.ts).
 */
export default function builder(options: BuilderOptions): AstroIntegration {
  // The package root is one level up from both src/integration.ts and the
  // built dist/integration.js; the routes stay TypeScript source in src/.
  const route = (file: string) => fileURLToPath(new URL(`../src/routes/${file}`, import.meta.url));
  return {
    name: '@parche/builder',
    hooks: {
      'astro:config:setup': ({ command, injectRoute, updateConfig, config }) => {
        if (command !== 'dev') {
          throw new Error('[parche] @parche/builder runs only under "astro dev"; start it with `parche astro builder`.');
        }
        const s = session();
        s.token = options.token;
        s.previewToken = options.previewToken;
        s.host = options.host ?? false;
        s.root = fileURLToPath(config.root);

        injectRoute({ pattern: '/_parche/builder', entrypoint: route('editor.ts'), prerender: false });
        injectRoute({ pattern: '/_parche/builder/assets/[...file]', entrypoint: route('editor-assets.ts'), prerender: false });
        injectRoute({ pattern: '/_parche/api/catalog', entrypoint: route('api/catalog.ts'), prerender: false });

        // The editor has its own chrome; the dev toolbar would sit on top of the preview.
        updateConfig({ devToolbar: { enabled: false } });
      },
      'astro:server:setup': ({ logger }) => {
        logger.info('editor at /_parche/builder');
      },
    },
  };
}
