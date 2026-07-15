import { describe, it, expect, vi, beforeEach } from 'vitest';
import { listCalendars, bookAppointment } from '../commands/calendar.js';

describe('calendar', () => {
  let mockClient;

  beforeEach(() => {
    mockClient = {
      get: vi.fn(),
      post: vi.fn(),
      delete: vi.fn(),
      locationId: 'LOC_ABC',
      CONVERSATIONS_VERSION: '2021-04-15',
    };
  });

  it('listCalendars calls GET /calendars/ with locationId', async () => {
    mockClient.get.mockResolvedValueOnce({ calendars: [{ id: 'cal1', name: 'Main' }] });
    const result = await listCalendars(mockClient);
    expect(mockClient.get).toHaveBeenCalledWith('/calendars/', {
      params: { locationId: 'LOC_ABC' },
      version: '2021-04-15',
    });
    expect(result).toHaveLength(1);
  });

  it('bookAppointment posts with locationId', async () => {
    mockClient.post.mockResolvedValueOnce({ id: 'appt1' });
    await bookAppointment(mockClient, { calendarId: 'cal1', contactId: 'c1', title: 'Call' });
    expect(mockClient.post).toHaveBeenCalledWith('/calendars/appointments', {
      locationId: 'LOC_ABC', calendarId: 'cal1', contactId: 'c1', title: 'Call',
    }, { version: '2021-04-15' });
  });
});
