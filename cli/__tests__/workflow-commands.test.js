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
    it('calls GET with workflow ID and returns full workflow', async () => {
      mockClient.get.mockResolvedValueOnce({
        id: 'wf1',
        name: 'Wipe Contact',
        actions: [{ id: 'a1', type: 'add_contact_tag' }],
      });

      const result = await getWorkflow(mockClient, 'wf1');

      expect(mockClient.get).toHaveBeenCalledWith('/workflows/wf1');
      expect(result.name).toBe('Wipe Contact');
    });
  });

  describe('getWorkflowSteps', () => {
    it('returns only the actions array from a workflow', async () => {
      mockClient.get.mockResolvedValueOnce({
        id: 'wf1',
        name: 'Wipe Contact',
        actions: [
          { id: 'a1', type: 'add_contact_tag', data: { tag: 'tester' } },
          { id: 'a2', type: 'wait', data: { duration: 60 } },
        ],
      });

      const result = await getWorkflowSteps(mockClient, 'wf1');

      expect(result).toHaveLength(2);
      expect(result[0].type).toBe('add_contact_tag');
    });
  });

  describe('addAction', () => {
    it('POSTs new action to workflow', async () => {
      mockClient.post.mockResolvedValueOnce({ id: 'a_new', type: 'add_contact_tag' });

      const result = await addAction(mockClient, 'wf1', {
        type: 'add_contact_tag',
        data: { tag: 'tester' },
      });

      expect(mockClient.post).toHaveBeenCalledWith('/workflows/wf1/actions', {
        type: 'add_contact_tag',
        data: { tag: 'tester' },
      });
      expect(result.id).toBe('a_new');
    });
  });
});
