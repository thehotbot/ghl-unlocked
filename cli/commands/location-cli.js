import { buildClient } from '../lib/client-builder.js';
import { listTags, listCustomFields, listCustomValues } from './location.js';

export function registerLocationCommands(program) {
  const loc = program.command('loc').description('Location queries — tags, fields, values');

  loc
    .command('tags')
    .description('List all tags for the location')
    .action(async function() {
      const { client, locationId } = buildClient(this);
      const tags = await listTags(client, locationId);
      if (this.parent.parent.opts().json) {
        console.log(JSON.stringify(tags, null, 2));
      } else {
        if (tags.length === 0) {
          console.log('No tags found.');
          return;
        }
        for (const tag of tags) {
          console.log(`  ${tag.name || tag}`);
        }
      }
    });

  loc
    .command('fields')
    .description('List custom fields')
    .option('--model <model>', 'Filter by model (contact, opportunity, etc.)')
    .action(async function(opts) {
      const { client, locationId } = buildClient(this);
      let fields = await listCustomFields(client, locationId);
      if (opts.model) {
        fields = fields.filter(f => f.model === opts.model);
      }
      if (this.parent.parent.opts().json) {
        console.log(JSON.stringify(fields, null, 2));
      } else {
        if (fields.length === 0) {
          console.log('No custom fields found.');
          return;
        }
        for (const f of fields) {
          const model = f.model ? ` [${f.model}]` : '';
          console.log(`  ${f.id}  ${f.name}${model}  (${f.dataType || f.fieldType || 'unknown'})`);
        }
      }
    });

  loc
    .command('values')
    .description('List custom values (dropdown options, etc.)')
    .action(async function() {
      const { client, locationId } = buildClient(this);
      const values = await listCustomValues(client, locationId);
      if (this.parent.parent.opts().json) {
        console.log(JSON.stringify(values, null, 2));
      } else {
        if (values.length === 0) {
          console.log('No custom values found.');
          return;
        }
        for (const v of values) {
          console.log(`  ${v.id}  ${v.name}`);
        }
      }
    });
}
