export async function listCalendars(client) {
  const data = await client.get('/calendars/', {
    params: { locationId: client.locationId },
    version: client.CONVERSATIONS_VERSION,
  });
  return data.calendars || [];
}

export async function getCalendarEvents(client, calendarId, params = {}) {
  return client.get(`/calendars/${calendarId}/events`, {
    params,
    version: client.CONVERSATIONS_VERSION,
  });
}

export async function getFreeSlots(client, calendarId, data) {
  return client.post(`/calendars/${calendarId}/free-slots`, data, {
    version: client.CONVERSATIONS_VERSION,
  });
}

export async function bookAppointment(client, data) {
  return client.post('/calendars/appointments', {
    locationId: client.locationId,
    ...data,
  }, { version: client.CONVERSATIONS_VERSION });
}

export async function cancelAppointment(client, id) {
  return client.delete(`/calendars/appointments/${id}`, {
    version: client.CONVERSATIONS_VERSION,
  });
}
