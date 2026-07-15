import { buildPublicClient } from '../lib/client-builder.js';
import {
  listObjectSchemas, getObjectSchema,
  listObjectRecords, getObjectRecord,
  createObjectRecord, updateObjectRecord, deleteObjectRecord,
} from './objects.js';

export function registerObjectsCommands(program) {
  const obj = program.command('obj').description('Custom objects');

  obj
    .command('schemas')
    .description('List object schemas')
    .action(async function() {
      const { client } = buildPublicClient(this);
      const result = await listObjectSchemas(client);
      if (this.parent.parent.opts().json) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        const schemas = result.schemas || result.data || [];
        if (schemas.length === 0) {
          console.log('No object schemas found.');
          return;
        }
        for (const s of schemas) {
          console.log(`  ${s.key || s.id}  ${s.label || s.name || '(unnamed)'}`);
        }
      }
    });

  obj
    .command('schema <key>')
    .description('Get object schema details')
    .action(async function(key) {
      const { client } = buildPublicClient(this);
      const result = await getObjectSchema(client, key);
      console.log(JSON.stringify(result, null, 2));
    });

  obj
    .command('records <schemaKey>')
    .description('List records for an object schema')
    .action(async function(schemaKey) {
      const { client } = buildPublicClient(this);
      const result = await listObjectRecords(client, schemaKey);
      if (this.parent.parent.opts().json) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        const records = result.records || result.data || [];
        if (records.length === 0) {
          console.log('No records found.');
          return;
        }
        for (const r of records) {
          console.log(`  ${r.id}  ${r.name || r.label || JSON.stringify(r.properties || {}).slice(0, 60)}`);
        }
      }
    });

  obj
    .command('record <schemaKey> <id>')
    .description('Get a specific record')
    .action(async function(schemaKey, id) {
      const { client } = buildPublicClient(this);
      const result = await getObjectRecord(client, schemaKey, id);
      console.log(JSON.stringify(result, null, 2));
    });

  obj
    .command('record-create <schemaKey>')
    .description('Create a new record')
    .option('--data <json>', 'Record data as JSON string')
    .action(async function(schemaKey, opts) {
      const { client } = buildPublicClient(this);
      const data = opts.data ? JSON.parse(opts.data) : {};
      const result = await createObjectRecord(client, schemaKey, data);
      if (this.parent.parent.opts().json) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log(`Record created: ${result.record?.id || result.id || 'ok'}`);
      }
    });

  obj
    .command('record-update <schemaKey> <id>')
    .description('Update a record')
    .option('--data <json>', 'Record data as JSON string')
    .action(async function(schemaKey, id, opts) {
      const { client } = buildPublicClient(this);
      const data = opts.data ? JSON.parse(opts.data) : {};
      const result = await updateObjectRecord(client, schemaKey, id, data);
      if (this.parent.parent.opts().json) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log('Record updated.');
      }
    });

  obj
    .command('record-delete <schemaKey> <id>')
    .description('Delete a record')
    .action(async function(schemaKey, id) {
      const { client } = buildPublicClient(this);
      await deleteObjectRecord(client, schemaKey, id);
      console.log('Record deleted.');
    });
}
