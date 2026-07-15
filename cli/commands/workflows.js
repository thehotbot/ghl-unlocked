// Endpoint paths: confirmed where known, placeholders where TBD.
// Update placeholders after endpoint discovery.

// CONFIRMED endpoint
const LIST_ENDPOINT = '/workflows/copyWorkflow/statusList';

// TBD endpoints — update after network inspection
const GET_ENDPOINT = (id) => `/workflows/${id}`;
const ADD_ACTION_ENDPOINT = (id) => `/workflows/${id}/actions`;

export async function listWorkflows(client) {
  const data = await client.get(LIST_ENDPOINT);
  return data.workflows || [];
}

export async function getWorkflow(client, workflowId) {
  return client.get(GET_ENDPOINT(workflowId));
}

export async function getWorkflowSteps(client, workflowId) {
  const workflow = await getWorkflow(client, workflowId);
  return workflow.actions || [];
}

export async function addAction(client, workflowId, action) {
  return client.post(ADD_ACTION_ENDPOINT(workflowId), action);
}
