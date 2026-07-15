import { buildClient } from '../lib/client-builder.js';
import { listForms, getForm } from './forms-internal.js';

export function registerFormsInternalCommands(program) {
  const forms = program.command('forms').description('Form management (internal API)');

  forms
    .command('list')
    .description('List all forms')
    .action(async function() {
      const { client } = buildClient(this);
      const forms = await listForms(client);
      if (this.parent.parent.opts().json) {
        console.log(JSON.stringify(forms, null, 2));
      } else {
        if (forms.length === 0) {
          console.log('No forms found.');
          return;
        }
        for (const f of forms) {
          console.log(`  ${f._id || f.id}  ${f.name || '(unnamed)'}`);
        }
      }
    });

  forms
    .command('get <id>')
    .description('Get form details')
    .action(async function(id) {
      const { client } = buildClient(this);
      const form = await getForm(client, id);
      console.log(JSON.stringify(form, null, 2));
    });
}
