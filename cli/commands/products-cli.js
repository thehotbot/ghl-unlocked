import { buildPublicClient } from '../lib/client-builder.js';
import { listProducts, getProduct, createProduct, updateProduct, deleteProduct, listPrices, createPrice, listCollections, createCollection, listInventory } from './products.js';

export function registerProductsCommands(program) {
  const prod = program.command('prod').description('Manage products, prices, and collections');

  prod
    .command('list')
    .description('List products')
    .option('-q, --query <query>', 'Search')
    .action(async function(opts) {
      const { client } = buildPublicClient(this);
      const params = {};
      if (opts.query) params.search = opts.query;
      const result = await listProducts(client, params);
      console.log(JSON.stringify(result, null, 2));
    });

  prod
    .command('get <id>')
    .description('Get product details')
    .action(async function(id) {
      const { client } = buildPublicClient(this);
      const result = await getProduct(client, id);
      console.log(JSON.stringify(result, null, 2));
    });

  prod
    .command('create')
    .description('Create a product')
    .requiredOption('--name <name>', 'Product name')
    .option('--description <text>', 'Description')
    .action(async function(opts) {
      const { client } = buildPublicClient(this);
      const data = { name: opts.name };
      if (opts.description) data.description = opts.description;
      const result = await createProduct(client, data);
      console.log(JSON.stringify(result, null, 2));
    });

  prod
    .command('update <id>')
    .description('Update a product')
    .option('--name <name>', 'Product name')
    .option('--description <text>', 'Description')
    .action(async function(id, opts) {
      const { client } = buildPublicClient(this);
      const data = {};
      if (opts.name) data.name = opts.name;
      if (opts.description) data.description = opts.description;
      const result = await updateProduct(client, id, data);
      console.log(JSON.stringify(result, null, 2));
    });

  prod
    .command('delete <id>')
    .description('Delete a product')
    .action(async function(id) {
      const { client } = buildPublicClient(this);
      await deleteProduct(client, id);
      console.log('Product deleted.');
    });

  prod
    .command('prices <productId>')
    .description('List prices for a product')
    .action(async function(productId) {
      const { client } = buildPublicClient(this);
      const result = await listPrices(client, productId);
      console.log(JSON.stringify(result, null, 2));
    });

  prod
    .command('price-create <productId>')
    .description('Create a price for a product')
    .requiredOption('--name <name>', 'Price name')
    .requiredOption('--amount <cents>', 'Amount in cents', parseInt)
    .option('--type <type>', 'Price type: one_time|recurring', 'one_time')
    .action(async function(productId, opts) {
      const { client } = buildPublicClient(this);
      const data = { name: opts.name, amount: opts.amount, type: opts.type };
      const result = await createPrice(client, productId, data);
      console.log(JSON.stringify(result, null, 2));
    });

  prod
    .command('collections')
    .description('List product collections')
    .action(async function() {
      const { client } = buildPublicClient(this);
      const result = await listCollections(client);
      console.log(JSON.stringify(result, null, 2));
    });

  prod
    .command('collection-create')
    .description('Create a product collection')
    .requiredOption('--name <name>', 'Collection name')
    .action(async function(opts) {
      const { client } = buildPublicClient(this);
      const result = await createCollection(client, { name: opts.name });
      console.log(JSON.stringify(result, null, 2));
    });

  prod
    .command('inventory')
    .description('List inventory')
    .action(async function() {
      const { client } = buildPublicClient(this);
      const result = await listInventory(client);
      console.log(JSON.stringify(result, null, 2));
    });
}
