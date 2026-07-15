import { buildClient, buildPublicClient } from '../lib/client-builder.js';
import { listWorkflows, getWorkflow, getWorkflowSteps, addAction, createWorkflow, publishWorkflow, deleteWorkflow, cloneWorkflow, getWorkflowErrors } from './workflows.js';
import { enrollInWorkflow, removeFromWorkflow } from './contacts.js';

export function registerWorkflowCommands(program) {
  const wf = program.command('wf').description('Workflow operations');

  wf
    .command('list')
    .description('List all workflows')
    .action(async function() {
      const { client } = buildClient(this);
      const workflows = await listWorkflows(client);
      if (this.parent.parent.opts().json) {
        console.log(JSON.stringify(workflows, null, 2));
      } else {
        for (const w of workflows) {
          console.log(`  ${w.id}  ${w.name}  [${w.status || 'unknown'}]`);
        }
      }
    });

  wf
    .command('create <name>')
    .description('Create a new workflow')
    .option('--status <status>', 'Initial status (draft or published)', 'draft')
    .action(async function(name, opts) {
      const { client, locationId } = buildClient(this);
      const result = await createWorkflow(client, name, locationId, { status: opts.status });
      if (this.parent.parent.opts().json) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log(`Workflow created: ${result._id || result.id} — "${name}" [${opts.status}]`);
      }
    });

  wf
    .command('get <id>')
    .description('Get full workflow detail including steps')
    .action(async function(id) {
      const { client, locationId } = buildClient(this);
      const workflow = await getWorkflow(client, id, locationId);
      console.log(JSON.stringify(workflow, null, 2));
    });

  wf
    .command('get-steps <id>')
    .description('Get workflow steps/actions only')
    .action(async function(id) {
      const { client, locationId } = buildClient(this);
      const steps = await getWorkflowSteps(client, id, locationId);
      console.log(JSON.stringify(steps, null, 2));
    });

  wf
    .command('add-action <workflowId>')
    .description('Add an action to a workflow')
    .requiredOption('--type <type>', 'Action type (e.g. add_contact_tag)')
    .requiredOption('--data <json>', 'Action data as JSON string')
    .option('--position <n>', 'Position in action list (0-indexed)', parseInt)
    .action(async function(workflowId, opts) {
      const { client, locationId } = buildClient(this);
      const actionData = {
        type: opts.type,
        data: JSON.parse(opts.data),
      };
      if (opts.position !== undefined) {
        actionData.position = opts.position;
      }
      const result = await addAction(client, workflowId, actionData, locationId);
      console.log(JSON.stringify(result, null, 2));
    });

  wf
    .command('publish <id>')
    .description('Publish a workflow (adds trigger if missing)')
    .action(async function(id) {
      const { client, locationId } = buildClient(this);
      const result = await publishWorkflow(client, id, locationId, true);
      console.log(`Workflow published: ${result._id || result.id || id}`);
    });

  wf
    .command('unpublish <id>')
    .description('Unpublish a workflow (set to draft)')
    .action(async function(id) {
      const { client, locationId } = buildClient(this);
      const result = await publishWorkflow(client, id, locationId, false);
      console.log(`Workflow set to draft: ${result._id || result.id || id}`);
    });

  wf
    .command('enroll <workflowId>')
    .description('Add a contact to a workflow')
    .requiredOption('--contact <id>', 'Contact ID')
    .action(async function(workflowId, opts) {
      const { client } = buildPublicClient(this);
      const now = new Date();
      const offset = -now.getTimezoneOffset();
      const sign = offset >= 0 ? '+' : '-';
      const pad = n => String(Math.abs(n)).padStart(2, '0');
      const tz = sign + pad(Math.floor(offset / 60)) + ':' + pad(offset % 60);
      const eventTime = now.toISOString().slice(0, 19) + tz;
      const result = await enrollInWorkflow(client, opts.contact, workflowId, eventTime);
      console.log('Contact enrolled in workflow.');
    });

  wf
    .command('unenroll <workflowId>')
    .description('Remove a contact from a workflow')
    .requiredOption('--contact <id>', 'Contact ID')
    .action(async function(workflowId, opts) {
      const { client } = buildPublicClient(this);
      await removeFromWorkflow(client, opts.contact, workflowId);
      console.log('Contact removed from workflow.');
    });

  wf
    .command('delete <id>')
    .description('Delete a workflow')
    .action(async function(id) {
      const { client, locationId } = buildClient(this);
      await deleteWorkflow(client, id, locationId);
      console.log(`Workflow deleted: ${id}`);
    });

  wf
    .command('clone <id>')
    .description('Clone a workflow (with remapped step IDs)')
    .option('--name <name>', 'Name for the cloned workflow')
    .action(async function(id, opts) {
      const { client, locationId } = buildClient(this);
      const result = await cloneWorkflow(client, id, locationId, opts.name);
      if (this.parent.parent.opts().json) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log(`Workflow cloned: ${result.id || result._id}`);
      }
    });

  wf
    .command('errors')
    .description('Get workflow error count')
    .action(async function() {
      const { client, locationId } = buildClient(this);
      const result = await getWorkflowErrors(client, locationId);
      console.log(JSON.stringify(result, null, 2));
    });
}
