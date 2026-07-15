// Endpoints confirmed via network inspection.
// GET/PUT workflow: /workflow/{locationId}/{workflowId}
// Steps are in workflowData.templates[]
// Save is a full PUT of the entire workflow object.

import crypto from 'crypto';

const LIST_ENDPOINT = '/workflows/copyWorkflow/statusList';

const WORKFLOW_ENDPOINT = (locationId, workflowId) =>
  `/workflow/${locationId}/${workflowId}`;

export async function listWorkflows(client) {
  const data = await client.get(LIST_ENDPOINT);
  return data.workflows || [];
}

export async function getWorkflow(client, workflowId, locationId) {
  return client.get(WORKFLOW_ENDPOINT(locationId, workflowId));
}

export async function getWorkflowSteps(client, workflowId, locationId) {
  const workflow = await getWorkflow(client, workflowId, locationId);
  return workflow.workflowData?.templates || [];
}

export async function saveWorkflow(client, workflow, locationId, { createdSteps = [], deletedSteps = [], modifiedSteps = [] } = {}) {
  const body = {
    ...workflow,
    createdSteps,
    deletedSteps,
    modifiedSteps,
  };
  return client.put(WORKFLOW_ENDPOINT(locationId, workflow._id || workflow.id), body);
}

// Template builders for supported action types
const TEMPLATE_BUILDERS = {
  add_contact_tag: (data) => ({
    attributes: { tags: Array.isArray(data.tags) ? data.tags : [data.tag] },
    name: `Add Tag "${Array.isArray(data.tags) ? data.tags[0] : data.tag}"`,
    type: 'add_contact_tag',
  }),

  remove_contact_tag: (data) => ({
    attributes: { tags: Array.isArray(data.tags) ? data.tags : [data.tag], type: 'remove_contact_tag' },
    name: `Remove Tag "${Array.isArray(data.tags) ? data.tags[0] : data.tag}"`,
    type: 'remove_contact_tag',
  }),

  update_contact_field: (data) => ({
    attributes: {
      type: 'update_contact_field',
      actionType: 'update_field_data',
      fields: data.fields,
    },
    name: data.name || 'Update contact field',
    type: 'update_contact_field',
  }),

  wait: (data) => ({
    attributes: {
      type: 'time',
      startAfter: {
        type: data.unit || 'minutes',
        value: data.value || data.duration || 0,
        when: 'after',
      },
      name: data.name || `Wait ${data.value || data.duration} ${data.unit || 'minutes'}`,
      cat: '',
      isHybridAction: true,
      hybridActionType: 'wait',
      transitions: [],
    },
    name: data.name || `Wait ${data.value || data.duration} ${data.unit || 'minutes'}`,
    type: 'wait',
  }),

  sms: (data) => ({
    attributes: { body: data.body || data.message, attachments: [] },
    name: data.name || 'Send SMS',
    type: 'sms',
  }),

  webhook: (data) => ({
    attributes: {
      type: 'webhook',
      url: data.url,
      method: data.method || 'POST',
      headers: data.headers || [],
      body: data.body || '',
    },
    name: data.name || 'Webhook',
    type: 'webhook',
  }),
};

function generateId() {
  return crypto.randomUUID();
}

/**
 * Add an action to a workflow via read-modify-write.
 * 1. GET the workflow
 * 2. Build a new template and insert it into workflowData.templates
 * 3. Fix next/order linkage
 * 4. PUT the full workflow back
 */
export async function addAction(client, workflowId, actionSpec, locationId) {
  // 1. Get current workflow
  const workflow = await getWorkflow(client, workflowId, locationId);
  const templates = workflow.workflowData?.templates || [];

  // 2. Build the new template
  const builder = TEMPLATE_BUILDERS[actionSpec.type];
  if (!builder) {
    throw new Error(
      `Unknown action type "${actionSpec.type}". Supported: ${Object.keys(TEMPLATE_BUILDERS).join(', ')}`
    );
  }

  const newId = generateId();
  const built = builder(actionSpec.data);
  const position = actionSpec.position ?? templates.length; // default: append at end

  // 3. Build the template entry
  const newTemplate = {
    id: newId,
    order: position,
    attributes: built.attributes,
    name: built.name,
    type: built.type,
  };

  // Insert into templates array
  // Find the template currently at the target position to wire next/parentKey
  if (templates.length === 0) {
    // First action in workflow — no linkage needed
    templates.push(newTemplate);
  } else if (position === 0) {
    // Inserting at the beginning — new template points to current first
    const currentFirst = templates.find(t => t.order === 0);
    if (currentFirst) {
      newTemplate.next = currentFirst.id;
      currentFirst.parentKey = newId;
    }
    // Shift orders
    for (const t of templates) {
      t.order = t.order + 1;
    }
    newTemplate.order = 0;
    templates.unshift(newTemplate);
  } else {
    // Insert at position — wire between previous and next
    // Sort by order to find neighbors
    const sorted = [...templates].sort((a, b) => a.order - b.order);
    const prevTemplate = sorted[position - 1];

    if (prevTemplate) {
      newTemplate.next = prevTemplate.next;
      newTemplate.parentKey = prevTemplate.id;
      prevTemplate.next = newId;
    }

    // Shift orders for templates at or after the insertion point
    for (const t of templates) {
      if (t.order >= position) {
        t.order = t.order + 1;
      }
    }
    newTemplate.order = position;
    templates.splice(position, 0, newTemplate);
  }

  workflow.workflowData.templates = templates;

  // 4. Save with createdSteps
  const result = await saveWorkflow(client, workflow, locationId, {
    createdSteps: [newId],
  });

  return { id: newId, template: newTemplate, result };
}
