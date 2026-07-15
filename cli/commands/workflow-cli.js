import { readConfig } from '../lib/config.js';
import { createApiClient } from '../lib/api-client.js';
import { listWorkflows, getWorkflow, getWorkflowSteps, addAction } from './workflows.js';

function getConfigPath() {
  return process.env.GHL_UNLOCKED_CONFIG || undefined;
}

function buildClient(cmd) {
  const configPath = getConfigPath();
  const config = readConfig(configPath);
  const rootOpts = cmd.parent.parent.opts();
  const profileName = rootOpts.profile || 'default';
  const profile = config.profiles[profileName];

  if (!profile) {
    console.error(`Profile "${profileName}" not found. Run: ghl-unlocked auth add`);
    process.exit(1);
  }

  const locationId = rootOpts.location || profile.location_id;

  const client = createApiClient({
    getToken: async () => {
      // For MVP: use stored JWT directly. Two-tier refresh wired in later.
      if (!profile.ghl_jwt) {
        throw new Error('No GHL JWT stored. Run: ghl-unlocked auth add');
      }
      if (profile.ghl_jwt_expires_at && profile.ghl_jwt_expires_at < Date.now()) {
        throw new Error('GHL JWT expired. Run: ghl-unlocked auth refresh');
      }
      return profile.ghl_jwt;
    },
    locationId,
  });

  return { client, locationId };
}

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
