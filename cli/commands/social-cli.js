import { buildPublicClient } from '../lib/client-builder.js';
import {
  listSocialPosts, getSocialPost, createSocialPost,
  deleteSocialPost, getSocialAccounts,
} from './social.js';

export function registerSocialCommands(program) {
  const social = program.command('social').description('Social media posting');

  social
    .command('list')
    .description('List social media posts')
    .action(async function() {
      const { client } = buildPublicClient(this);
      const result = await listSocialPosts(client);
      if (this.parent.parent.opts().json) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        const posts = result.posts || result.data || [];
        if (posts.length === 0) {
          console.log('No social posts found.');
          return;
        }
        for (const p of posts) {
          console.log(`  ${p.id}  ${(p.content || '').slice(0, 60)}  [${p.status || 'unknown'}]`);
        }
      }
    });

  social
    .command('get <id>')
    .description('Get a social media post')
    .action(async function(id) {
      const { client } = buildPublicClient(this);
      const result = await getSocialPost(client, id);
      console.log(JSON.stringify(result, null, 2));
    });

  social
    .command('create')
    .description('Create a social media post')
    .option('--content <content>', 'Post content')
    .action(async function(opts) {
      const { client } = buildPublicClient(this);
      const data = {};
      if (opts.content) data.content = opts.content;
      const result = await createSocialPost(client, data);
      if (this.parent.parent.opts().json) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log(`Post created: ${result.post?.id || result.id || 'ok'}`);
      }
    });

  social
    .command('delete <id>')
    .description('Delete a social media post')
    .action(async function(id) {
      const { client } = buildPublicClient(this);
      await deleteSocialPost(client, id);
      console.log('Post deleted.');
    });

  social
    .command('accounts')
    .description('List connected social media accounts')
    .action(async function() {
      const { client } = buildPublicClient(this);
      const result = await getSocialAccounts(client);
      if (this.parent.parent.opts().json) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        const accounts = result.accounts || result.data || [];
        if (accounts.length === 0) {
          console.log('No social accounts connected.');
          return;
        }
        for (const a of accounts) {
          console.log(`  ${a.id}  ${a.name || a.platform || '(unnamed)'}  [${a.type || a.platform || ''}]`);
        }
      }
    });
}
