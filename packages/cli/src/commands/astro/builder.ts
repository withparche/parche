import { defineCommand } from 'citty';
import { spawn } from 'node:child_process';
import pc from 'picocolors';
import { BuilderSetupError, builderTokens, resolveBuilderProject } from '../../lib/builder.js';

/**
 * Start the site's dev server with the visual builder on it. The builder is
 * an integration added here, through Astro's programmatic dev(), so the
 * project's astro.config never names it and no build ever contains it.
 */
export default defineCommand({
  meta: { name: 'builder', description: 'Edit a Parche site visually (runs the dev server with the builder)' },
  args: {
    root: { type: 'string', description: 'The project to edit (default: the current directory)' },
    port: { type: 'string', description: 'Port for the dev server' },
    host: { type: 'string', description: 'Listen on another address. The builder writes your files: only on a network you trust.' },
    open: { type: 'boolean', default: false, description: 'Open the editor in the browser' },
  },
  async run({ args }) {
    let project;
    try {
      project = resolveBuilderProject(args.root);
    } catch (e) {
      if (e instanceof BuilderSetupError) {
        console.error(pc.red(e.message));
        process.exit(1);
      }
      throw e;
    }
    if (args.host) {
      console.warn(pc.yellow(`The builder will listen on ${args.host}. It writes your project's files: anyone who reaches this address with the session link can edit them.`));
    }
    // Astro and its integrations resolve some packages (icon sets) from the
    // working directory, so the server runs from the project, as `astro dev` would.
    process.chdir(project.root);
    const { dev } = await import(project.astro);
    const { default: builder } = await import(project.builder);
    const tokens = builderTokens();
    const server = await dev({
      root: project.root,
      server: { ...(args.port ? { port: Number(args.port) } : {}), ...(args.host ? { host: args.host } : {}) },
      integrations: [builder({ ...tokens, host: args.host ?? false })],
    });
    const url = `http://localhost:${server.address.port}/_parche/builder`;
    console.log(`\n  ${pc.bold('Parche builder')}  ${pc.cyan(url)}\n`);
    if (args.open) {
      const opener = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'explorer' : 'xdg-open';
      spawn(opener, [url], { stdio: 'ignore', detached: true }).unref();
    }
  },
});
