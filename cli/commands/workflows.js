// Endpoint paths from network inspection.
// GET workflow uses /workflow/{locationId}/{workflowId} (singular, includes locationId in path)
// Steps live in workflowData.templates[]

const LIST_ENDPOINT = '/workflows/copyWorkflow/statusList';

// GET uses singular /workflow/ with locationId in path (not query param)
// The client auto-appends locationId as query param, but this endpoint needs it in the path.
// We handle this by accepting locationId as a parameter.
const GET_ENDPOINT = (locationId, workflowId) =>
  `/workflow/${locationId}/${workflowId}`;

// TBD — update after Capture 3 (add action in GHL UI)
const ADD_ACTION_ENDPOINT = (locationId, workflowId) =>
  `/workflow/${locationId}/${workflowId}/actions`;

export async function listWorkflows(client) {
  const data = await client.get(LIST_ENDPOINT);
  return data.workflows || [];
}

export async function getWorkflow(client, workflowId, locationId) {
  return client.get(GET_ENDPOINT(locationId, workflowId));
}

export async function getWorkflowSteps(client, workflowId, locationId) {
  const workflow = await getWorkflow(client, workflowId, locationId);
  return workflow.workflowData?.templates || [];
}

export async function addAction(client, workflowId, action, locationId) {
  return client.post(ADD_ACTION_ENDPOINT(locationId, workflowId), action);
}
