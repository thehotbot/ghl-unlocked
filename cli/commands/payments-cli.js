import { buildPublicClient } from '../lib/client-builder.js';
import { listOrders, getOrder, listTransactions, getTransaction, listSubscriptions, getSubscription, listCoupons, createCoupon } from './payments.js';

export function registerPaymentsCommands(program) {
  const pay = program.command('pay').description('View orders, transactions, subscriptions, and coupons');

  pay
    .command('orders')
    .description('List orders')
    .action(async function() {
      const { client } = buildPublicClient(this);
      const result = await listOrders(client);
      console.log(JSON.stringify(result, null, 2));
    });

  pay
    .command('order <id>')
    .description('Get order details')
    .action(async function(id) {
      const { client } = buildPublicClient(this);
      const result = await getOrder(client, id);
      console.log(JSON.stringify(result, null, 2));
    });

  pay
    .command('transactions')
    .description('List transactions')
    .action(async function() {
      const { client } = buildPublicClient(this);
      const result = await listTransactions(client);
      console.log(JSON.stringify(result, null, 2));
    });

  pay
    .command('transaction <id>')
    .description('Get transaction details')
    .action(async function(id) {
      const { client } = buildPublicClient(this);
      const result = await getTransaction(client, id);
      console.log(JSON.stringify(result, null, 2));
    });

  pay
    .command('subscriptions')
    .description('List subscriptions')
    .action(async function() {
      const { client } = buildPublicClient(this);
      const result = await listSubscriptions(client);
      console.log(JSON.stringify(result, null, 2));
    });

  pay
    .command('subscription <id>')
    .description('Get subscription details')
    .action(async function(id) {
      const { client } = buildPublicClient(this);
      const result = await getSubscription(client, id);
      console.log(JSON.stringify(result, null, 2));
    });

  pay
    .command('coupons')
    .description('List coupons')
    .action(async function() {
      const { client } = buildPublicClient(this);
      const result = await listCoupons(client);
      console.log(JSON.stringify(result, null, 2));
    });

  pay
    .command('coupon-create')
    .description('Create a coupon')
    .requiredOption('--name <name>', 'Coupon name')
    .requiredOption('--code <code>', 'Coupon code')
    .requiredOption('--type <type>', 'Type: percentage|fixed')
    .requiredOption('--value <n>', 'Discount value', parseFloat)
    .action(async function(opts) {
      const { client } = buildPublicClient(this);
      const data = { name: opts.name, code: opts.code, type: opts.type, value: opts.value };
      const result = await createCoupon(client, data);
      console.log(JSON.stringify(result, null, 2));
    });
}
