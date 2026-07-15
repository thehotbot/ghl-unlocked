// Surveys via GHL Public API v2
// Base endpoint: /surveys/

export async function listSurveys(client, params = {}) {
  return client.get('/surveys/', { params: { locationId: client.locationId, ...params } });
}

export async function getSurveySubmissions(client, params = {}) {
  return client.get(`/locations/${client.locationId}/surveys/submissions`, { params });
}
