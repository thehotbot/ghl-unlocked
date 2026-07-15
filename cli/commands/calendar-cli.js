import { buildPublicClient } from '../lib/client-builder.js';
import { listCalendars, getCalendarEvents, getFreeSlots, bookAppointment, cancelAppointment } from './calendar.js';

export function registerCalendarCommands(program) {
  const cal = program.command('cal').description('Manage calendars and appointments');

  cal
    .command('list')
    .description('List all calendars')
    .action(async function() {
      const { client } = buildPublicClient(this);
      const calendars = await listCalendars(client);
      if (this.parent.parent.opts().json) {
        console.log(JSON.stringify(calendars, null, 2));
      } else {
        for (const c of calendars) {
          console.log(`  ${c.id}  ${c.name}`);
        }
      }
    });

  cal
    .command('events <calendarId>')
    .description('List calendar events')
    .option('--start <date>', 'Start date (YYYY-MM-DD)')
    .option('--end <date>', 'End date (YYYY-MM-DD)')
    .action(async function(calId, opts) {
      const { client } = buildPublicClient(this);
      const params = {};
      if (opts.start) params.startTime = opts.start;
      if (opts.end) params.endTime = opts.end;
      const result = await getCalendarEvents(client, calId, params);
      console.log(JSON.stringify(result, null, 2));
    });

  cal
    .command('slots <calendarId>')
    .description('Get free slots (availability)')
    .requiredOption('--start <date>', 'Start date (YYYY-MM-DD)')
    .requiredOption('--end <date>', 'End date (YYYY-MM-DD)')
    .option('--duration <minutes>', 'Slot duration in minutes', parseInt, 30)
    .option('--timezone <tz>', 'Timezone (default: UTC)')
    .action(async function(calId, opts) {
      const { client } = buildPublicClient(this);
      const data = {
        startDate: opts.start,
        endDate: opts.end,
        slotDuration: opts.duration,
      };
      if (opts.timezone) data.timezone = opts.timezone;
      const result = await getFreeSlots(client, calId, data);
      console.log(JSON.stringify(result, null, 2));
    });

  cal
    .command('book')
    .description('Book an appointment')
    .requiredOption('--calendar <id>', 'Calendar ID')
    .requiredOption('--contact <id>', 'Contact ID')
    .requiredOption('--title <title>', 'Appointment title')
    .requiredOption('--start <datetime>', 'Start (ISO 8601)')
    .requiredOption('--end <datetime>', 'End (ISO 8601)')
    .option('--timezone <tz>', 'Timezone')
    .action(async function(opts) {
      const { client } = buildPublicClient(this);
      const data = {
        calendarId: opts.calendar,
        contactId: opts.contact,
        title: opts.title,
        startTime: opts.start,
        endTime: opts.end,
      };
      if (opts.timezone) data.timezone = opts.timezone;
      const result = await bookAppointment(client, data);
      if (this.parent.parent.opts().json) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log(`Appointment booked: ${result.id || result.appointment?.id}`);
      }
    });

  cal
    .command('cancel <appointmentId>')
    .description('Cancel an appointment')
    .action(async function(id) {
      const { client } = buildPublicClient(this);
      await cancelAppointment(client, id);
      console.log('Appointment cancelled.');
    });
}
