import { buildClient } from '../lib/client-builder.js';
import { listFunnels, getFunnel, listFunnelPages } from './funnels.js';

export function registerFunnelsCommands(program) {
  const funnels = program.command('funnels').description('Funnel and site management (internal API)');

  funnels
    .command('list')
    .description('List all funnels/sites')
    .action(async function() {
      const { client } = buildClient(this);
      const funnels = await listFunnels(client);
      if (this.parent.parent.opts().json) {
        console.log(JSON.stringify(funnels, null, 2));
      } else {
        for (const f of funnels) {
          console.log(`  ${f._id || f.id}  ${f.name || f._data?.name || '(unnamed)'}  [${f.type || f._data?.type || ''}]`);
        }
      }
    });

  funnels
    .command('get <id>')
    .description('Get funnel details')
    .action(async function(id) {
      const { client } = buildClient(this);
      const funnel = await getFunnel(client, id);
      console.log(JSON.stringify(funnel, null, 2));
    });

  funnels
    .command('pages <funnelId>')
    .description('List pages in a funnel')
    .action(async function(funnelId) {
      const { client } = buildClient(this);
      const pages = await listFunnelPages(client, funnelId);
      if (this.parent.parent.opts().json) {
        console.log(JSON.stringify(pages, null, 2));
      } else {
        for (const p of pages) {
          console.log(`  ${p._id || p.id}  ${p.name || p._data?.name || '(unnamed)'}`);
        }
      }
    });
}
