import { buildClient } from '../lib/client-builder.js';
import { listWorkflows, getWorkflow, getWorkflowSteps, addAction, createWorkflow } from './workflows.js';

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
}
