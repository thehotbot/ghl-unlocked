import { buildPublicClient } from '../lib/client-builder.js';
import { getLocation, listTags, createTag, deleteTag, listCustomFields, createCustomField, deleteCustomField, listCustomValues, createCustomValue, listTemplates } from './location.js';

export function registerLocationCommands(program) {
  const loc = program.command('loc').description('Location settings — tags, fields, values, templates');

  loc
    .command('get')
    .description('Get current location details')
    .action(async function() {
      const { client } = buildPublicClient(this);
      const result = await getLocation(client);
      console.log(JSON.stringify(result, null, 2));
    });

  loc
    .command('tags')
    .description('List all tags')
    .action(async function() {
      const { client } = buildPublicClient(this);
      const tags = await listTags(client);
      if (this.parent.parent.opts().json) {
        console.log(JSON.stringify(tags, null, 2));
      } else {
        if (tags.length === 0) {
          console.log('No tags found.');
          return;
        }
        for (const tag of tags) {
          console.log(`  ${tag.id || ''}  ${tag.name || tag}`);
        }
      }
    });

  loc
    .command('tag-create')
    .description('Create a tag')
    .requiredOption('--name <name>', 'Tag name')
    .action(async function(opts) {
      const { client } = buildPublicClient(this);
      const result = await createTag(client, opts.name);
      console.log(JSON.stringify(result, null, 2));
    });

  loc
    .command('tag-delete <tagId>')
    .description('Delete a tag')
    .action(async function(tagId) {
      const { client } = buildPublicClient(this);
      await deleteTag(client, tagId);
      console.log('Tag deleted.');
    });

  loc
    .command('fields')
    .description('List custom fields')
    .option('--model <model>', 'Filter by model (contact, opportunity, etc.)')
    .action(async function(opts) {
      const { client } = buildPublicClient(this);
      const params = {};
      if (opts.model) params.model = opts.model;
      const fields = await listCustomFields(client, params);
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
    .command('field-create')
    .description('Create a custom field')
    .requiredOption('--name <name>', 'Field name')
    .requiredOption('--type <type>', 'Data type (TEXT, NUMBER, DATE, etc.)')
    .option('--model <model>', 'Model (contact, opportunity)', 'contact')
    .action(async function(opts) {
      const { client } = buildPublicClient(this);
      const result = await createCustomField(client, {
        name: opts.name,
        dataType: opts.type,
        model: opts.model,
      });
      console.log(JSON.stringify(result, null, 2));
    });

  loc
    .command('field-delete <fieldId>')
    .description('Delete a custom field')
    .action(async function(fieldId) {
      const { client } = buildPublicClient(this);
      await deleteCustomField(client, fieldId);
      console.log('Custom field deleted.');
    });

  loc
    .command('values')
    .description('List custom values (dropdown options)')
    .action(async function() {
      const { client } = buildPublicClient(this);
      const values = await listCustomValues(client);
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

  loc
    .command('value-create')
    .description('Create a custom value')
    .requiredOption('--name <name>', 'Value name')
    .action(async function(opts) {
      const { client } = buildPublicClient(this);
      const result = await createCustomValue(client, { name: opts.name });
      console.log(JSON.stringify(result, null, 2));
    });

  loc
    .command('templates')
    .description('List templates')
    .option('--type <type>', 'Filter by type (sms, email, whatsapp)')
    .requiredOption('--originId <id>', 'Origin ID')
    .action(async function(opts) {
      const { client } = buildPublicClient(this);
      const params = { originId: opts.originId };
      if (opts.type) params.type = opts.type;
      const result = await listTemplates(client, params);
      console.log(JSON.stringify(result, null, 2));
    });
}
