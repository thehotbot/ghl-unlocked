// Endpoints confirmed via network inspection.
// GET/PUT workflow: /workflow/{locationId}/{workflowId}
// Steps are in workflowData.templates[]
// Save is a full PUT of the entire workflow object.

import crypto from 'crypto';

const LIST_ENDPOINT = '/workflows/';

const WORKFLOW_ENDPOINT = (locationId, workflowId) =>
  `/workflow/${locationId}/${workflowId}`;

const CREATE_ENDPOINT = (locationId) => `/workflow/${locationId}`;

export async function createWorkflow(client, name, locationId, { status = 'draft' } = {}) {
  return client.post(CREATE_ENDPOINT(locationId), {
    name,
    status,
    type: 'workflow',
    locationId,
  });
}

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

export async function publishWorkflow(client, workflowId, locationId, publish = true) {
  // Use the proper change-status endpoint
  const result = await changeWorkflowStatus(client, workflowId, locationId, publish ? 'published' : 'draft');

  // If publishing and no triggers exist, add a default one
  if (publish) {
    const workflow = await getWorkflow(client, workflowId, locationId);
    if (!workflow.workflowData?.triggers || workflow.workflowData.triggers.length === 0) {
      const triggerId = crypto.randomUUID();
      if (!workflow.workflowData.triggers) workflow.workflowData.triggers = [];
      workflow.workflowData.triggers.push({
        id: triggerId,
        type: 'contact_changed',
        name: 'Added to Workflow',
        filters: [],
      });
      const templates = workflow.workflowData.templates || [];
      const first = templates.find(t => t.order === 0) || templates[0];
      if (first) first.parentKey = triggerId;
      await saveWorkflow(client, workflow, locationId);
    }
  }

  return result;
}

export async function deleteWorkflow(client, workflowId, locationId) {
  return client.delete(WORKFLOW_ENDPOINT(locationId, workflowId));
}

export async function changeWorkflowStatus(client, workflowId, locationId, status) {
  return client.put(`/workflow/${locationId}/change-status/${workflowId}`, {
    status,
  });
}

export async function cloneWorkflow(client, workflowId, locationId, newName) {
  // Read source workflow
  const source = await getWorkflow(client, workflowId, locationId);

  // Remap all template IDs to new UUIDs
  const idMap = new Map();
  const templates = source.workflowData?.templates || [];
  for (const t of templates) {
    const newId = crypto.randomUUID();
    idMap.set(t.id, newId);
  }

  // Apply remapped IDs
  const remappedTemplates = templates.map(t => {
    const newTemplate = { ...t, id: idMap.get(t.id) };
    if (t.next) {
      if (Array.isArray(t.next)) {
        newTemplate.next = t.next.map(n => idMap.get(n) || n);
      } else {
        newTemplate.next = idMap.get(t.next) || t.next;
      }
    }
    if (t.parentKey && idMap.has(t.parentKey)) {
      newTemplate.parentKey = idMap.get(t.parentKey);
    }
    if (t.parent && idMap.has(t.parent)) {
      newTemplate.parent = idMap.get(t.parent);
    }
    if (t.sibling && Array.isArray(t.sibling)) {
      newTemplate.sibling = t.sibling.map(s => idMap.get(s) || s);
    }
    return newTemplate;
  });

  // Create new workflow with remapped templates
  const result = await client.post(CREATE_ENDPOINT(locationId), {
    name: newName || `${source.name} (Copy)`,
    status: 'draft',
    type: 'workflow',
    locationId,
    workflowData: {
      ...source.workflowData,
      templates: remappedTemplates,
    },
  });

  return result;
}

export async function getWorkflowErrors(client, locationId) {
  return client.get(`/workflow/${locationId}/error-notification/count`);
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
  // ── Original 6 ──────────────────────────────────────────────────────
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

  // ── Communication ───────────────────────────────────────────────────
  email: (data) => ({
    attributes: {
      subject: data.subject || '',
      html: data.html || data.body || '',
      from_name: data.from_name,
      from_email: data.from_email,
      reply_to: data.reply_to,
      attachments: data.attachments || [],
      templateId: data.templateId,
      trackOpens: data.trackOpens !== false,
      trackClicks: data.trackClicks !== false,
    },
    name: data.name || 'Send Email',
    type: 'email',
  }),

  voicemail: (data) => ({
    attributes: {
      audioUrl: data.audioUrl,
      ttsMessage: data.ttsMessage || data.message,
      voiceType: data.voiceType || (data.audioUrl ? 'audio' : 'tts'),
    },
    name: data.name || 'Voicemail Drop',
    type: 'voicemail',
  }),

  manual_call: (data) => ({
    attributes: {
      message: data.message || '',
      userType: data.userType || 'assigned',
      userId: data.userId,
    },
    name: data.name || 'Manual Call',
    type: 'manual_call',
  }),

  internal_notification: (data) => ({
    attributes: {
      type: data.notificationType || data.type || 'email',
      email: data.notificationType === 'email' || !data.notificationType ? {
        subject: data.subject || '',
        html: data.html || data.body || '',
        userType: data.userType || 'assigned',
      } : undefined,
      message: data.message,
      userType: data.userType || 'assigned',
      userId: data.userId,
    },
    name: data.name || 'Send Internal Notification',
    type: 'internal_notification',
  }),

  conversation_ai: (data) => ({
    attributes: { ...data },
    name: data.name || 'Conversation AI',
    type: 'conversation_ai',
  }),

  live_chat_message: (data) => ({
    attributes: { body: data.body || data.message, mediaUrls: data.mediaUrls || [] },
    name: data.name || 'Send Live Chat',
    type: 'live_chat_message',
  }),

  whatsapp: (data) => ({
    attributes: { body: data.body || data.message, mediaUrls: data.mediaUrls || [] },
    name: data.name || 'Send WhatsApp',
    type: 'whatsapp',
  }),

  facebook_messenger: (data) => ({
    attributes: { body: data.body || data.message, mediaUrls: data.mediaUrls || [] },
    name: data.name || 'Send Facebook Message',
    type: 'facebook_messenger',
  }),

  instagram_dm: (data) => ({
    attributes: { body: data.body || data.message, mediaUrls: data.mediaUrls || [] },
    name: data.name || 'Send Instagram DM',
    type: 'instagram_dm',
  }),

  gmb_message: (data) => ({
    attributes: { body: data.body || data.message, mediaUrls: data.mediaUrls || [] },
    name: data.name || 'Send GMB Message',
    type: 'gmb_message',
  }),

  // ── Contact Management ──────────────────────────────────────────────
  create_contact: (data) => ({
    attributes: { ...data },
    name: data.name || 'Create Contact',
    type: 'create_contact',
  }),

  find_contact: (data) => ({
    attributes: { ...data },
    name: data.name || 'Find Contact',
    type: 'find_contact',
  }),

  delete_contact: (data) => ({
    attributes: {},
    name: data.name || 'Delete Contact',
    type: 'delete_contact',
  }),

  assign_user: (data) => ({
    attributes: {
      user_list: Array.isArray(data.users) ? data.users : [data.userId || data.user],
      traffic_split: data.trafficSplit || 'equally',
      only_unassigned_contact: data.onlyUnassigned || false,
      skipIfAssigned: data.skipIfAssigned || false,
    },
    name: data.name || 'Assign to User',
    type: 'assign_user',
  }),

  remove_assigned_user: (data) => ({
    attributes: {},
    name: data.name || 'Remove Assigned User',
    type: 'remove_assigned_user',
  }),

  add_contact_to_dnd: (data) => ({
    attributes: { channel: data.channel || 'all' },
    name: data.name || 'Add to DND',
    type: 'add_contact_to_dnd',
  }),

  remove_contact_from_dnd: (data) => ({
    attributes: { channel: data.channel || 'all' },
    name: data.name || 'Remove from DND',
    type: 'remove_contact_from_dnd',
  }),

  set_dnd: (data) => ({
    attributes: { channel: data.channel || 'all', enabled: data.enabled !== false },
    name: data.name || 'Set DND',
    type: 'set_dnd',
  }),

  add_note: (data) => ({
    attributes: { body: data.body || data.note || data.text },
    name: data.name || 'Add Note',
    type: 'add_note',
  }),

  add_task: (data) => ({
    attributes: {
      title: data.title,
      description: data.description,
      dueDate: data.dueDate,
      assignedTo: data.assignedTo,
    },
    name: data.name || `Add Task "${data.title || ''}"`,
    type: 'add_task',
  }),

  copy_contact: (data) => ({
    attributes: { locationId: data.locationId || data.targetLocation },
    name: data.name || 'Copy Contact',
    type: 'copy_contact',
  }),

  edit_conversation: (data) => ({
    attributes: { action: data.action || 'mark_read' },
    name: data.name || 'Edit Conversation',
    type: 'edit_conversation',
  }),

  // ── Workflow Control ────────────────────────────────────────────────
  if_else: (data) => ({
    attributes: {
      conditions: data.conditions || [],
      matchType: data.matchType || 'all',
      cat: 'conditions',
      nodeType: 'condition-node',
    },
    name: data.name || 'If/Else',
    type: 'if_else',
  }),

  goto: (data) => ({
    attributes: {
      targetId: data.targetId || data.target,
      maxIterations: data.maxIterations || 10,
    },
    name: data.name || 'Go To',
    type: 'goto',
  }),

  add_to_workflow: (data) => ({
    attributes: {
      workflowId: data.workflowId,
      allowMultiple: data.allowMultiple || false,
    },
    name: data.name || 'Add to Workflow',
    type: 'add_to_workflow',
  }),

  remove_from_workflow: (data) => ({
    attributes: {
      allWorkflows: data.allWorkflows || false,
      includeCurrent: data.includeCurrent || false,
      workflowId: data.workflowId || '',
    },
    name: data.name || 'Remove from Workflow',
    type: 'remove_from_workflow',
  }),

  goal_event: (data) => ({
    attributes: { goalName: data.goalName || data.goal, goalValue: data.goalValue },
    name: data.name || `Goal: ${data.goalName || data.goal || ''}`,
    type: 'goal_event',
  }),

  end: (data) => ({
    attributes: {},
    name: data.name || 'End',
    type: 'end',
  }),

  split: (data) => ({
    attributes: {
      splitType: data.splitType || 'percentage',
      paths: data.paths || [{ name: 'Path A', percentage: 50 }, { name: 'Path B', percentage: 50 }],
    },
    name: data.name || 'A/B Split',
    type: 'split',
  }),

  drip: (data) => ({
    attributes: { batchSize: data.batchSize || 1, interval: data.interval || 60 },
    name: data.name || 'Drip Mode',
    type: 'drip',
  }),

  custom_code: (data) => ({
    attributes: {
      code: data.code,
      language: data.language || 'javascript',
      timeout: data.timeout || 30,
    },
    name: data.name || 'Custom Code',
    type: 'custom_code',
  }),

  math_operation: (data) => ({
    attributes: { ...data },
    name: data.name || 'Math Operation',
    type: 'math_operation',
  }),

  // ── Pipeline / Opportunity ──────────────────────────────────────────
  internal_create_opportunity: (data) => ({
    attributes: {
      pipelineId: data.pipelineId || data.pipeline,
      stageId: data.stageId || data.stage,
      name: data.opportunityName || data.dealName || '{{contact.first_name}} {{contact.last_name}}',
      monetaryValue: data.monetaryValue || data.value,
      source: data.source || 'workflow',
      assignedTo: data.assignedTo,
      status: data.status || 'open',
      tags: data.tags || [],
    },
    name: data.name || 'Create Opportunity',
    type: 'internal_create_opportunity',
  }),

  internal_update_opportunity: (data) => ({
    attributes: {
      pipelineId: data.pipelineId || data.pipeline,
      pipelineStageId: data.stageId || data.stage,
      allowBackward: data.allowBackward || false,
      status: data.status,
      monetaryValue: data.monetaryValue || data.value,
    },
    name: data.name || 'Update Opportunity',
    type: 'internal_update_opportunity',
  }),

  find_opportunity: (data) => ({
    attributes: {
      sorting: data.sorting || 'latest',
      __customInputFields__: data.filters || [],
      cat: 'multi-path',
      convertToMultipath: true,
      transitions: data.transitions || [
        { id: crypto.randomUUID(), name: 'Found' },
        { id: crypto.randomUUID(), name: 'Not Found' },
      ],
    },
    name: data.name || 'Find Opportunity',
    type: 'find_opportunity',
  }),

  delete_opportunity: (data) => ({
    attributes: { pipelineId: data.pipelineId || data.pipeline },
    name: data.name || 'Delete Opportunity',
    type: 'delete_opportunity',
  }),

  remove_opportunity: (data) => ({
    attributes: { pipelineId: data.pipelineId || data.pipeline },
    name: data.name || 'Remove Opportunity',
    type: 'remove_opportunity',
  }),

  // ── Integrations ───────────────────────────────────────────────────
  slack_message: (data) => ({
    attributes: {
      channel: data.channel || { id: data.channelId, name: data.channelName },
      text: data.text || data.message || data.body,
      action: data.action || { id: '', name: '' },
      integration: data.integration || { id: data.integrationId, name: data.integrationName },
    },
    name: data.name || 'Send Slack Message',
    type: 'slack_message',
  }),

  google_sheets: (data) => ({
    attributes: {
      spreadsheetId: data.spreadsheetId,
      sheetName: data.sheetName,
      action: data.action || 'append',
      columns: data.columns || [],
      integration: data.integration || { id: data.integrationId, name: data.integrationName },
      lookupColumn: data.lookupColumn,
      lookupValue: data.lookupValue,
    },
    name: data.name || 'Google Sheets',
    type: 'google_sheets',
  }),

  // ── Payments ────────────────────────────────────────────────────────
  send_invoice: (data) => ({
    attributes: { ...data },
    name: data.name || 'Send Invoice',
    type: 'send_invoice',
  }),

  stripe_one_time_charge: (data) => ({
    attributes: {
      amount: data.amount,
      currency: data.currency || 'usd',
      description: data.description,
      integration: data.integration || { id: data.integrationId },
    },
    name: data.name || 'Stripe Charge',
    type: 'stripe_one_time_charge',
  }),

  // ── AI ──────────────────────────────────────────────────────────────
  ai_prompt: (data) => ({
    attributes: { ...data },
    name: data.name || 'AI Prompt',
    type: 'ai_prompt',
  }),

  // ── Appointments ────────────────────────────────────────────────────
  update_appointment_status: (data) => ({
    attributes: { status: data.status },
    name: data.name || `Update Appointment: ${data.status || ''}`,
    type: 'update_appointment_status',
  }),

  booking_link: (data) => ({
    attributes: { calendarId: data.calendarId },
    name: data.name || 'Generate Booking Link',
    type: 'booking_link',
  }),

  // ── Marketing ───────────────────────────────────────────────────────
  fb_conversion_api: (data) => ({
    attributes: {
      eventName: data.eventName || 'Lead',
      pixelId: data.pixelId,
      customData: data.customData || {},
      integration: data.integration || { id: data.integrationId },
    },
    name: data.name || 'Facebook Conversion',
    type: 'fb_conversion_api',
  }),

  // ── IVR ─────────────────────────────────────────────────────────────
  ivr_gather_input: (data) => ({
    attributes: { ...data },
    name: data.name || 'Gather Input on Call',
    type: 'ivr_gather_input',
  }),

  ivr_play_message: (data) => ({
    attributes: { message: data.message, audioUrl: data.audioUrl },
    name: data.name || 'Play Message',
    type: 'ivr_play_message',
  }),

  ivr_connect_call: (data) => ({
    attributes: { ...data },
    name: data.name || 'Connect Call',
    type: 'ivr_connect_call',
  }),

  ivr_end_call: (data) => ({
    attributes: {},
    name: data.name || 'End Call',
    type: 'ivr_end_call',
  }),

  // ── Review ──────────────────────────────────────────────────────────
  send_review_request: (data) => ({
    attributes: { ...data },
    name: data.name || 'Send Review Request',
    type: 'send_review_request',
  }),

  // ── Courses ─────────────────────────────────────────────────────────
  course_grant_offer: (data) => ({
    attributes: { offerId: data.offerId },
    name: data.name || 'Grant Course Access',
    type: 'course_grant_offer',
  }),

  course_revoke_offer: (data) => ({
    attributes: { offerId: data.offerId },
    name: data.name || 'Revoke Course Access',
    type: 'course_revoke_offer',
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
