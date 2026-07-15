import { describe, it, expect, vi, beforeEach } from 'vitest';
import { listWorkflows, getWorkflow, getWorkflowSteps, addAction, saveWorkflow } from '../commands/workflows.js';

describe('workflow commands', () => {
  let mockClient;

  beforeEach(() => {
    mockClient = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
    };
  });

  describe('listWorkflows', () => {
    it('calls confirmed workflow list endpoint and returns results', async () => {
      mockClient.get.mockResolvedValueOnce({
        workflows: [
          { id: 'wf1', name: 'Wipe Contact', status: 'published' },
          { id: 'wf2', name: 'Onboarding', status: 'draft' },
        ],
      });

      const result = await listWorkflows(mockClient);

      expect(mockClient.get).toHaveBeenCalledWith('/workflows/');
      expect(result).toHaveLength(2);
    });
  });

  describe('getWorkflow', () => {
    it('calls GET /workflow/{locationId}/{workflowId}', async () => {
      mockClient.get.mockResolvedValueOnce({
        _id: 'wf1',
        name: 'Test Workflow',
        workflowData: { templates: [] },
      });

      const result = await getWorkflow(mockClient, 'wf1', 'LOC_ABC');

      expect(mockClient.get).toHaveBeenCalledWith('/workflow/LOC_ABC/wf1');
      expect(result.name).toBe('Test Workflow');
    });
  });

  describe('getWorkflowSteps', () => {
    it('returns workflowData.templates from the workflow response', async () => {
      mockClient.get.mockResolvedValueOnce({
        _id: 'wf1',
        workflowData: {
          templates: [
            { id: 't1', order: 0, type: 'add_contact_tag' },
            { id: 't2', order: 1, type: 'wait' },
          ],
        },
      });

      const result = await getWorkflowSteps(mockClient, 'wf1', 'LOC_ABC');
      expect(result).toHaveLength(2);
      expect(result[0].type).toBe('add_contact_tag');
    });

    it('returns empty array when workflowData is missing', async () => {
      mockClient.get.mockResolvedValueOnce({ _id: 'wf1' });
      const result = await getWorkflowSteps(mockClient, 'wf1', 'LOC_ABC');
      expect(result).toEqual([]);
    });
  });

  describe('saveWorkflow', () => {
    it('PUTs the full workflow with change tracking fields', async () => {
      mockClient.put.mockResolvedValueOnce({ success: true });

      const workflow = { _id: 'wf1', name: 'Test', workflowData: { templates: [] } };
      await saveWorkflow(mockClient, workflow, 'LOC_ABC', {
        createdSteps: ['new-id'],
        deletedSteps: [],
        modifiedSteps: [],
      });

      expect(mockClient.put).toHaveBeenCalledOnce();
      const [url, body] = mockClient.put.mock.calls[0];
      expect(url).toBe('/workflow/LOC_ABC/wf1');
      expect(body.createdSteps).toEqual(['new-id']);
      expect(body.deletedSteps).toEqual([]);
    });
  });

  describe('addAction', () => {
    it('reads workflow, inserts template, and saves via PUT', async () => {
      // GET returns existing workflow with one template
      mockClient.get.mockResolvedValueOnce({
        _id: 'wf1',
        name: 'Test Workflow',
        locationId: 'LOC_ABC',
        workflowData: {
          templates: [
            { id: 'existing-1', order: 0, type: 'wait', name: 'Wait', next: null },
          ],
        },
      });

      // PUT saves the modified workflow
      mockClient.put.mockResolvedValueOnce({ success: true });

      const result = await addAction(mockClient, 'wf1', {
        type: 'add_contact_tag',
        data: { tag: 'tester' },
      }, 'LOC_ABC');

      // Should have fetched the workflow
      expect(mockClient.get).toHaveBeenCalledWith('/workflow/LOC_ABC/wf1');

      // Should have PUT with full workflow including new template
      expect(mockClient.put).toHaveBeenCalledOnce();
      const [url, body] = mockClient.put.mock.calls[0];
      expect(url).toBe('/workflow/LOC_ABC/wf1');
      expect(body.createdSteps).toHaveLength(1);
      expect(body.createdSteps[0]).toBe(result.id);

      // New template should be in the templates array
      const templates = body.workflowData.templates;
      const newTemplate = templates.find(t => t.id === result.id);
      expect(newTemplate).toBeDefined();
      expect(newTemplate.type).toBe('add_contact_tag');
      expect(newTemplate.attributes.tags).toEqual(['tester']);
    });

    it('inserts at position 0 and shifts existing templates', async () => {
      mockClient.get.mockResolvedValueOnce({
        _id: 'wf1',
        workflowData: {
          templates: [
            { id: 'existing-1', order: 0, type: 'wait', name: 'Wait' },
            { id: 'existing-2', order: 1, type: 'sms', name: 'Send SMS' },
          ],
        },
      });
      mockClient.put.mockResolvedValueOnce({ success: true });

      const result = await addAction(mockClient, 'wf1', {
        type: 'add_contact_tag',
        data: { tag: 'first' },
        position: 0,
      }, 'LOC_ABC');

      const [, body] = mockClient.put.mock.calls[0];
      const templates = body.workflowData.templates;

      // New template should be at order 0
      const newTemplate = templates.find(t => t.id === result.id);
      expect(newTemplate.order).toBe(0);

      // Existing templates should be shifted
      const existing1 = templates.find(t => t.id === 'existing-1');
      expect(existing1.order).toBe(1);
    });

    it('throws on unknown action type', async () => {
      mockClient.get.mockResolvedValueOnce({
        _id: 'wf1',
        workflowData: { templates: [] },
      });

      await expect(addAction(mockClient, 'wf1', {
        type: 'nonexistent_type',
        data: {},
      }, 'LOC_ABC')).rejects.toThrow('Unknown action type');
    });
  });
});
