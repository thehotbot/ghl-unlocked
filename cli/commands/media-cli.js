import { buildPublicClient } from '../lib/client-builder.js';
import { listMedia, deleteMedia } from './media.js';

export function registerMediaCommands(program) {
  const media = program.command('media').description('Media library');

  media
    .command('list')
    .description('List media files')
    .action(async function() {
      const { client } = buildPublicClient(this);
      const result = await listMedia(client);
      if (this.parent.parent.opts().json) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        const files = result.files || result.data || [];
        if (files.length === 0) {
          console.log('No media files found.');
          return;
        }
        for (const f of files) {
          console.log(`  ${f.id}  ${f.name || f.altId || '(unnamed)'}  ${f.type || ''}`);
        }
      }
    });

  media
    .command('delete <id>')
    .description('Delete a media file')
    .action(async function(id) {
      const { client } = buildPublicClient(this);
      await deleteMedia(client, id);
      console.log('Media file deleted.');
    });
}
