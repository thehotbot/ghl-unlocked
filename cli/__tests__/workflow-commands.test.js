import { describe, it, expect, vi, beforeEach } from 'vitest';
import { listWorkflows, getWorkflow, getWorkflowSteps, addAction } from '../commands/workflows.js';

describe('workflow commands', () => {
  let mockClient;

  beforeEach(() => {
    mockClient = {
      get: vi.fn(),
      post: vi.fn(),
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

      expect(mockClient.get).toHaveBeenCalledWith('/workflows/copyWorkflow/statusList');
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Wipe Contact');
    });
  });

  describe('getWorkflow', () => {
    it('calls GET /workflow/{locationId}/{workflowId}', async () => {
      mockClient.get.mockResolvedValueOnce({
        _id: 'wf1',
        name: '0 - Start GPT DBR',
        status: 'published',
        workflowData: { templates: [] },
      });

      const result = await getWorkflow(mockClient, 'wf1', 'LOC_ABC');

      expect(mockClient.get).toHaveBeenCalledWith('/workflow/LOC_ABC/wf1');
      expect(result.name).toBe('0 - Start GPT DBR');
    });
  });

  describe('getWorkflowSteps', () => {
    it('returns workflowData.templates from the workflow response', async () => {
      mockClient.get.mockResolvedValueOnce({
        _id: 'wf1',
        name: 'Test Workflow',
        workflowData: {
          templates: [
            {
              id: 'aaf5a03f',
              order: 0,
              name: 'Update contact field',
              type: 'update_contact_field',
              attributes: { type: 'update_contact_field' },
              next: '4ec550aa',
            },
            {
              id: '4ec550aa',
              order: 1,
              name: 'yes',
              type: 'if_else',
              attributes: { conditionName: 'Tester?' },
              next: ['branch1', 'branch2'],
            },
          ],
        },
      });

      const result = await getWorkflowSteps(mockClient, 'wf1', 'LOC_ABC');

      expect(result).toHaveLength(2);
      expect(result[0].type).toBe('update_contact_field');
      expect(result[1].type).toBe('if_else');
    });

    it('returns empty array when workflowData is missing', async () => {
      mockClient.get.mockResolvedValueOnce({
        _id: 'wf1',
        name: 'Empty Workflow',
      });

      const result = await getWorkflowSteps(mockClient, 'wf1', 'LOC_ABC');
      expect(result).toEqual([]);
    });
  });

  describe('addAction', () => {
    it('POSTs new action to workflow', async () => {
      mockClient.post.mockResolvedValueOnce({ id: 'a_new', type: 'add_contact_tag' });

      const result = await addAction(mockClient, 'wf1', {
        type: 'add_contact_tag',
        data: { tag: 'tester' },
      }, 'LOC_ABC');

      expect(mockClient.post).toHaveBeenCalledWith('/workflow/LOC_ABC/wf1/actions', {
        type: 'add_contact_tag',
        data: { tag: 'tester' },
      });
      expect(result.id).toBe('a_new');
    });
  });
});
