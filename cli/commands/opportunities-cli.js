import { buildPublicClient } from '../lib/client-builder.js';
import {
  searchOpportunities, getOpportunity, createOpportunity,
  updateOpportunity, deleteOpportunity, updateOpportunityStatus,
  getPipelines,
} from './opportunities.js';

export function registerOpportunitiesCommands(program) {
  const opp = program.command('opp').description('Manage opportunities (sales pipeline)');

  opp
    .command('search')
    .description('Search opportunities')
    .option('-q, --query <query>', 'Search by name')
    .option('--pipeline <id>', 'Filter by pipeline')
    .option('--status <status>', 'Filter: open|won|lost|abandoned|all')
    .action(async function(opts) {
      const { client } = buildPublicClient(this);
      const params = {};
      if (opts.query) params.query = opts.query;
      if (opts.pipeline) params.pipelineId = opts.pipeline;
      if (opts.status) params.status = opts.status;
      const opps = await searchOpportunities(client, params);
      if (this.parent.parent.opts().json) {
        console.log(JSON.stringify(opps, null, 2));
      } else {
        for (const o of opps) {
          const value = o.monetaryValue ? ` $${o.monetaryValue}` : '';
          console.log(`  ${o.id}  ${o.name}  [${o.status || 'open'}]${value}`);
        }
      }
    });

  opp
    .command('get <id>')
    .description('Get opportunity details')
    .action(async function(id) {
      const { client } = buildPublicClient(this);
      const result = await getOpportunity(client, id);
      console.log(JSON.stringify(result, null, 2));
    });

  opp
    .command('create')
    .description('Create a new opportunity')
    .requiredOption('--name <name>', 'Opportunity name')
    .requiredOption('--pipeline <id>', 'Pipeline ID')
    .requiredOption('--contact <id>', 'Contact ID')
    .option('--stage <id>', 'Pipeline stage ID')
    .option('--value <n>', 'Monetary value', parseFloat)
    .action(async function(opts) {
      const { client } = buildPublicClient(this);
      const data = {
        name: opts.name,
        pipelineId: opts.pipeline,
        contactId: opts.contact,
      };
      if (opts.stage) data.pipelineStageId = opts.stage;
      if (opts.value) data.monetaryValue = opts.value;
      const result = await createOpportunity(client, data);
      if (this.parent.parent.opts().json) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log(`Opportunity created: ${result.opportunity?.id || result.id}`);
      }
    });

  opp
    .command('update <id>')
    .description('Update an opportunity')
    .option('--name <name>', 'Opportunity name')
    .option('--status <status>', 'Status: open|won|lost|abandoned')
    .option('--value <n>', 'Monetary value', parseFloat)
    .option('--stage <id>', 'Pipeline stage ID')
    .action(async function(id, opts) {
      const { client } = buildPublicClient(this);
      const data = {};
      if (opts.name) data.name = opts.name;
      if (opts.status) data.status = opts.status;
      if (opts.value) data.monetaryValue = opts.value;
      if (opts.stage) data.pipelineStageId = opts.stage;
      const result = await updateOpportunity(client, id, data);
      console.log(JSON.stringify(result, null, 2));
    });

  opp
    .command('delete <id>')
    .description('Delete an opportunity')
    .action(async function(id) {
      const { client } = buildPublicClient(this);
      await deleteOpportunity(client, id);
      console.log('Opportunity deleted.');
    });

  opp
    .command('pipeline')
    .description('List all pipelines with stages')
    .action(async function() {
      const { client } = buildPublicClient(this);
      const pipelines = await getPipelines(client);
      if (this.parent.parent.opts().json) {
        console.log(JSON.stringify(pipelines, null, 2));
      } else {
        for (const p of pipelines) {
          console.log(`  ${p.id}  ${p.name}`);
          for (const s of (p.stages || [])) {
            console.log(`    └─ ${s.id}  ${s.name}`);
          }
        }
      }
    });
}
