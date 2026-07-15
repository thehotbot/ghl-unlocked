import { buildPublicClient } from '../lib/client-builder.js';
import { listSurveys, getSurveySubmissions } from './surveys.js';

export function registerSurveysCommands(program) {
  const surveys = program.command('surveys').description('Surveys and submissions');

  surveys
    .command('list')
    .description('List surveys')
    .action(async function() {
      const { client } = buildPublicClient(this);
      const result = await listSurveys(client);
      if (this.parent.parent.opts().json) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        const items = result.surveys || result.data || [];
        if (items.length === 0) {
          console.log('No surveys found.');
          return;
        }
        for (const s of items) {
          console.log(`  ${s.id}  ${s.name || '(unnamed)'}`);
        }
      }
    });

  surveys
    .command('submissions <surveyId>')
    .description('List submissions for a survey')
    .action(async function(surveyId) {
      const { client } = buildPublicClient(this);
      const result = await getSurveySubmissions(client, { surveyId });
      if (this.parent.parent.opts().json) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        const subs = result.submissions || result.data || [];
        if (subs.length === 0) {
          console.log('No submissions found.');
          return;
        }
        for (const s of subs) {
          console.log(`  ${s.id}  ${s.contactId || ''}  ${s.createdAt || ''}`);
        }
      }
    });
}
