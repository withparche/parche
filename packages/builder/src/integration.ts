import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { AstroIntegration } from 'astro';
import { session } from './server/session.js';
import { previewAls } from './server/preview.js';
import { previewMiddleware } from './server/preview-server.js';
import { draftContent } from './vite/draft-content.js';

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
        for (const api of ['catalog', 'docs', 'doc', 'validate', 'events', 'icons', 'assets', 'links', 'drafts']) {
          injectRoute({ pattern: `/_parche/api/${api}`, entrypoint: route(`api/${api}.ts`), prerender: false });
        }

        // The preview: pages asked for under /_parche/preview/<token>/ render
        // with the editor's drafts (a stand-in for astro:content) and mark their nodes.
        previewAls();
        // The editor has its own chrome; the dev toolbar would sit on top of the preview.
        updateConfig({ devToolbar: { enabled: false }, vite: { plugins: [draftContent()] } });
      },
      'astro:server:setup': ({ server, logger }) => {
        server.middlewares.use(previewMiddleware);
        // Changes on disk reach the open editors as events: a document by its
        // collection and id, a widget's props file as a catalog change.
        const s = session();
        const content = path.join(s.root, 'src', 'content');
        const emit = (file: string) => {
          if (file.endsWith('.props.ts')) {
            for (const l of s.listeners) l({ type: 'catalog-changed' });
            return;
          }
          const rel = path.relative(content, file);
          if (rel.startsWith('..') || path.isAbsolute(rel)) return;
          const [collection, ...rest] = rel.split(path.sep);
          if (!rest.length) return;
          const id = rest.join('/').replace(/\.(json|md|mdx|ya?ml)$/, '');
          for (const l of s.listeners) l({ type: 'file-changed', collection, id });
        };
        server.watcher.on('change', emit);
        server.watcher.on('add', emit);
        server.watcher.on('unlink', emit);
        logger.info('editor at /_parche/builder');
      },
    },
  };
}
