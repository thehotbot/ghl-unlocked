import { buildPublicClient } from '../lib/client-builder.js';
import {
  getBlogSites, getBlogPosts, getBlogPost,
  createBlogPost, updateBlogPost, deleteBlogPost,
  getBlogAuthors, getBlogCategories,
} from './blog.js';

export function registerBlogCommands(program) {
  const blog = program.command('blog').description('Blog management');

  blog
    .command('sites')
    .description('List blog sites')
    .action(async function() {
      const { client } = buildPublicClient(this);
      const result = await getBlogSites(client);
      if (this.parent.parent.opts().json) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        const sites = result.blogs || result.data || [];
        if (sites.length === 0) {
          console.log('No blog sites found.');
          return;
        }
        for (const s of sites) {
          console.log(`  ${s.id}  ${s.name || s.title || '(untitled)'}`);
        }
      }
    });

  blog
    .command('posts <siteId>')
    .description('List posts for a blog site')
    .action(async function(siteId) {
      const { client } = buildPublicClient(this);
      const result = await getBlogPosts(client, siteId);
      if (this.parent.parent.opts().json) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        const posts = result.posts || result.data || [];
        if (posts.length === 0) {
          console.log('No posts found.');
          return;
        }
        for (const p of posts) {
          console.log(`  ${p.id}  ${p.title || '(untitled)'}  [${p.status || 'draft'}]`);
        }
      }
    });

  blog
    .command('post <postId>')
    .description('Get a blog post')
    .action(async function(postId) {
      const { client } = buildPublicClient(this);
      const result = await getBlogPost(client, postId);
      console.log(JSON.stringify(result, null, 2));
    });

  blog
    .command('post-create <siteId>')
    .description('Create a new blog post')
    .option('--title <title>', 'Post title')
    .option('--content <content>', 'Post content (HTML)')
    .action(async function(siteId, opts) {
      const { client } = buildPublicClient(this);
      const data = { blogId: siteId };
      if (opts.title) data.title = opts.title;
      if (opts.content) data.rawHTML = opts.content;
      const result = await createBlogPost(client, data);
      if (this.parent.parent.opts().json) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log(`Post created: ${result.data?.id || result.id || 'ok'}`);
      }
    });

  blog
    .command('post-update <postId>')
    .description('Update a blog post')
    .option('--title <title>', 'New title')
    .action(async function(postId, opts) {
      const { client } = buildPublicClient(this);
      const data = {};
      if (opts.title) data.title = opts.title;
      const result = await updateBlogPost(client, postId, data);
      if (this.parent.parent.opts().json) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log('Post updated.');
      }
    });

  blog
    .command('post-delete <postId>')
    .description('Delete a blog post')
    .action(async function(postId) {
      const { client } = buildPublicClient(this);
      await deleteBlogPost(client, postId);
      console.log('Post deleted.');
    });

  blog
    .command('authors <siteId>')
    .description('List blog authors')
    .action(async function(siteId) {
      const { client } = buildPublicClient(this);
      const result = await getBlogAuthors(client, { blogId: siteId });
      if (this.parent.parent.opts().json) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        const authors = result.authors || result.data || [];
        if (authors.length === 0) {
          console.log('No authors found.');
          return;
        }
        for (const a of authors) {
          console.log(`  ${a.id}  ${a.name || '(unnamed)'}`);
        }
      }
    });

  blog
    .command('categories <siteId>')
    .description('List blog categories')
    .action(async function(siteId) {
      const { client } = buildPublicClient(this);
      const result = await getBlogCategories(client, { blogId: siteId });
      if (this.parent.parent.opts().json) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        const categories = result.categories || result.data || [];
        if (categories.length === 0) {
          console.log('No categories found.');
          return;
        }
        for (const c of categories) {
          console.log(`  ${c.id}  ${c.name || '(unnamed)'}`);
        }
      }
    });
}
